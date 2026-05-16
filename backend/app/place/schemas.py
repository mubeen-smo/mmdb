from pydantic import BaseModel, Field

from app.item.schemas import ItemOut


class PlaceOut(BaseModel):
    place_id: int
    place_name: str | None
    location: str | None
    description: str | None
    ambience_rating: float | None
    service_rating: float | None
    type: str | None = Field(None, validation_alias="place_type")
    open_time: str | None
    tags: str | None
    area_tags: str | None
    area: str | None
    cuisines: list[str] | None
    price_tier: int | None
    meal_periods: list[str] | None
    good_for: list[str] | None
    vibe: list[str] | None
    veg_friendly: bool | None
    latitude: float | None
    longitude: float | None

    model_config = {"from_attributes": True, "populate_by_name": True}


class PlaceDetailOut(PlaceOut):
    items: list[ItemOut] = []


class PlaceListOut(BaseModel):
    total: int
    items: list[PlaceOut]
