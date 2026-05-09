from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dish.models import Dish
from app.dish.schemas import DishListOut, DishOut

router = APIRouter(prefix="/dishes", tags=["dishes"])


@router.get("", response_model=DishListOut)
async def list_dishes(
    q: str | None = Query(None, description="Search by dish name"),
    tags: str | None = Query(None, description="Filter by tag: veg or non-veg"),
    place_id: int | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    base = select(Dish)

    if q:
        base = base.where(Dish.item.ilike(f"%{q}%"))
    if tags:
        base = base.where(Dish.tags == tags)
    if place_id is not None:
        base = base.where(Dish.place_id == place_id)

    total_result = await db.execute(select(func.count()).select_from(base.subquery()))
    total = total_result.scalar_one()

    result = await db.execute(
        base.order_by(Dish.item_rating.desc().nulls_last(), Dish.item)
        .offset(offset)
        .limit(limit)
    )
    dishes = result.scalars().all()

    return DishListOut(total=total, items=dishes)


@router.get("/{item_id}", response_model=DishOut)
async def get_dish(item_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Dish).where(Dish.item_id == item_id))
    dish = result.scalar_one_or_none()
    if dish is None:
        raise HTTPException(status_code=404, detail="Dish not found")
    return dish
