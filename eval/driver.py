"""Playwright driver — exercises the bot through the real /ask web UI.

Each case is a fresh browser context (clean conversation). Multi-turn cases
fire follow-ups in the same page so server-side conversation memory is tested.
The bot's reply and conversation_id are read from the intercepted /api/chat
network response, not scraped from the DOM (markdown rendering is lossy).
"""
import time
from datetime import datetime, timezone

from playwright.async_api import async_playwright

ERROR_REPLY = "Something went wrong"


async def run_case(base_url: str, case: dict, default_geo: dict | None = None) -> dict:
    geo = case.get("geo") or default_geo
    started_at = datetime.now(timezone.utc).isoformat()

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx_args: dict = {}
        if geo:
            ctx_args["geolocation"] = {"latitude": geo["lat"], "longitude": geo["lng"]}
            ctx_args["permissions"] = ["geolocation"]
        context = await browser.new_context(**ctx_args)
        page = await context.new_page()

        await page.goto(f"{base_url.rstrip('/')}/ask", wait_until="domcontentloaded")
        box = page.locator('input[type="text"]')

        turns: list[dict] = []
        for prompt in case["turns"]:
            t0 = time.monotonic()
            try:
                async with page.expect_response(
                    lambda r: "/api/chat" in r.url and r.request.method == "POST",
                    timeout=case.get("max_latency_ms", 60000) + 5000,
                ) as resp_info:
                    await box.fill(prompt)
                    await box.press("Enter")
                resp = await resp_info.value
                latency_ms = int((time.monotonic() - t0) * 1000)

                status = resp.status
                try:
                    body = await resp.json()
                except Exception:
                    body = {}
                turns.append({
                    "prompt": prompt,
                    "status": status,
                    "latency_ms": latency_ms,
                    "reply": (body or {}).get("reply"),
                    "conversation_id": (body or {}).get("conversation_id"),
                })
            except Exception as exc:
                turns.append({
                    "prompt": prompt,
                    "status": None,
                    "latency_ms": int((time.monotonic() - t0) * 1000),
                    "reply": None,
                    "conversation_id": None,
                    "driver_error": repr(exc),
                })
                break

        await browser.close()

    finished_at = datetime.now(timezone.utc).isoformat()
    return {
        "id": case["id"],
        "kind": case["kind"],
        "rubric": case.get("rubric", ""),
        "max_latency_ms": case.get("max_latency_ms", 60000),
        "started_at": started_at,
        "finished_at": finished_at,
        "turns": turns,
    }
