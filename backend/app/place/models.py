from typing import TYPE_CHECKING

from sqlalchemy import ARRAY, BigInteger, Boolean, Float, SmallInteger, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.item.models import Item


class Place(Base):
    __tablename__ = "places_table"

    place_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    place_name: Mapped[str | None] = mapped_column(Text)
    location: Mapped[str | None] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(Text)
    ambience_rating: Mapped[float | None] = mapped_column(Float)
    service_rating: Mapped[float | None] = mapped_column(Float)
    place_type: Mapped[str | None] = mapped_column("type", Text)
    open_time: Mapped[str | None] = mapped_column(Text)
    tags: Mapped[str | None] = mapped_column(Text)
    area_tags: Mapped[str | None] = mapped_column(Text)

    area: Mapped[str | None] = mapped_column(Text)
    cuisines: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    price_tier: Mapped[int | None] = mapped_column(SmallInteger)
    meal_periods: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    good_for: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    vibe: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    veg_friendly: Mapped[bool | None] = mapped_column(Boolean)
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)

    items: Mapped[list["Item"]] = relationship(back_populates="place")
