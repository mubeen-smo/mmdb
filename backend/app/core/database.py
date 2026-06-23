from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

engine = create_async_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=3,          # keep connections warm; free tier doesn't need more
    max_overflow=2,       # allow brief spikes
    pool_recycle=300,     # recycle before Supabase's idle timeout (~600s)
    pool_timeout=10,      # fail fast if no connection available
    connect_args={