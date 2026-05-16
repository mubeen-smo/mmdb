from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.item.models import Item
from app.item.schemas import ItemListOut, ItemOut

router = APIRouter(prefix="/items", tags=["items"])


@router.get("", response_model=ItemListOut)
async def list_items(
    q: str | None = Query(None, description="Search by item name"),
    diet: str | None = Query(None, description="veg | non_veg | vegan | egg"),
    place_id: int | None = Query(None),
    signature: bool | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    base = select(Item)

    if q:
        base = base.where(Item.item.ilike(f"%{q}%"))
    if diet:
        base = base.where(Item.diet == diet)
    if place_id is not None:
        base = base.where(Item.place_id == place_id)
    if signature is not None:
        base = base.where(Item.signature == signature)

    total_result = await db.execute(select(func.count()).select_from(base.subquery()))
    total = total_result.scalar_one()

    result = await db.execute(
        base.order_by(Item.item_rating.desc().nulls_last(), Item.item)
        .offset(offset)
        .limit(limit)
    )
    return ItemListOut(total=total, items=result.scalars().all())


@router.get("/{item_id}", response_model=ItemOut)
async def get_item(item_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Item).where(Item.item_id == item_id))
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item
