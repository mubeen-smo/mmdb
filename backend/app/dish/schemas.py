from pydantic import BaseModel


class DishOut(BaseModel):
    item_id: int
    item: str
    place_name: str | None
    place_id: int | None
    item_rating: float | None
    description: str | None
    tags: str | None

    model_config = {"from_attributes": True}


class DishListOut(BaseModel):
    total: int
    items: list[DishOut]
