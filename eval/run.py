"""Entry point. Loads cases, drives them through the web UI, judges, reports.

    cd eval && python run.py --base-url http://localhost:3000

Report-only: writes eval/report.md and prints a summary. It never edits code.
"""
import argparse
import asyncio
import json
from pathlib import Path

from dotenv import load_dotenv

from driver import run_case
from judge import judge
from report import write_report

load_dotenv(Path(__file__).parent / ".env")

CASES_PATH = Path(__file__).parent / "cases.json"


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://localhost:3000",
                        help="Frontend origin serving /ask")
    parser.add_argument("--only", default=None,
                        help="Run a single case id")
    args = parser.parse_args()

    cases = json.loads(CASES_PATH.read_text(encoding="utf-8"))
    if args.only:
        cases = [c for c in cases if c["id"] == args.only]

    graded: list[dict] = []
    for case in cases:
        print(f"running {case['id']} ...", flush=True)
        result = await run_case(args.base_url, case)
        graded.append(await judge(result))

    path = write_report(graded, args.base_url)
    passed = sum(1 for g in graded if g["passed"])
    print(f"\n{passed}/{len(graded)} passed — report: {path}")
    for g in graded:
        mark = "ok  " if g["passed"] else "FAIL"
        print(f"  {mark} {g['id']}")


if __name__ == "__main__":
    asyncio.run(main())
