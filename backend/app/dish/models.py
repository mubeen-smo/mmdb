from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Float, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.place.models import Place


class Dish(Base):
    __tablename__ = "items_table"

    item_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    item: Mapped[str | None] = mapped_column(Text)
    place_name: Mapped[str | None] = mapped_column(Text)
    place_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("places_table.place_id"), primary_key=True)
    item_rating: Mapped[float | None] = mapped_column(Float)
    description: Mapped[str | None] = mapped_column(Text)
    tags: Mapped[str | None] = mapped_column(Text)

    place: Mapped["Place"] = relationship(back_populates="dishes")
