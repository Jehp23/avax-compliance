#!/usr/bin/env bash
# Circuitos ZK deben coincidir con los verifiers del deploy EncryptedERC (zkit).
# Los de 3dent/Ava demo NO sirven para el contrato Cello en Fuji.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/public/circuits"
EERC_ZKIT="${EERC_ZKIT:-$ROOT/../avalanche-back/EncryptedERC/zkit/artifacts/circom}"

mkdir -p "$DEST"

verify_cello_circuits() {
  local bytes
  bytes=$(wc -c < "$DEST/RegistrationCircuit.wasm" | tr -d ' ')
  if [[ "$bytes" -lt 1882000 ]]; then
    echo "ERROR: RegistrationCircuit.wasm=$bytes (se esperan ≥1882000 para Cello/EncryptedERC zkit)." >&2
    exit 1
  fi
}

copy_pair() {
  local cir="$1"
  local name="$2"
  local wasm_src="$EERC_ZKIT/${cir}.circom/${name}Circuit_js/${name}Circuit.wasm"
  local zkey_src="$EERC_ZKIT/${cir}.circom/${name}Circuit.groth16.zkey"
  if [[ ! -f "$wasm_src" || ! -f "$zkey_src" ]]; then
    echo "Falta $wasm_src — en EncryptedERC/: npm install && npx hardhat zkit make --force" >&2
    return 1
  fi
  cp "$wasm_src" "$DEST/${name}Circuit.wasm"
  cp "$zkey_src" "$DEST/${name}Circuit.groth16.zkey"
  echo "  ✓ ${name}Circuit"
}

if [[ -d "$EERC_ZKIT" ]]; then
  echo "Copiando circuitos desde EncryptedERC zkit → public/circuits/"
  copy_pair registration Registration
  copy_pair transfer Transfer
  copy_pair mint Mint
  copy_pair withdraw Withdraw
  verify_cello_circuits
  echo "Listo ($(wc -c < "$DEST/RegistrationCircuit.wasm" | tr -d ' ') bytes register wasm)."
  exit 0
fi

# zkit/ no está en git; usar WASM/ZKEY ya commiteados en public/circuits/
if [[ -f "$DEST/RegistrationCircuit.wasm" && -f "$DEST/RegistrationCircuit.groth16.zkey" ]]; then
  bytes=$(wc -c < "$DEST/RegistrationCircuit.wasm" | tr -d ' ')
  if [[ "$bytes" -ge 1882000 ]]; then
    verify_cello_circuits
    echo "Usando circuitos en public/circuits/ (zkit no disponible; $bytes bytes register wasm)."
    exit 0
  fi
  echo "WARN: RegistrationCircuit.wasm parece demo 3dent ($bytes bytes)." >&2
fi

echo "ERROR: no hay zkit ni circuitos Cello en public/circuits/." >&2
echo "  cd avalanche-back/EncryptedERC && npx hardhat zkit make --force" >&2
echo "  cd frontend && npm run circuits:fetch" >&2
exit 1
