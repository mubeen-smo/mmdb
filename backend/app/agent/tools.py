"""
Database tool functions for the MMDb agent.

Each function is one "tool" the LLM can call. They all take an AsyncSession
and return plain dicts/lists so they can be JSON-serialised and fed back to the model.

The agent loop calls these directly after parsing the model's TOOL: output lines.
No API-level tool calling is used — these are plain Python async functions.
"""

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.item.models import Item
from app.place.models import Place


# ---------------------------------------------------------------------------
# Serialisers — convert ORM objects to plain dicts for the model to read
# ---------------------------------------------------------------------------

def _place_dict(p: Place) -> dict:
    """Flatten a Place ORM row into a dict the model can reason about."""
    return {
        "place_id": p.place_id,
        "place_name": p.place_name,
        "area": p.area,
        "place_type": p.place_type,
        "cuisines": p.cuisines,
        "price_tier": p.price_tier,       # 1=budget, 2=mid, 3=premium
        "veg_friendly": p.veg_friendly,
        "vibe": p.vibe,
        "good_for": p.good_for,
        "meal_periods": p.meal_periods,
        "description": (p.description or "")[:200],  # truncate to save tokens
        "ambience_rating": p.ambience_rating,
        "service_rating": p.service_rating,
        "open_time": p.open_time,
    }


def _item_dict(i: Item) -> dict:
    """Flatten an Item ORM row into a dict the model can reason about."""
    return {
        "item_id": i.item_id,
        "place_id": i.place_id,
        "item": i.item,
        "place_name": i.place_name,
        "diet": i.diet,                    # "veg" | "non_veg" | "egg"
        "course": i.course,                # list e.g. ["main"]
        "meal_time": i.meal_time,          # list e.g. ["lunch", "dinner"]
        "price": float(i.price) if i.price is not None else None,
        "signature": i.signature,          # True = must-try item
        "item_rating": i.item_rating,
        "description": (i.description or "")[:200],
    }


# ---------------------------------------------------------------------------
# Tool 1: search_places
# Keyword search across place name, description, and tags.
# Supports optional filters: area, place_type, veg_friendly.
# ---------------------------------------------------------------------------

async def search_places(
    db: AsyncSession,
    query: str | None = None,
    area: str | None = None,
    place_type: str | None = None,
    veg_friendly: bool | None = None,
    limit: int = 5,
) -> list[dict]:
    limit = min(limit, 10)
    stmt = select(Place)

    if query:
        # ilike = case-insensitive LIKE — searches name, description, tags
        stmt = stmt.where(
            or_(
                Place.place_name.ilike(f"%{query}%"),
                Place.description.ilike(f"%{query}%"),
                Place.tags.ilike(f"%{query}%"),
            )
        )
    if area:
        stmt = stmt.where(Place.area.ilike(f"%{area}%"))
    if place_type:
        stmt = stmt.where(Place.place_type.ilike(f"%{place_type}%"))
    if veg_friendly is not None:
        stmt = stmt.where(Place.veg_friendly == veg_friendly)

    stmt = stmt.order_by(Place.place_name).limit(limit)
    result = await db.execute(stmt)
    return [_place_dict(p) for p in result.scalars().all()]


# ---------------------------------------------------------------------------
# Tool 2: search_items
# Keyword search across item name and description.
# Supports optional filters: diet, course, meal_time, signature, place_id.
# ---------------------------------------------------------------------------

async def search_items(
    db: AsyncSession,
    query: str | None = None,
    diet: str | None = None,
    course: str | None = None,
    meal_time: str | None = None,
    signature: bool | None = None,
    place_id: int | None = None,
    limit: int = 5,
) -> list[dict]:
    limit = min(limit, 10)
    stmt = select(Item)

    if query:
        stmt = stmt.where(
            or_(
                Item.item.ilike(f"%{query}%"),
                Item.description.ilike(f"%{query}%"),
            )
        )
    if diet:
        stmt = stmt.where(Item.diet == diet)
    if course:
        # .any() checks if the value exists in the PostgreSQL TEXT[] array column
        stmt = stmt.where(Item.course.any(course))
    if meal_time:
        stmt = stmt.where(Item.meal_time.any(meal_time))
    if signature is not None:
        stmt = stmt.where(Item.signature == signature)
    if place_id is not None:
        stmt = stmt.where(Item.place_id == place_id)

    # Best-rated items first; nulls go to the end
    stmt = stmt.order_by(Item.item_rating.desc().nulls_last()).limit(limit)
    result = await db.execute(stmt)
    return [_item_dict(i) for i in result.scalars().all()]


# ---------------------------------------------------------------------------
# Tool 3: get_place
# Fetch one place by ID including its full menu (all items via relationship).
# Used when the agent needs complete detail after finding a place via search.
# ---------------------------------------------------------------------------

async def get_place(db: AsyncSession, place_id: int) -> dict | None:
    from sqlalchemy.orm import selectinload

    # selectinload issues a second query to load items — avoids N+1
    result = await db.execute(
        select(Place)
        .options(selectinload(Place.items))
        .where(Place.place_id == place_id)
    )
    p = result.scalar_one_or_none()
    if p is None:
        return None
    data = _place_dict(p)
    data["items"] = [_item_dict(i) for i in p.items]
    return data


# ---------------------------------------------------------------------------
# Tool 4: get_item
# Fetch one item by its composite primary key (item_id + place_id).
# ---------------------------------------------------------------------------

async def get_item(db: AsyncSession, item_id: int, place_id: int) -> dict | None:
    result = await db.execute(
        select(Item).where(Item.item_id == item_id, Item.place_id == place_id)
    )
    i = result.scalar_one_or_none()
    return _item_dict(i) if i else None


# ---------------------------------------------------------------------------
# Tool 5: list_areas
# Returns all distinct neighbourhoods that have at least one place.
# Useful when the user asks "what areas do you cover?"
# ---------------------------------------------------------------------------

async def list_areas(db: AsyncSession) -> list[str]:
    result = await db.execute(
        select(Place.area)
        .where(Place.area.is_not(None))
        .distinct()
        .order_by(Place.area)
    )
    return [row[0] for row in result.all()]


# ---------------------------------------------------------------------------
# Tool 6: search_blogs
# Keyword search over published Maven Munch blog posts.
# Falls back to empty list if the blogs table doesn't exist yet.
# ---------------------------------------------------------------------------

async def search_blogs(db: AsyncSession, query: str, limit: int = 3) -> list[dict]:
    limit = min(limit, 5)
    try:
        from app.blog.models import Blog

        stmt = (
            select(Blog)
            .where(
                or_(
                    Blog.title.ilike(f"%{query}%"),
                    Blog.subtitle.ilike(f"%{query}%"),
                    Blog.tags.any(query),
                )
            )
            .where(Blog.status == "published")
            .order_by(Blog.published_at.desc())
            .limit(limit)
        )
        result = await db.execute(stmt)
        blogs = result.scalars().all()
        return [
            {
                "blog_id": b.blog_id,
                "slug": b.slug,
                "title": b.title,
                "subtitle": b.subtitle,
                "tags": b.tags,
                "published_at": str(b.published_at) if b.published_at else None,
            }
            for b in blogs
        ]
    except Exception:
        # Blogs table may not exist yet — silently return empty
        return []
