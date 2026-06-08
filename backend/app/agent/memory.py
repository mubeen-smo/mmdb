import json
from datetime import datetime, timedelta, timezone

from sqlalchemy import DateTime, Text, delete, select
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    conversation_id: Mapped[str] = mapped_column(Text, primary_key=True)
    messages: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )


async def load_conversation(db: AsyncSession, conversation_id: str) -> list[dict]:
    """Return the stored message array, or an empty list if not found."""
    row = await db.get(Conversation, conversation_id)
    return list(row.messages) if row else []


async def save_conversation(
    db: AsyncSession,
    conversation_id: str,
    messages: list[dict],
) -> None:
    """Upsert the full message array for a conversation."""
    row = await db.get(Conversation, conversation_id)
    if row is None:
        row = Conversation(conversation_id=conversation_id, messages=messages)
        db.add(row)
    else:
        row.messages = messages
    await db.commit()


async def cleanup_old_conversations(db: AsyncSession) -> int:
    """Delete conversations older than 7 days. Returns count deleted."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    result = await db.execute(
        delete(Conversation).where(Conversation.created_at < cutoff)
    )
    await db.commit()
    return result.rowcount
