from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.place.models import Place
from app.place.schemas import PlaceDetailOut, PlaceListOut, PlaceOut

router = APIRouter(prefix="/places", tags=["places"])


def _haversine_km(lat: float, lng: float):
    """SQLAlchemy expression: distance in km from a fixed point to places_table rows."""
    return text("""
        6371 * acos(
          cos(radians(:lat)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(:lng)) +
          sin(radians(:lat)) * sin(radians(latitude))
        )
    """).bindparams(lat=lat, lng=lng)


@router.get("", response_model=PlaceListOut)
async def list_places(
    q: str | None = Query(None),
    area: str | None = Query(None),
    place_type: str | None = Query(None, alias="type"),
    veg_friendly: bool | None = Query(None),
    lat: float | None = Query(None, description="User latitude — sorts results by distance"),
    lng: float | None = Query(None, description="User longitude — sorts results by distance"),
    limit: int = Query(100, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    base = select(Place)

    if q:
        base = base.where(Place.place_name.ilike(f"%{q}%"))
    if area:
        base = base.where(Place.area.ilike(area))
    if place_type:
        base = base.where(Place.place_type == place_type)
    if veg_friendly is not None:
        base = base.where(Place.veg_friendly == veg_friendly)

    total_result = await db.execute(select(func.count()).select_from(base.subquery()))
    total = total_result.scalar_one()

    if lat is not None and lng is not None:
        # nearest first; places without coordinates fall to the end
        base = base.order_by(
            Place.latitude.is_(None),
            _haversine_km(lat, lng),
        )
    else:
        base = base.order_by(Place.place_name)

    result = await db.execute(base.offset(offset).limit(limit))
    return PlaceListOut(total=total, items=result.scalars().all())


@router.get("/{place_id}", response_model=PlaceDetailOut)
async def get_place(place_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Place)
        .options(selectinload(Place.items))
        .where(Place.place_id == place_id)
    )
    place = result.scalar_one_or_none()
    if place is None:
        raise HTTPException(status_code=404, detail="Place not found")
    return place
