""
One-time script: upload dish images to Supabase Storage and print UPDATE SQL.

Setup:
  1. Create backend/.env with:
       DATABASE_URL=...
       SUPABASE_URL=https://ltgcwqhuyzyvfphawlin.supabase.co
       SUPABASE_SERVICE_KEY=<service_role key from Supabase dashboard>
  2. pip install requests python-dotenv
  3. python scripts/upload_images.py

Images are read from IMAGES_DIR (edit below if needed).
Each file must start with the item_id followed by underscore: e.g. 25_boneless...png
Files ending in _v2.png are skipped (v1 is used as the primary image).
"""

import os
import re
import sys
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SERVICE_KEY  = os.environ["SUPABASE_SERVICE_KEY"]
BUCKET       = "media"
FOLDER       = "items"
IMAGES_DIR   = Path(r"C:\Users\hp\Projects\Embeeyen\MMDb-Project\tinified")

STORAGE_BASE = f"{SUPABASE_URL}/storage/v1/object"
PUBLIC_BASE  = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{FOLDER}"

headers = {
    "Authorization": f"Bearer {SERVICE_KEY}",
    "apikey": SERVICE_KEY,
}


def upload(item_id: int, filepath: Path) -> str:
    storage_path = f"{BUCKET}/{FOLDER}/{item_id}.png"
    url = f"{STORAGE_BASE}/{storage_path}"
    with open(filepath, "rb") as f:
        resp = requests.post(
            url,
            headers={**headers, "Content-Type": "image/png", "x-upsert": "true"},
            data=f,
        )
    if resp.status_code not in (200, 201):
        raise RuntimeError(f"Upload failed for item {item_id}: {resp.status_code} {resp.text}")
    return f"{PUBLIC_BASE}/{item_id}.png"


def main():
    files = sorted(IMAGES_DIR.glob("*.png"))
    if not files:
        sys.exit(f"No PNGs found in {IMAGES_DIR}")

    updates = []

    for filepath in files:
        name = filepath.stem
        if name.endswith("_v2"):
            print(f"  skip  {filepath.name}  (v2 variant)")
            continue

        m = re.match(r"^(\d+)_", name)
        if not m:
            print(f"  skip  {filepath.name}  (no item_id prefix)")
            continue

        item_id = int(m.group(1))
        print(f"  upload  item_id={item_id}  {filepath.name} ... ", end="", flush=True)
        public_url = upload(item_id, filepath)
        print(f"ok  →  {public_url}")
        updates.append((item_id, public_url))

    print(f"\n{len(updates)} images uploaded.\n")
    print("-- Run this in Supabase SQL Editor to link images:")
    print("-" * 60)
    for item_id, url in sorted(updates):
        print(f"UPDATE items_table SET image_url = '{url}' WHERE item_id = {item_id};")
    print("-" * 60)


if __name__ == "__main__":
    main()
