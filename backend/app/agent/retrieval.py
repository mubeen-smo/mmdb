import math
import os

from openai import AsyncOpenAI
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.tools import search_items, search_places

EMBED_MODEL = "text-embedding-3-small"


async def _embed_query(query: str) -> list[float]:
    client = AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])
    resp = await client.embeddings.create(model=EMBED_MODEL, input=query)
    return resp.data[0].embedding


def _vec_str(vec: list[float]) -> str:
    return "[" + ",".join(str(x) for x in vec) + "]"


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2))
         * math.sin(dlng / 2) ** 2)
    return R * 2 * math.asin(math.sqrt(a))


def _proximity_score(distance_km: float) -> float:
    return 1 / (1 + distance_km)


async def _semantic_items(db: AsyncSession, vec: list[float], limit: int = 8) -> list[dict]:
    rows = await db.execute(
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
        {"vec": _vec_str(vec), "limit": limit},
    )
    return [dict(r) for r in rows.mappings().all()]


async def _semantic_places(db: AsyncSession, vec: list[float], limit: int = 5) -> list[dict]:
    rows = await db.execute(
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
        {"vec": _vec_str(vec), "limit": limit},
    )
    return [dict(r) for r in rows.mappings().all()]


def _score_items(
    items: list[dict],
    base_sim: float = 0.5,
) -> list[dict]:
    for i in items:
        sim = float(i.get("similarity") or base_sim)
        rating = float(i.get("item_rating") or 5.0)
        i["final_score"] = sim + (rating / 10.0) * 0.3
    return items


def _score_places(
    places: list[dict],
    base_sim: float = 0.5,
    user_lat: float | None = None,
    user_lng: float | None = None,
) -> list[dict]:
    for p in places:
        sim = float(p.get("similarity") or base_sim)
        ambience = float(p.get("ambience_rating") or 5.0)
        service = float(p.get("service_rating") or 5.0)
        rating_score = ((ambience + service) / 2) / 10.0 * 0.3

        proximity = 0.0
        if user_lat and user_lng and p.get("latitude") and p.get("longitude"):
            dist = _haversine_km(user_lat, user_lng, p["latitude"], p["longitude"])
            proximity = _proximity_score(dist) * 0.2

        p["final_score"] = sim + rating_score + proximity
    return places


def _merge_items(semantic: list[dict], keyword: list[dict]) -> list[dict]:
    seen: set[tuple] = set()
    merged: list[dict] = []
    for item in _score_items(semantic):
        key = (item["item_id"], item["place_id"])
        if key not in seen:
            seen.add(key)
            merged.append(item)
    for item in _score_items(keyword, base_sim=0.5):
        key = (item["item_id"], item["place_id"])
        if key not in seen:
            seen.add(key)
            merged.append(item)
    merged.sort(key=lambda x: x["final_score"], reverse=True)
    return merged


def _merge_places(
    semantic: list[dict],
    keyword: list[dict],
    user_lat: float | None = None,
    user_lng: float | None = None,
) -> list[dict]:
    seen: set[int] = set()
    merged: list[dict] = []
    for place in _score_places(semantic, user_lat=user_lat, user_lng=user_lng):
        if place["place_id"] not in seen:
            seen.add(place["place_id"])
            merged.append(place)
    for place in _score_places(keyword, base_sim=0.5, user_lat=user_lat, user_lng=user_lng):
        if place["place_id"] not in seen:
            seen.add(place["place_id"])
            merged.append(place)
    merged.sort(key=lambda x: x["final_score"], reverse=True)
    return merged


async def hybrid_retrieve(
    db: AsyncSession,
    query: str,
    user_lat: float | None = None,
    user_lng: float | None = None,
) -> tuple[list[dict], list[dict]]:
    # Embed the query first — network call to OpenAI, no DB involved
    query_vec = await _embed_query(query)

    # DB queries must run sequentially — SQLAlchemy async sessions
    # do not permit concurrent operations on the same session
    keyword_places = await search_places(db, query=query, limit=5)
    keyword_items = await search_items(db, query=query, limit=8)
    semantic_places = await _semantic_places(db, query_vec, limit=5)
    semantic_items = await _semantic_items(db, query_vec, limit=8)

    places = _merge_places(semantic_places, keyword_places, user_lat, user_lng)
    items = _merge_items(semantic_items, keyword_items)

    return places, items
