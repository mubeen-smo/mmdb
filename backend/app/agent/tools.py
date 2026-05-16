from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.item.models import Item
from app.place.models import Place


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


async def search_places(
    db: AsyncSession,
    query: str | None = None,
    area: str | None = None,
    place_type: str | None = None,
    veg_friendly: bool | None = None,
    limit: int = 5,
) -> list[dict]:
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

    stmt = stmt.order_by(Place.place_name).limit(min(limit, 10))
    rows = await db.execute(stmt)
    return [_place_dict(p) for p in rows.scalars().all()]


async def search_items(
    db: AsyncSession,
    query: str | None = None,
    diet: str | None = None,
    course: str | None = None,
    meal_time: str | None = None,
    signature: bool | None = None,
    place_id: int | None = None,
    limit: int = 8,
) -> list[dict]:
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
        stmt = stmt.where(Item.place_id == place_id)

    stmt = stmt.order_by(Item.item_rating.desc().nulls_last()).limit(min(limit, 10))
    rows = await db.execute(stmt)
    return [_item_dict(i) for i in rows.scalars().all()]


async def list_areas(db: AsyncSession) -> list[str]:
    rows = await db.execute(
        select(Place.area)
        .where(Place.area.is_not(None))
        .distinct()
        .order_by(Place.area)
    )
    return [r[0] for r in rows.all()]
