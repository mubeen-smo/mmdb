# MMDb Eval Harness

End-to-end quality gate for the **Ask MMDb** agent. Drives the real `/ask`
web UI with Playwright, intercepts each `/api/chat` response, and grades the
bot against per-case rubrics. Report-only — it never edits code.

## What it checks

Each case in `cases.json` is graded by three layers:

1. **Hard asserts** — HTTP 200, non-empty reply, no UI error string, latency bound.
2. **Grounding** — every **bolded** place/dish in the reply must exist in the
   database (the anti-hallucination check). Needs `DATABASE_URL`.
3. **LLM judge** — OpenAI `gpt-4o-mini` scores the transcript against the case
   rubric. Reuses the `OPENAI_API_KEY` already used for embeddings. Different
   model family than the bot under test (Groq/Llama), to avoid self-grading bias.

Layers 2 and 3 skip gracefully if their env vars are absent.

## Case kinds

grounding, tool_use, chaining, memory, empty (no-hallucination), geo, robustness
(gibberish + prompt injection). Multi-turn cases run in one browser session, so
server-side conversation memory is exercised.

## Setup

```bash
cd eval
pip install -r requirements.txt
playwright install chromium
cp .env.example .env   # fill in DATABASE_URL + OPENAI_API_KEY
```

The frontend and backend must be running and reachable. Point `--base-url` at
whichever `/ask` you want to test (local dev or the deployed site).

## Run

```bash
cd eval
python run.py --base-url http://localhost:3000
python run.py --only grounding-biryani   # single case
```

Output: `eval/report.md` plus a console summary. `report.md` and `.env` are
gitignored.

## Diagnosing failures

`report.md` lists, per failure: the transcript, which checks failed, the
`conversation_id`, and the UTC time window. Use that window to pull matching
backend logs (e.g. Render) and trace the bad turn to its tool calls.

## Not included (by design)

Auto-fix. This harness reports; fixing the code is a separate, deliberate step.
