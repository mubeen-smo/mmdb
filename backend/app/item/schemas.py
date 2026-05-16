from pydantic import BaseModel


class ItemOut(BaseModel):
    item_id: int
    item: str | None
    place_name: str | None
    place_id: int
    item_rating: float | None
    description: str | None
    tags: str | None
    diet: str | None
    course: list[str] | None
    meal_time: list[str] | None
    price: float | None
    signature: bool | None

    model_config = {"from_attributes": True}


class ItemListOut(BaseModel):
    total: int
    items: list[ItemOut]
