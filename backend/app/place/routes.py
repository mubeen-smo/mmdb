from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.place.models import Place
from app.place.schemas import PlaceDetailOut, PlaceListOut, PlaceOut

router = APIRouter(prefix="/places", tags=["places"])


@router.get("", response_model=PlaceListOut)
async def list_places(
    q: str | None = Query(None, description="Search by place name"),
    place_type: str | None = Query(None, alias="type", description="Filter by type: restaurant, cafe, food-court …"),
    limit: int = Query(100, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    base = select(Place)

    if q:
        base = base.where(Place.place_name.ilike(f"%{q}%"))
    if place_type:
        base = base.where(Place.place_type == place_type)

    total_result = await db.execute(select(func.count()).select_from(base.subquery()))
    total = total_result.scalar_one()

    result = await db.execute(
        base.order_by(Place.place_name).offset(offset).limit(limit)
    )
    places = result.scalars().all()

    return PlaceListOut(total=total, items=places)


@router.get("/{place_id}", response_model=PlaceDetailOut)
async def get_place(place_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Place)
        .options(selectinload(Place.dishes))
        .where(Place.place_id == place_id)
    )
    place = result.scalar_one_or_none()
    if place is None:
        raise HTTPException(status_code=404, detail="Place not found")
    return place
