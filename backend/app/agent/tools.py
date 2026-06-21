import json
import logging
import math
import os

from openai import AsyncOpenAI
from sqlalchemy import or_, select, text
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

from app.item.models import Item
from app.place.models import Place

EMBED_MODEL = "text-embedding-3-small"

_openai_client: AsyncOpenAI | None = None


def _get_openai() -> AsyncOpenAI:
    global _openai_client
    if _openai_client is None:
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY is not set")
        _openai_client = AsyncOpenAI(api_key=api_key)
    return _openai_client


async def _embed(query: str) -> list[float]:
    resp = await _get_openai().embeddings.create(model=EMBED_MODEL, input=query)
    return resp.data[0].embedding


def _vec_str(vec: list[float]) -> str:
    return "[" + ",".join(str(x) for x in vec) + "]"


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlng / 2) ** 2
    )
    return R * 2 * math.asin(math.sqrt(a))


def _proximity_score(distance_km: float) -> float:
    return 1 / (1 + distance_km)


def _place_dict(p: Place) -> dict:
    return {
        "place_id": p.place_id,
        "place_name": p.place_name,
        "area": p.area,
        "place_type": p.place_type,
        "cuisines": p.cuisines,
        "price_tier": p.price_tier,
        "veg_friendly": p.veg_friendly,
        "vibe": p.vibe,
        "good_for": p.good_for,
        "meal_periods": p.meal_periods,
        "ambience_rating": p.ambience_rating,
        "service_rating": p.service_rating,
        "open_time": p.open_time,
        "description": (p.description or "")[:200],
        # included for scoring; stripped before LLM output
        "latitude": p.latitude,
        "longitude": p.longitude,
    }


def _item_dict(i: Item) -> dict:
    return {
        "item_id": i.item_id,
        "place_id": i.place_id,
        "item": i.item,
        "place_name": i.place_name,
        "diet": i.diet,
        "course": i.course,
        "meal_time": i.meal_time,
        "price": float(i.price) if i.price else None,
        "signature": i.signature,
        "item_rating": i.item_rating,
        "description": (i.description or "")[:200],
    }


AREA_RADIUS_KM = 8


async def _resolve_area_centroid(
    db: AsyncSession, area: str
) -> tuple[float, float] | None:
    """Return (avg_lat, avg_lng) for places in the named area, or None."""
    result = await db.execute(
        text("""
            SELECT AVG(latitude) AS lat, AVG(longitude) AS lng
            FROM places_table
            WHERE area ILIKE :area
              AND latitude IS NOT NULL
              AND longitude IS NOT NULL
        """),
        {"area": f"%{area}%"},
    )
    row = result.mappings().first()
    if row and row["lat"] is not None:
        return float(row["lat"]), float(row["lng"])
    return None


async def search_places(
    db: AsyncSession,
    query: str | None = None,
    area: str | None = None,
    place_type: str | None = None,
    veg_friendly: bool | None = None,
    limit: int = 5,
    user_lat: float | None = None,
    user_lng: float | None = None,
) -> list[dict]:
    fetch = min(limit * 2, 20)

    # Priority: named area centroid > user GPS > nothing
    ref_lat: float | None = None
    ref_lng: float | None = None
    _ref_from_area = False

    if area is not None:
        centroid = await _resolve_area_centroid(db, area)
        if centroid is not None:
            ref_lat, ref_lng = centroid
            _ref_from_area = True
    elif user_lat is not None and user_lng is not None:
        ref_lat, ref_lng = user_lat, user_lng

    # 1. Keyword search
    stmt = select(Place)
    if query:
        stmt = stmt.where(or_(
            Place.place_name.ilike(f"%{query}%"),
            Place.description.ilike(f"%{query}%"),
            Place.tags.ilike(f"%{query}%"),
        ))
    if area:
        stmt = stmt.where(Place.area.ilike(f"%{area}%"))
    if place_type:
        stmt = stmt.where(Place.place_type.ilike(f"%{place_type}%"))
    if veg_friendly is not None:
        stmt = stmt.where(Place.veg_friendly == veg_friendly)
    stmt = stmt.limit(fetch)
    rows = await db.execute(stmt)
    keyword_places = [_place_dict(p) for p in rows.scalars().all()]

    # 2. Semantic search
    semantic_places: list[dict] = []
    if query:
        try:
            vec = _vec_str(await _embed(query))
            sem_rows = await db.execute(
                text("""
                    SELECT
                        p.place_id, p.place_name, p.area,
                        p.type AS place_type, p.cuisines,
                        p.price_tier, p.veg_friendly, p.vibe, p.good_for,
                        p.meal_periods, p.ambience_rating, p.service_rating,
                        p.open_time, p.latitude, p.longitude,
                        LEFT(p.description, 200) AS description,
                        1 - (e.embedding <=> :vec ::vector) AS similarity
                    FROM embeddings e
                    JOIN places_table p ON p.place_id = e.source_id
                    WHERE e.source_type = 'place'
                    ORDER BY e.embedding <=> :vec ::vector
                    LIMIT :limit
                """),
                {"vec": vec, "limit": fetch},
            )
            semantic_places = [dict(r) for r in sem_rows.mappings().all()]
        except Exception as exc:
            logger.warning("Embedding failed, using keyword-only search: %s", exc)

    # 3. Score
    def _score(places: list[dict], base_sim: float = 0.5) -> list[dict]:
        for p in places:
            sim = float(p.get("similarity") or base_sim)
            ambience = float(p.get("ambience_rating") or 5.0)
            service = float(p.get("service_rating") or 5.0)
            rating_score = ((ambience + service) / 2) / 10.0 * 0.3
            proximity = 0.0
            p["_dist_km"] = None
            if (
                ref_lat is not None
                and ref_lng is not None
                and p.get("latitude") is not None
                and p.get("longitude") is not None
            ):
                dist = _haversine_km(ref_lat, ref_lng, float(p["latitude"]), float(p["longitude"]))
                p["_dist_km"] = dist
                proximity = _proximity_score(dist) * 0.2
            p["final_score"] = sim + rating_score + proximity
        return places

    # 4. Merge (semantic first — higher-quality scores; keyword fills gaps)
    seen: set[int] = set()
    merged: list[dict] = []
    for p in _score(semantic_places):
        if p["place_id"] not in seen:
            seen.add(p["place_id"])
            merged.append(p)
    for p in _score(keyword_places, base_sim=0.5):
        if p["place_id"] not in seen:
            seen.add(p["place_id"])
            merged.append(p)
    merged.sort(key=lambda x: x["final_score"], reverse=True)

    # Hard radius cut for named-area queries; GPS queries stay weight-only
    if _ref_from_area:
        merged = [
            p for p in merged
            if p["_dist_km"] is None or p["_dist_km"] <= AREA_RADIUS_KM
        ]

    merged = merged[:limit]

    # 5. Strip internal fields before returning to LLM
    for p in merged:
        p.pop("latitude", None)
        p.pop("longitude", None)
        p.pop("similarity", None)
        p.pop("final_score", None)
        p.pop("_dist_km", None)

    return merged


