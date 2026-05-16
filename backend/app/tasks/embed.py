import hashlib
import logging
import os

from openai import AsyncOpenAI
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.item.models import Item
from app.place.models import Place

logger = logging.getLogger(__name__)

EMBED_MODEL = "text-embedding-3-small"
BATCH = 32


def _get_client() -> AsyncOpenAI:
    return AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])


async def _embed(texts: list[str]) -> list[list[float]]:
    resp = await _get_client().embeddings.create(model=EMBED_MODEL, input=texts)
    return [item.embedding for item in resp.data]


def _hash(text: str) -> str:
    return hashlib.md5(text.encode()).hexdigest()


def _price_label(tier) -> str:
    return {1: "budget", 2: "mid-range", 3: "premium"}.get(tier, "")


# ---------------------------------------------------------------------------
# Document builders — same logic as .helpers/build_embeddings.py
# ---------------------------------------------------------------------------

def _place_doc(p: Place, sig_items: str | None, other_items: str | None) -> str:
    parts = [
        f"{p.place_name}.",
        f"{p.place_type or ''} | {p.area or ''} | {_price_label(p.price_tier)}.",
        ", ".join(p.cuisines or []) + "." if p.cuisines else "",
    ]
    if p.vibe:
        parts.append(f"Vibe: {', '.join(p.vibe)}.")
    if p.good_for:
        parts.append(f"Good for: {', '.join(p.good_for)}.")
    if p.meal_periods:
        parts.append(f"Open for: {', '.join(p.meal_periods)}.")
    if p.veg_friendly:
        parts.append("Veg friendly.")
    if sig_items:
        parts.append(f"Must try: {sig_items}.")
    if other_items:
        parts.append(f"Also on the menu: {other_items}.")
    if p.description:
        parts.append(p.description[:200])
    if p.tags:
        parts.append(f"Tags: {p.tags}.")
    return " ".join(p for p in parts if p)


def _item_doc(i: Item) -> str:
    parts = [
        f"{i.item} at {i.place_name}.",
        f"{i.diet or ''} | {', '.join(i.course or [])} | {', '.join(i.meal_time or [])}.",
    ]
    if i.item_rating:
        parts.append(f"Rating: {i.item_rating}/10.")
    if i.signature:
        parts.append("Signature dish.")
    if i.description:
        parts.append(i.description[:200])
    if i.tags:
        parts.append(f"Tags: {i.tags}.")
    return " ".join(p for p in parts if p)


# ---------------------------------------------------------------------------
# Delta helpers
# ---------------------------------------------------------------------------

async def _existing_item_keys(db: AsyncSession) -> set[tuple[int, int]]:
    result = await db.execute(
        text("SELECT source_id, source_id2 FROM embeddings WHERE source_type = 'item'")
    )
    return {(r[0], r[1]) for r in result.all()}


async def _existing_place_hashes(db: AsyncSession) -> dict[int, str]:
    result = await db.execute(
        text("SELECT source_id, meta FROM embeddings WHERE source_type = 'place'")
    )
    return {
        r[0]: (r[1] or {}).get("content_hash", "")
        for r in result.all()
    }


# ---------------------------------------------------------------------------
# Upsert
# ---------------------------------------------------------------------------

async def _upsert(db: AsyncSession, rows: list[dict], vecs: list[list[float]]):
    import json
    for row, vec in zip(rows, vecs):
        vec_str = "[" + ",".join(str(x) for x in vec) + "]"
        await db.execute(
            text("""
                INSERT INTO embeddings
                  (source_type, source_id, source_id2, chunk_idx, text, embedding, meta, updated_at)
                VALUES
                  (:source_type, :source_id, :source_id2, :chunk_idx,
                   :text, :vec ::vector, :meta ::jsonb, now())
                ON CONFLICT (source_type, source_id, coalesce(source_id2, -1), chunk_idx) DO UPDATE SET
                  text       = EXCLUDED.text,
                  embedding  = EXCLUDED.embedding,
                  meta       = EXCLUDED.meta,
                  updated_at = now()
            """),
            {**{k: v for k, v in row.items() if k != "meta"},
             "meta": json.dumps(row["meta"]),
             "vec": vec_str},
        )


