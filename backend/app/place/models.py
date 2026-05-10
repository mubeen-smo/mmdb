from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Float, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.dish.models import Dish


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

    dishes: Mapped[list["Dish"]] = relationship(back_populates="place")