async def search_items(
    db: AsyncSession,
    query: str | None = None,
    diet: str | None = None,
    course: str | None = None,
    meal_time: str | None = None,
    signature: bool | None = None,
    place_id: int | list[int] | None = None,
    limit: int = 8,
    # server-side injected — not in LLM tool schema
    user_lat: float | None = None,
    user_lng: float | None = None,
) -> list[dict]:
    fetch = min(limit * 2, 20)

    VALID_DIETS = {"veg", "non_veg", "egg"}
    if diet is not None and diet not in VALID_DIETS:
        diet = None

    # 1. Keyword search
    stmt = select(Item)
    if query:
        stmt = stmt.where(or_(
            Item.item.ilike(f"%{query}%"),
            Item.description.ilike(f"%{query}%"),
        ))
    if diet:
        stmt = stmt.where(Item.diet == diet)
    if course:
        stmt = stmt.where(Item.course.any(course))
    if meal_time:
        stmt = stmt.where(Item.meal_time.any(meal_time))
    if signature is not None:
        stmt = stmt.where(Item.signature == signature)
    if place_id is not None:
        if isinstance(place_id, list):
            stmt = stmt.where(Item.place_id.in_(place_id))
        else:
            stmt = stmt.where(Item.place_id == place_id)
    stmt = stmt.limit(fetch)
    rows = await db.execute(stmt)
    keyword_items = [_item_dict(i) for i in rows.scalars().all()]

    # 2. Semantic search
    semantic_items: list[dict] = []
    if query:
        try:
            vec = _vec_str(await _embed(query))
            sem_rows = await db.execute(
                text("""
                    SELECT
                        i.item_id, i.place_id, i.item, i.place_name,
                        i.diet, i.course, i.meal_time, i.price,
                        i.signature, i.item_rating,
                        LEFT(i.description, 200) AS description,
                        1 - (e.embedding <=> :vec ::vector) AS similarity
                    FROM embeddings e
                    JOIN items_table i
                      ON i.item_id = e.source_id AND i.place_id = e.source_id2
                    WHERE e.source_type = 'item'
                    ORDER BY e.embedding <=> :vec ::vector
                    LIMIT :limit
                """),
                {"vec": vec, "limit": fetch},
            )
            semantic_items = [dict(r) for r in sem_rows.mappings().all()]
        except Exception as exc:
            logger.warning("Embedding failed, using keyword-only search: %s", exc)

    # 3. Score
    def _score(items: list[dict], base_sim: float = 0.5) -> list[dict]:
        for i in items:
            sim = float(i.get("similarity") or base_sim)
            rating = float(i.get("item_rating") or 5.0)
            i["final_score"] = sim + (rating / 10.0) * 0.3
        return items

    # 4. Merge
    seen: set[tuple] = set()
    merged: list[dict] = []
    for i in _score(semantic_items):
        key = (i["item_id"], i["place_id"])
        if key not in seen:
            seen.add(key)
            merged.append(i)
    for i in _score(keyword_items, base_sim=0.5):
        key = (i["item_id"], i["place_id"])
        if key not in seen:
            seen.add(key)
            merged.append(i)
    merged.sort(key=lambda x: x["final_score"], reverse=True)
    merged = merged[:limit]

    # 5. Strip internal fields
    for i in merged:
        i.pop("similarity", None)
        i.pop("final_score", None)

    return merged


async def list_areas(db: AsyncSession) -> list[str]:
    rows = await db.execute(
        select(Place.area)
        .where(Place.area.is_not(None))
        .distinct()
        .order_by(Place.area)
    )
    return [r[0] for r in rows.all()]
