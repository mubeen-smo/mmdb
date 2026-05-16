import os

from openai import AsyncOpenAI
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.retrieval import hybrid_retrieve

MODEL = "llama-3.3-70b-versatile"

SYSTEM = """\
You are MMDb Maven, an editorial food guide for Hyderabad, India.

You will be given search results retrieved from the MMDb database.
Write a recommendation based only on those results — never add places or dishes not listed.

Style:
- Direct and opinionated, like a trusted food critic
- Place and dish names in **bold**
- Lead with your single best pick, briefly explain why
- Bullet list for alternatives, 3–4 max
- If results are empty, say so and suggest the user rephrase
- Prices in ₹ | Price tier: 1 = budget, 2 = mid-range, 3 = premium
"""


def _format_places(places: list[dict]) -> str:
    if not places:
        return "None found."
    lines = []
    for p in places:
        cuisines = ", ".join(p.get("cuisines") or []) or "—"
        lines.append(
            f"• {p['place_name']} (ID {p['place_id']}) | {p.get('area')} | "
            f"{p.get('place_type')} | {cuisines} | "
            f"tier: {p.get('price_tier')} | veg: {p.get('veg_friendly')} | "
            f"ambience: {p.get('ambience_rating')} | service: {p.get('service_rating')}"
        )
    return "\n".join(lines)


def _format_items(items: list[dict]) -> str:
    if not items:
        return "None found."
    lines = []
    for i in items:
        sig = " ★" if i.get("signature") else ""
        lines.append(
            f"• {i['item']}{sig} at {i['place_name']} | "
            f"rating: {i.get('item_rating')}/10 | "
            f"diet: {i.get('diet')} | ₹{i.get('price')}"
        )
    return "\n".join(lines)


def _build_context(query: str, places: list[dict], items: list[dict]) -> str:
    return (
        f"User asked: {query}\n\n"
        "=== MMDB DATABASE RESULTS ===\n\n"
        f"PLACES ({len(places)}):\n{_format_places(places)}\n\n"
        f"ITEMS ({len(items)}, sorted by relevance and rating):\n{_format_items(items)}\n\n"
        "=== END ===\n"
        "Answer using only the above data."
    )


async def run_pipeline(
    messages: list[dict],
    db: AsyncSession,
    user_lat: float | None = None,
    user_lng: float | None = None,
) -> str:
    query = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
    if not query:
        return "I didn't receive a question. Please try again."

    places, items = await hybrid_retrieve(db, query, user_lat, user_lng)
    context = _build_context(query, places, items)

    llm_messages = [
        {"role": "system",    "content": SYSTEM},
        {"role": "user",      "content": context},
        {"role": "assistant", "content": "Understood. I will answer using only these results."},
        *messages,
    ]

    client = AsyncOpenAI(
        api_key=os.environ["GROQ_API_KEY"],
        base_url="https://api.groq.com/openai/v1",
    )

    response = await client.chat.completions.create(
        model=MODEL,
        messages=llm_messages,
        max_tokens=1024,
        temperature=0.4,
    )

    return response.choices[0].message.content or "No answer generated. Try rephrasing."
