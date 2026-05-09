from app.dish.schemas import DishOut
from pydantic import BaseModel, Field


class PlaceOut(BaseModel):
    place_id: int
    place_name: str
    location: str | None
    description: str | None
    ambience_rating: float | None
    service_rating: float | None
    type: str | None = Field(None, validation_alias="place_type")
    open_time: str | None
    tags: str | None
    area_tags: str | None

    model_config = {"from_attributes": True, "populate_by_name": True}


class PlaceDetailOut(PlaceOut):
    dishes: list[DishOut] = []


class PlaceListOut(BaseModel):
    total: int
    items: list[PlaceOut]
