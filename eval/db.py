"""Ground-truth lookups against the live MMDb database.

Used by the judge to verify that every place/dish the bot names actually
exists — the core anti-hallucination check.
"""
import os

import asyncpg


def _dsn() -> str | None:
    raw = os.environ.get("DATABASE_URL")
    if not raw:
        return None
    # The backend stores a SQLAlchemy asyncpg URL; asyncpg.connect wants a plain DSN.
    return raw.replace("postgresql+asyncpg://", "postgresql://").replace(
        "postgres+asyncpg://", "postgresql://"
    )


async def load_known_names() -> set[str] | None:
    """Return a set of lowercased place and item names, or None if no DB configured."""
    dsn = _dsn()
    if not dsn:
        return None

    conn = await asyncpg.connect(dsn, ssl="require", statement_cache_size=0)
    try:
        places = await conn.fetch("SELECT place_name FROM places_table")
        items = await conn.fetch("SELECT item FROM items_table")
    finally:
        await conn.close()

    names: set[str] = set()
    for r in places:
        if r["place_name"]:
            names.add(r["place_name"].strip().lower())
    for r in items:
        if r["item"]:
            names.add(r["item"].strip().lower())
    return names
