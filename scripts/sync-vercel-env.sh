#!/usr/bin/env bash
# Sync frontend/.env.local → Vercel project (production). Run from repo root.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/frontend"

if [[ ! -f .env.local ]]; then
  echo "Missing frontend/.env.local — run: python3 scripts/sync-handoff-env.py" >&2
  exit 1
fi

python3 << 'PY'
import subprocess
from pathlib import Path

def parse_env(path):
    data = {}
    for line in Path(path).read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        data[k.strip()] = v.strip()
    return data

env = parse_env(".env.local")
keys = [
    "NEXT_PUBLIC_AVALANCHE_FUJI_RPC",
    "NEXT_PUBLIC_EERC_CONTRACT_ADDRESS",
    "NEXT_PUBLIC_EERC_MODE",
    "NEXT_PUBLIC_INDEXER_FROM_BLOCK",
    "NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS",
    "NEXT_PUBLIC_DEMO_BANKAOOL",
    "NEXT_PUBLIC_DEMO_FINNOVA",
    "DATABASE_URL",
    "DATABASE_URL_UNPOOLED",
]

for key in keys:
    val = env.get(key, "")
    if not val:
        print("SKIP", key)
        continue
    sensitive = key.startswith("DATABASE")
    cmd = [
        "vercel", "env", "add", key, "production",
        "--value", val, "-y", "--force",
    ]
    if sensitive:
        cmd.insert(-2, "--sensitive")
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode == 0:
        print("OK", key)
    else:
        print("WARN", key, (r.stderr or r.stdout)[:120])
PY

echo "Redeploy: cd frontend && vercel deploy --prod --yes"
