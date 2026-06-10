"""Writes report.md — a human-readable failure report with everything needed
to diagnose: the transcript, which checks failed, and the conversation_id +
time window to pull matching Render logs (report-only; no auto-fix)."""
from datetime import datetime, timezone
from pathlib import Path

REPORT_PATH = Path(__file__).parent / "report.md"


def _verdict(c: dict) -> str:
    p = c.get("pass")
    if p is True:
        return "PASS"
    if p is False:
        return "FAIL"
    return "skip"


def write_report(graded: list[dict], base_url: str) -> Path:
    passed = sum(1 for g in graded if g["passed"])
    total = len(graded)
    lines: list[str] = []
    lines.append("# MMDb Eval Report")
    lines.append("")
    lines.append(f"- Generated: {datetime.now(timezone.utc).isoformat()}")
    lines.append(f"- Target: {base_url}")
    lines.append(f"- Result: **{passed}/{total} cases passed**")
    lines.append("")
    lines.append("| Case | Kind | Result | Failed checks |")
    lines.append("|------|------|--------|---------------|")
    for g in graded:
        status = "PASS" if g["passed"] else "**FAIL**"
        fails = ", ".join(g["failed_checks"]) or "—"
        lines.append(f"| {g['id']} | {g['kind']} | {status} | {fails} |")
    lines.append("")

    failures = [g for g in graded if not g["passed"]]
    if failures:
        lines.append("## Failures")
        lines.append("")
        for g in failures:
            lines.append(f"### {g['id']} ({g['kind']})")
            lines.append("")
            lines.append(f"**Rubric:** {g['rubric']}")
            lines.append("")
            conv_ids = sorted({t["conversation_id"] for t in g["turns"]
                               if t.get("conversation_id")})
            lines.append(f"**Log window:** {g['started_at']} → {g['finished_at']}")
            lines.append(f"**conversation_id:** {', '.join(conv_ids) or '(none)'}")
            lines.append("")
            lines.append("**Transcript:**")
            for t in g["turns"]:
                lines.append("")
                lines.append(f"> USER: {t['prompt']}")
                reply = (t.get("reply") or "(no reply)").replace("\n", "\n> ")
                lines.append(f"> BOT: {reply}")
                if t.get("driver_error"):
                    lines.append(f"> DRIVER ERROR: {t['driver_error']}")
            lines.append("")
            lines.append("**Checks:**")
            lines.append("")
            for c in g["checks"]:
                detail = f" — {c['detail']}" if c.get("detail") else ""
                lines.append(f"- [{_verdict(c)}] {c['check']}{detail}")
            lines.append("")

    REPORT_PATH.write_text("\n".join(lines), encoding="utf-8")
    return REPORT_PATH
