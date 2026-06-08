import json
import os

from openai import AsyncOpenAI
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.memory import cleanup_old_conversations, load_conversation, save_conversation
from app.agent.tool_defs import TOOL_DEFINITIONS
from app.agent.tools import list_areas, search_items, search_places

MODEL = "llama-3.3-70b-versatile"
MAX_ROUNDS = 4

SYSTEM = """\
You are MMDb Maven, an editorial food guide for Hyderabad, India.

You have tools to search the MMDb database. Use them whenever the user asks
about food, places, dishes, or areas. Only recommend places and dishes that
were returned by your tools — never invent results not in the database.

Style:
- Direct and opinionated, like a trusted food critic
- Place and dish names in **bold**
- Lead with your single best pick, briefly explain why
- Bullet list for alternatives, 3–4 max
- If tool results are empty, say so and suggest the user rephrase
- Prices in ₹ | Price tier: 1 = budget, 2 = mid-range, 3 = premium
"""

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


async def _dispatch_tool(
    name: str,
    args: dict,
    db: AsyncSession,
    user_lat: float | None,
    user_lng: float | None,
) -> str:
    """Execute a tool call and return its result as a JSON string."""
    if name == "search_places":
        result = await search_places(
            db,
            user_lat=user_lat,
            user_lng=user_lng,
            **args,
        )
    elif name == "search_items":
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
    return json.dumps(result, ensure_ascii=False, default=str)


async def run_pipeline(
    messages: list[dict],
    db: AsyncSession,
    user_lat: float | None = None,
    user_lng: float | None = None,
    conversation_id: str | None = None,
) -> tuple[str, str | None]:
    """
    Run the agentic loop.

    Returns (reply_text, conversation_id).
    If conversation_id is None a new one is not created here — the caller
    (routes.py) should generate and pass one.
    """
    # Load server-side history
    history: list[dict] = []
    if conversation_id:
        history = await load_conversation(db, conversation_id)
        # Run cleanup opportunistically (cheap; no scheduler needed)
        await cleanup_old_conversations(db)

    # Build the full message list: system + stored history + new user turn
    user_turn = next((m for m in reversed(messages) if m["role"] == "user"), None)
    if not user_turn:
        return "I didn't receive a question. Please try again.", conversation_id

    llm_messages: list[dict] = [{"role": "system", "content": SYSTEM}]
    llm_messages.extend(history)
    llm_messages.append(user_turn)

    client = _get_groq()

    # Agent loop — max MAX_ROUNDS before forcing a final answer
    for round_idx in range(MAX_ROUNDS):
        is_last_round = round_idx == MAX_ROUNDS - 1

        response = await client.chat.completions.create(
            model=MODEL,
            messages=llm_messages,
            tools=TOOL_DEFINITIONS,
            tool_choice="none" if is_last_round else "auto",
            max_tokens=1024,
            temperature=0.4,
        )

        assistant_msg = response.choices[0].message

        # No tool calls → final answer
        if not assistant_msg.tool_calls:
            reply = assistant_msg.content or "No answer generated. Try rephrasing."
            # Persist: append user turn + assistant reply to history
            if conversation_id:
                updated = list(history) + [
                    user_turn,
                    {"role": "assistant", "content": reply},
                ]
                await save_conversation(db, conversation_id, updated)
            return reply, conversation_id

        # Append the assistant's tool-call turn to the message list
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

        # Execute all tool calls and append all results before next LLM call
        for tc in assistant_msg.tool_calls:
            try:
                args = json.loads(tc.function.arguments)
            except json.JSONDecodeError:
                args = {}
            tool_result = await _dispatch_tool(
                tc.function.name, args, db, user_lat, user_lng
            )
            llm_messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": tool_result,
            })

    # Should not normally reach here (last round forces tool_choice="none")
    return "I couldn't produce an answer. Please try rephrasing.", conversation_id
