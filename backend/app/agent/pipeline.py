import json
import logging
import os
import re
import time

from openai import AsyncOpenAI, BadRequestError
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

from app.agent.memory import cleanup_old_conversations, load_conversation, save_conversation
from app.agent.tool_defs import TOOL_DEFINITIONS
from app.agent.tools import list_areas, search_items, search_places

MODEL = "openai/gpt-oss-120b"
MAX_ROUNDS = 4
ITEM_SCOPE_PLACES = 10
MAX_HISTORY_MESSAGES = 8

_OCCASION_WORDS = {"date", "romantic", "family", "anniversary", "celebration", "celebrate", "birthday", "special"}

SYSTEM = (
    "You are MMDb Maven, an editorial food guide for Hyderabad, India.\n"
    "\n"
    "STRICT GROUNDING RULE\n"
    "You may ONLY name places and dishes that appear verbatim in the\n"
    "tool results returned to you in this conversation turn.\n"
    "- If a tool returned 3 places, your response may mention at most those 3 places.\n"
    "- Never invent dish names, variety names, or item descriptions.\n"
    "- If tool results are sparse or empty, say so directly.\n"
    "- Brand names must NEVER appear unless a tool explicitly returned them.\n"
    "- Do not volunteer suggestions beyond what tools returned.\n"
    "\n"
    "Tool selection rules (follow these exactly):\n"
    "- DISH queries (biryani, haleem, desserts, what to eat, recommend a dish, etc.):\n"
    "  call search_items with the dish/food as the query. This returns dish-level ratings.\n"
    "- PLACE queries (where to eat, best restaurant, cafe recommendations, etc.):\n"
    "  call search_places.\n"
    "- When unsure: prefer search_items. It surfaces both the dish and which place serves it.\n"
    "- For location-scoped dish queries (biryani near Madhapur): call search_places with\n"
    "  the area first, then call search_items with the top place_id values from that result.\n"
    "\n"
    "Location handling:\n"
    "- When the user mentions a specific area, pass that area name in the area\n"
    "  argument of search_places. Results are automatically ranked by proximity.\n"
    "- GPS coordinates are only sent when the user says 'near me'. The system\n"
    "  injects them automatically.\n"
    "- Never mention coordinates, proximity scoring, or radius filtering to the user.\n"
    "\n"
    "Style:\n"
    "- Direct and opinionated, like a trusted food critic\n"
    "- Place and dish names in **bold**\n"
    "- Lead with your single best pick, briefly explain why\n"
    "- Bullet list for alternatives, 3-4 max\n"
    "- When showing dish results, mention the place it is served at\n"
    "- If tool results are empty, say so and suggest the user rephrase\n"
    "- Never mention prices, price tiers, or cost in your responses\n"
)

_groq_client: AsyncOpenAI | None = None


def _get_groq() -> AsyncOpenAI:
    global _groq_client
    if _groq_client is None:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY is not set")
        _groq_client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1",
        )
    return _groq_client


def _slim_for_llm(results: list[dict], occasion: bool = False) -> list[dict]:
    slimmed = []
    for r in results:
        if "item" in r:
            slimmed.append({
                "item": r.get("item"),
                "place_name": r.get("place_name"),
                "diet": r.get("diet"),
                "price": r.get("price"),
                "signature": r.get("signature"),
                "description": str(r.get("description") or "")[:100],
            })
        else:
            entry: dict = {
                "place_name": r.get("place_name"),
                "area": r.get("area"),
                "place_type": r.get("place_type"),
                "veg_friendly": r.get("veg_friendly"),
                "price_tier": r.get("price_tier"),
                "rating": round(
                    (float(r.get("ambience_rating") or 5) + float(r.get("service_rating") or 5)) / 2, 1
                ),
                "description": str(r.get("description") or "")[:100],
            }
            if occasion:
                entry["vibe"] = r.get("vibe")
                entry["good_for"] = r.get("good_for")
            slimmed.append(entry)
    return slimmed


async def _dispatch_tool(
    name: str,
    args: dict,
    db: AsyncSession,
    user_lat: float | None,
    user_lng: float | None,
) -> str:
    if name == "search_places":
        result = await search_places(
            db,
            user_lat=user_lat,
            user_lng=user_lng,
            **args,
        )
    elif name == "search_items":
        reference_area = args.get("reference_area")
        has_location = (
            (reference_area and reference_area.strip())
            or (user_lat is not None and user_lng is not None)
        )
        if has_location:
            place_ids = await search_places(
                db,
                area=reference_area,
                user_lat=user_lat,
                user_lng=user_lng,
                return_ids_only=True,
                limit=ITEM_SCOPE_PLACES,
            )
            if place_ids:
                args["place_id"] = place_ids
        result = await search_items(
            db,
            user_lat=user_lat,
            user_lng=user_lng,
            **args,
        )
    elif name == "list_areas":
        result = await list_areas(db)
    else:
        result = {"error": f"Unknown tool: {name}"}

    is_empty = (isinstance(result, list) and not result) or (
        isinstance(result, dict)
        and any(isinstance(result.get(k), list) and not result[k] for k in ("places", "items", "results"))
    )
    if is_empty:
        result = {
            "results": [],
            "note": "No matching records found in the MMDb database. Tell the user nothing matched; do not invent place or dish names.",
        }
    elif isinstance(result, list) and name in ("search_places", "search_items"):
        occasion = name == "search_places" and bool(
            _OCCASION_WORDS & set((args.get("query") or "").lower().split())
        )
        result = _slim_for_llm(result, occasion=occasion)[:4]

    return json.dumps(result, ensure_ascii=False, default=str)