# ---------------------------------------------------------------------------
# Core task
# ---------------------------------------------------------------------------

async def _embed_places(db: AsyncSession):
    result = await db.execute(
        text("""
            SELECT
                p.place_id,
                string_agg(i.item || ' ' || i.item_rating::text, ', ')
                    FILTER (WHERE i.signature = true AND i.item_rating IS NOT NULL) AS sig_items,
                string_agg(i.item, ', ')
                    FILTER (WHERE i.signature IS NOT TRUE) AS other_items
            FROM places_table p
            LEFT JOIN items_table i USING (place_id)
            GROUP BY p.place_id
        """)
    )
    menu_map = {r[0]: (r[1], r[2]) for r in result.all()}

    places_result = await db.execute(select(Place).order_by(Place.place_id))
    places = places_result.scalars().all()
    existing_hashes = await _existing_place_hashes(db)

    delta = []
    for p in places:
        sig, other = menu_map.get(p.place_id, (None, None))
        doc = _place_doc(p, sig, other)
        doc_hash = _hash(doc)
        if existing_hashes.get(p.place_id) != doc_hash:
            delta.append((p, doc, doc_hash))

    if not delta:
        logger.info("embed_places: all up to date")
        return

    logger.info("embed_places: %d to embed (%d unchanged)", len(delta), len(places) - len(delta))
    batch_r, batch_t = [], []
    for p, doc, doc_hash in delta:
        batch_r.append({
            "source_type": "place", "source_id": p.place_id,
            "source_id2": None, "chunk_idx": 0, "text": doc,
            "meta": {"place_name": p.place_name, "content_hash": doc_hash},
        })
        batch_t.append(doc)
        if len(batch_t) >= BATCH:
            await _upsert(db, batch_r, await _embed(batch_t))
            logger.info("  embedded %d places", len(batch_t))
            batch_r, batch_t = [], []
    if batch_t:
        await _upsert(db, batch_r, await _embed(batch_t))
        logger.info("  embedded %d places", len(batch_t))


async def _embed_items(db: AsyncSession):
    items_result = await db.execute(select(Item).order_by(Item.item_id, Item.place_id))
    items = items_result.scalars().all()
    existing = await _existing_item_keys(db)

    delta = [i for i in items if (i.item_id, i.place_id) not in existing]

    if not delta:
        logger.info("embed_items: all up to date")
        return

    logger.info("embed_items: %d to embed (%d already embedded)", len(delta), len(items) - len(delta))
    batch_r, batch_t = [], []
    for i in delta:
        doc = _item_doc(i)
        batch_r.append({
            "source_type": "item", "source_id": i.item_id,
            "source_id2": i.place_id, "chunk_idx": 0, "text": doc,
            "meta": {
                "item": i.item,
                "item_rating": float(i.item_rating) if i.item_rating else None,
            },
        })
        batch_t.append(doc)
        if len(batch_t) >= BATCH:
            await _upsert(db, batch_r, await _embed(batch_t))
            logger.info("  embedded %d items", len(batch_t))
            batch_r, batch_t = [], []
    if batch_t:
        await _upsert(db, batch_r, await _embed(batch_t))
        logger.info("  embedded %d items", len(batch_t))


async def run_embedding_job():
    """
    Entry point called by the scheduler.
    Opens its own DB session — independent of any HTTP request lifecycle.
    """
    logger.info("Embedding job started")
    async with AsyncSessionLocal() as db:
        try:
            await _embed_places(db)
            await _embed_items(db)
            await db.commit()
            logger.info("Embedding job complete")
        except Exception:
            await db.rollback()
            logger.exception("Embedding job failed")
