"""
MMDb Maven — Phase 1 RAG implementation.

Pattern: Retrieve → Augment → Generate
  1. Extract the user's query from the conversation.
  2. Run keyword search against places and items in Supabase.
  3. Inject the retrieved results into the LLM's context window.
  4. Single LLM call — model reads the context and writes the answer.

Why this is better than tool-calling:
  - Retrieval is deterministic (always happens, no model cooperation needed).
  - The model's only job is to write well — it never has to decide what to search.
  - Works reliably with any LLM, free or paid.

Phase 2 will add semantic (embedding) search alongside this keyword search.
Phase 3 will merge both with re-ranking (hybrid RAG).
"""

import json
import os

from openai import AsyncOpenAI
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.tools import search_items, search_places

# Using Groq's OpenAI-compatible endpoint.
# The model is only asked to read context and write prose — not to call tools —
# so even a smaller, free model handles this reliably.
MODEL = "llama-3.3-70b-versatile"

SYSTEM = """\
You are MMDb Maven, an editorial food guide for Hyderabad, India.
You help people find great places to eat and dishes to try — strictly from the MMDb database.

You will be given search results retrieved from the database. Your job is to:
1. Read the results carefully.
2. Write a concise, opinionated recommendation based only on that data.
3. Never add places or dishes that are not in the results.
4. If the results are empty, say so honestly and suggest the user rephrase.

Style:
- Editorial and direct — like a trusted critic, not a directory.
- Place and dish names in **bold**.
- Lead with your top pick. Briefly say why.
- Bullet list for alternatives (max 4).
- Prices in ₹. Price tiers: 1 = budget, 2 = mid-range, 3 = premium.
- Keep it concise — no filler sentences.
"""


def _format_places(places: list[dict]) -> str:
    """Render place results as readable text for the LLM context."""
    if not places:
        return "No matching places found."
    lines = []
    for p in places:
        cuisines = ", ".join(p.get("cuisines") or []) or "—"
        line = (
            f"- {p['place_name']} (ID:{p['place_id']}) | {p.get('area','?')} | "
            f"{p.get('place_type','?')} | cuisines: {cuisines} | "
            f"price tier: {p.get('price_tier','?')} | "
            f"veg: {p.get('veg_friendly','?')} | "
            f"ambience: {p.get('ambience_rating','?')} | "
            f"service: {p.get('service_rating','?')}"
        )
        if p.get("description"):
            line += f"\n  {p['description']}"
        lines.append(line)
    return "\n".join(lines)


def _format_items(items: list[dict]) -> str:
    """Render item results as readable text for the LLM context."""
    if not items:
        return "No matching items found."
    lines = []
    for i in items:
        line = (
            f"- {i['item']} at {i['place_name']} (item_id:{i['item_id']}, place_id:{i['place_id']}) | "
            f"rating: {i.get('item_rating','?')} | "
            f"diet: {i.get('diet','?')} | "
            f"price: ₹{i.get('price','?')} | "
            f"signature: {i.get('signature', False)}"
        )
        if i.get("description"):
            line += f"\n  {i['description']}"
        lines.append(line)
    return "\n".join(lines)


def _build_context(places: list[dict], items: list[dict]) -> str:
    """
    Build the retrieval context that gets injected into the LLM prompt.
    This is the 'Augmentation' step in RAG.
    """
    return (
        "=== RETRIEVED FROM MMDB DATABASE ===\n\n"
        f"PLACES ({len(places)} results):\n{_format_places(places)}\n\n"
        f"ITEMS ({len(items)} results):\n{_format_items(items)}\n\n"
        "=== END OF DATABASE RESULTS ===\n\n"
        "Answer based only on the above results."
    )


def _extract_query(messages: list[dict]) -> str:
    """Get the latest user message — this becomes the search query."""
    for msg in reversed(messages):
        if msg["role"] == "user":
            return msg["content"]
    return ""


async def run_agent(messages: list[dict], db: AsyncSession) -> str:
    # ── Step 1: Retrieval ─────────────────────────────────────────────────────
    # Always search before calling the LLM.
    # We search both places and items with the user's raw query.
    # Phase 2 will replace/supplement this with vector similarity search.

    query = _extract_query(messages)

    places, items = await _retrieve(db, query)

    # ── Step 2: Augmentation ──────────────────────────────────────────────────
    # Inject retrieved results into the conversation as a system-level context block.

    context = _build_context(places, items)

    # Build messages: system prompt + retrieval context + conversation history
    augmented_messages = [
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": context},           # context injected here
        {"role": "assistant", "content": "Understood. I will answer using only these results."},
        *messages,                                       # actual conversation history
    ]

    # ── Step 3: Generation ────────────────────────────────────────────────────
    # Single LLM call. The model reads the context and writes prose.
    # No tool calls, no loops, no format parsing.

    client = AsyncOpenAI(
        api_key=os.environ["GROQ_API_KEY"],
        base_url="https://api.groq.com/openai/v1",
    )

    response = await client.chat.completions.create(
        model=MODEL,
        messages=augmented_messages,
        max_tokens=1024,
        temperature=0.4,   # low temp = more factual, less creative hallucination
    )

    return response.choices[0].message.content or "No results found. Try rephrasing."


async def _retrieve(db: AsyncSession, query: str) -> tuple[list[dict], list[dict]]:
    """
    Keyword retrieval from Postgres.

    Runs place and item searches in parallel (both use the same raw query).
    Returns up to 5 places and 8 items — enough context without overloading the prompt.

    Phase 2 will add: embed(query) → pgvector cosine search → merge with these results.
    """
    import asyncio
    places, items = await asyncio.gather(
        search_places(db, query=query, limit=5),
        search_items(db, query=query, limit=8),
    )
    return places, items
