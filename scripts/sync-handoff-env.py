#!/usr/bin/env python3
"""Sync public env from avalanche-back/.env → frontend/.env.local + apps/api/.env"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BACK_ENV = ROOT / "avalanche-back" / ".env"
FRONT_ENV = ROOT / "frontend" / ".env.local"
API_ENV = ROOT / "avalanche-back" / "apps" / "api" / ".env"

DENY_KEYS = frozenset(
    {
        "PRIVATE_KEY",
        "FIN_NOVA_SIGNER_PRIVATE_KEY",
        "BANK_DEMO_PRIVATE_KEY",
    }
)


def parse_env(path: Path) -> dict[str, str]:
    data: dict[str, str] = {}
    if not path.exists():
        return data
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        if key in DENY_KEYS:
            continue
        data[key] = value.strip()
    return data


def write_env(path: Path, data: dict[str, str], header: str) -> None:
    lines = [header, ""]
    for key in sorted(data.keys()):
        lines.append(f"{key}={data[key]}")
    path.write_text("\n".join(lines) + "\n")


def main() -> int:
    if not BACK_ENV.exists():
        print(f"Missing {BACK_ENV}", file=sys.stderr)
        return 1

    back = parse_env(BACK_ENV)
    vault = back.get("INDEXER_VAULT_ADDRESS", "")
    rpc = back.get("FUJI_RPC_URL", "https://api.avax-test.network/ext/bc/C/rpc")
    from_block = back.get("INDEXER_FROM_BLOCK", "0")

    api_data = {
        "INDEXER_VAULT_ADDRESS": vault,
        "FUJI_RPC_URL": rpc,
        "INDEXER_FROM_BLOCK": from_block,
        "CHAIN_ID": "43113",
        "PORT": "8080",
        "API_KEYS": "cello-demo-key",
        "DATABASE_URL": "./data/indexer.db",
    }
    API_ENV.parent.mkdir(parents=True, exist_ok=True)
    write_env(
        API_ENV,
        api_data,
        "# Synced from avalanche-back/.env — InterbankVault indexer",
    )
    print(f"Wrote {API_ENV.relative_to(ROOT)}")

    front = parse_env(FRONT_ENV)
    front["NEXT_PUBLIC_AVALANCHE_FUJI_RPC"] = rpc
    front["NEXT_PUBLIC_INDEXER_FROM_BLOCK"] = from_block
    if vault:
        front["NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS"] = vault
    if back.get("BANK_DEMO_BENEFICIARY"):
        front["NEXT_PUBLIC_DEMO_BANKAOOL"] = back["BANK_DEMO_BENEFICIARY"]
    if back.get("FIN_NOVA_SAFE"):
        front["NEXT_PUBLIC_DEMO_FINNOVA"] = back["FIN_NOVA_SAFE"]
    eerc = back.get("NEXT_PUBLIC_EERC_CONTRACT_ADDRESS") or back.get(
        "EERC_CONTRACT_ADDRESS"
    )
    if eerc:
        front["NEXT_PUBLIC_EERC_CONTRACT_ADDRESS"] = eerc
        front.setdefault("NEXT_PUBLIC_EERC_MODE", "standalone")

    write_env(
        FRONT_ENV,
        front,
        "# Cello — synced from avalanche-back/.env (no private keys)",
    )
    print(f"Wrote {FRONT_ENV.relative_to(ROOT)}")
    if not eerc:
        print(
            "Note: NEXT_PUBLIC_EERC_CONTRACT_ADDRESS not in back .env — "
            "front will use SDK demo contract until you deploy EncryptedERC.",
            file=sys.stderr,
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
