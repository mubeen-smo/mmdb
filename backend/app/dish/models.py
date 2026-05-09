from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.place.models import Place


class Dish(Base):
    __tablename__ = "dishes"

    item_id: Mapped[int] = mapped_column(primary_key=True)
    item: Mapped[str] = mapped_column(Text)
    place_name: Mapped[str | None] = mapped_column(Text)
    place_id: Mapped[int | None] = mapped_column(ForeignKey("places.place_id"))
    item_rating: Mapped[float | None] = mapped_column(Numeric(3, 1))
    description: Mapped[str | None] = mapped_column(Text)
    tags: Mapped[str | None] = mapped_column(Text)

    place: Mapped["Place"] = relationship(back_populates="dishes")
