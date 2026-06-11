import requests, json, os
from datetime import datetime

SUPABASE_URL = os.environ["SUPABASE_URL"]
SERVICE_KEY  = os.environ["SUPABASE_KEY"]

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}"
}

date_str = datetime.now().strftime("%Y-%m-%d")
os.makedirs(f"backups/{date_str}", exist_ok=True)

for table in ["action", "batiment", "observation", "profiles"]:
    print(f"Sauvegarde {table}...")
    all_rows, offset = [], 0
    while True:
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/{table}?limit=1000&offset={offset}",
            headers=HEADERS
        )
        rows = r.json()
        if not isinstance(rows, list) or not rows:
            break
        all_rows.extend(rows)
        if len(rows) < 1000:
            break
        offset += 1000
    with open(f"backups/{date_str}/{table}.json", "w", encoding="utf-8") as f:
        json.dump(all_rows, f, ensure_ascii=False, indent=2)
    print(f"  → {len(all_rows)} lignes sauvegardées")

print("✅ Backup terminé !")