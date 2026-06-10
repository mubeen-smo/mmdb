"""Grades a driver result. Three layers:

1. Hard asserts   — status, latency, non-empty, not the UI error string.
2. Ground truth   — every bolded name must exist in the database.
3. LLM judge      — Claude scores the transcript against the case rubric.

Layers 2 and 3 degrade gracefully: if DATABASE_URL / ANTHROPIC_API_KEY are
absent they are skipped and noted, so the harness still produces a report.
"""
import json
import os
import re

from anthropic import AsyncAnthropic

from db import load_known_names

BOLD = re.compile(r"\*\*(.+?)\*\*")
JUDGE_MODEL = "claude-sonnet-4-6"
ERROR_REPLY = "Something went wrong"

_known_names: set[str] | None = None
_known_loaded = False


def _hard_checks(result: dict) -> list[dict]:
    out = []
    for i, t in enumerate(result["turns"]):
        turn_no = i + 1
        if t.get("driver_error"):
            out.append({"check": f"turn{turn_no}.driver", "pass": False,
                        "detail": t["driver_error"]})
            continue
        out.append({"check": f"turn{turn_no}.status", "pass": t["status"] == 200,
                    "detail": f"status={t['status']}"})
        reply = (t.get("reply") or "").strip()
        out.append({"check": f"turn{turn_no}.non_empty", "pass": bool(reply),
                    "detail": f"len={len(reply)}"})
        out.append({"check": f"turn{turn_no}.no_ui_error",
                    "pass": ERROR_REPLY not in reply, "detail": ""})
        out.append({"check": f"turn{turn_no}.latency",
                    "pass": t["latency_ms"] <= result["max_latency_ms"],
                    "detail": f"{t['latency_ms']}ms <= {result['max_latency_ms']}ms"})
    return out


async def _grounding_check(result: dict) -> dict:
    global _known_names, _known_loaded
    if not _known_loaded:
        _known_names = await load_known_names()
        _known_loaded = True

    if _known_names is None:
        return {"check": "grounding", "pass": None, "detail": "skipped (no DATABASE_URL)"}

    unknown: list[str] = []
    for t in result["turns"]:
        for raw in BOLD.findall(t.get("reply") or ""):
            name = raw.strip().lower()
            if not name:
                continue
            hit = any(name in known or known in name for known in _known_names)
            if not hit:
                unknown.append(raw.strip())

    if unknown:
        return {"check": "grounding", "pass": False,
                "detail": f"not in DB: {', '.join(sorted(set(unknown)))}"}
    return {"check": "grounding", "pass": True, "detail": "all bolded names exist"}


async def _llm_judge(result: dict) -> dict:
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return {"check": "llm_judge", "pass": None, "score": None,
                "detail": "skipped (no ANTHROPIC_API_KEY)"}

    transcript = "\n\n".join(
        f"USER: {t['prompt']}\nBOT: {t.get('reply') or '(no reply)'}"
        for t in result["turns"]
    )
    prompt = (
        f"You are grading a food-recommendation chatbot for Hyderabad, India.\n\n"
        f"CASE RUBRIC:\n{result['rubric']}\n\n"
        f"TRANSCRIPT:\n{transcript}\n\n"
        "Grade strictly. Reply with ONLY a JSON object: "
        '{\"pass\": true|false, \"score\": 1-5, \"reason\": \"one sentence\"}.'
    )
    client = AsyncAnthropic()
    msg = await client.messages.create(
        model=JUDGE_MODEL,
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}],
    )
    text = msg.content[0].text.strip()
    text = re.sub(r"^```(?:json)?|```$", "", text, flags=re.MULTILINE).strip()
    try:
        verdict = json.loads(text)
    except json.JSONDecodeError:
        return {"check": "llm_judge", "pass": None, "score": None,
                "detail": f"unparseable judge output: {text[:200]}"}
    return {"check": "llm_judge", "pass": bool(verdict.get("pass")),
            "score": verdict.get("score"),
            "detail": verdict.get("reason", "")}


async def judge(result: dict) -> dict:
    checks = _hard_checks(result)
    checks.append(await _grounding_check(result))
    checks.append(await _llm_judge(result))

    # A case fails if any non-skipped check failed.
    failed = [c for c in checks if c.get("pass") is False]
    return {**result, "checks": checks, "passed": not failed,
            "failed_checks": [c["check"] for c in failed]}