def _extract_bolded(text_str: str) -> list[str]:
    return re.findall(r'\*\*([^*]+)\*\*', text_str)


async def _unknown_names(db: AsyncSession, names: list[str]) -> list[str]:
    if not names:
        return []
    unions = " UNION ALL ".join(
        "SELECT :n{i} AS matched FROM places_table WHERE place_name ILIKE :n{i} "
        "UNION ALL SELECT :n{i} FROM items_table WHERE item ILIKE :n{i}".format(i=i)
        for i in range(len(names))
    )
    params = {"n{}".format(i): name for i, name in enumerate(names)}
    result = await db.execute(
        text("SELECT DISTINCT matched FROM ({}) AS t".format(unions)),
        params,
    )
    found = {r[0].lower() for r in result.all()}
    return [n for n in names if n.lower() not in found]


async def run_pipeline(
    messages: list[dict],
    db: AsyncSession,
    user_lat: float | None = None,
    user_lng: float | None = None,
    conversation_id: str | None = None,
) -> tuple[str, str | None]:
    history: list[dict] = []
    if conversation_id:
        history = await load_conversation(db, conversation_id)
        await cleanup_old_conversations(db)

    user_turn = next((m for m in reversed(messages) if m["role"] == "user"), None)
    if not user_turn:
        return "I didn't receive a question. Please try again.", conversation_id

    llm_messages: list[dict] = [{"role": "system", "content": SYSTEM}]
    llm_messages.extend(history[-MAX_HISTORY_MESSAGES:])
    llm_messages.append(user_turn)

    client = _get_groq()
    cid = conversation_id or "none"
    pipeline_t0 = time.perf_counter()

    for round_idx in range(MAX_ROUNDS):
        is_last_round = round_idx == MAX_ROUNDS - 1

        try:
            t0 = time.perf_counter()
            response = await client.chat.completions.create(
                model=MODEL,
                messages=llm_messages,
                tools=TOOL_DEFINITIONS,
                tool_choice="none" if is_last_round else "auto",
                max_tokens=800,
                temperature=0.4,
            )
            logger.info("stage=llm_round round=%d ms=%.1f cid=%s", round_idx, (time.perf_counter() - t0) * 1000, cid)
        except BadRequestError as exc:
            if "tool_use_failed" in str(exc):
                logger.warning("Groq tool_use_failed -- retrying without tools: %s", exc)
                t0 = time.perf_counter()
                response = await client.chat.completions.create(
                    model=MODEL,
                    messages=llm_messages,
                    tool_choice="none",
                    max_tokens=800,
                    temperature=0.4,
                )
                logger.info("stage=llm_round round=%d ms=%.1f cid=%s", round_idx, (time.perf_counter() - t0) * 1000, cid)
            else:
                raise

        assistant_msg = response.choices[0].message

        if not assistant_msg.tool_calls:
            reply = assistant_msg.content or "No answer generated. Try rephrasing."

            try:
                bolded = _extract_bolded(reply)
                if bolded:
                    unknown = await _unknown_names(db, bolded)
                    if unknown:
                        logger.warning("Grounding violation -- unknown names: %s", unknown)
                        correction = (
                            "CORRECTION: The following names you mentioned are not in the MMDb database: "
                            + ", ".join(unknown)
                            + ". Rewrite your response using only the tool results already provided above, "
                            "or tell the user that nothing matched their query. Do not invent any names."
                        )
                        llm_messages.append({"role": "assistant", "content": reply})
                        llm_messages.append({"role": "user", "content": correction})
                        t0 = time.perf_counter()
                        corrected = await client.chat.completions.create(
                            model=MODEL,
                            messages=llm_messages,
                            tool_choice="none",
                            max_tokens=800,
                            temperature=0.4,
                        )
                        logger.info("stage=llm_round round=%d ms=%.1f cid=%s", round_idx, (time.perf_counter() - t0) * 1000, cid)
                        reply = corrected.choices[0].message.content or reply
            except Exception as exc:
                logger.warning("Grounding check failed, skipping: %s", exc)

            if conversation_id:
                updated = list(history) + [
                    user_turn,
                    {"role": "assistant", "content": reply},
                ]
                await save_conversation(db, conversation_id, updated)
            logger.info("stage=pipeline_total ms=%.1f cid=%s", (time.perf_counter() - pipeline_t0) * 1000, cid)
            return reply, conversation_id

        llm_messages.append({
            "role": "assistant",
            "content": assistant_msg.content,
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments,
                    },
                }
                for tc in assistant_msg.tool_calls
            ],
        })

        for tc in assistant_msg.tool_calls:
            try:
                args = json.loads(tc.function.arguments) or {}
            except json.JSONDecodeError:
                args = {}
            for int_field in ("place_id", "limit"):
                if int_field in args and isinstance(args[int_field], str):
                    try:
                        args[int_field] = int(args[int_field])
                    except ValueError:
                        args.pop(int_field)
            tool_result = await _dispatch_tool(
                tc.function.name, args, db, user_lat, user_lng
            )
            llm_messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": tool_result,
            })

    logger.info("stage=pipeline_total ms=%.1f cid=%s", (time.perf_counter() - pipeline_t0) * 1000, cid)
    return "I couldn't produce an answer. Please try rephrasing.", conversation_id
