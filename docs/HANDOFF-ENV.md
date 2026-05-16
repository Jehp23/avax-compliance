# Handoff de entorno — back ↔ front

## Qué hay hoy en `avalanche-back/.env`

| Variable | Uso |
|----------|-----|
| `PRIVATE_KEY` | Deploy / scripts Foundry (**solo servidor/local, nunca front**) |
| `INDEXER_VAULT_ADDRESS` | **InterbankVault** en Fuji (`0x0803…`) |
| `BANK_DEMO_BENEFICIARY` | Beneficiario demo vault |
| `FIN_NOVA_SAFE` | Safe FinNova (release) |
| `FUJI_RPC_URL` | RPC Fuji |

## Cello (frontend eERC)

El front usa **`@avalabs/eerc-sdk`** y necesita:

```env
NEXT_PUBLIC_EERC_CONTRACT_ADDRESS=0x...   # EncryptedERC deployado en Fuji
NEXT_PUBLIC_EERC_MODE=standalone
```

Si falta, la UI usa contratos **demo del SDK** (sirve para probar UI, no vuestro deploy).

Tras deploy en `avalanche-back/EncryptedERC/`:

```bash
cd avalanche-back/EncryptedERC
# seguir README — deploy en Fuji
# anotar CONTRACT_ADDRESS y agregar a avalanche-back/.env:
# NEXT_PUBLIC_EERC_CONTRACT_ADDRESS=0x...
```

Luego re-sincronizar (ver abajo).

## API indexer (`apps/api`)

```bash
cd avalanche-back/apps/api
cp .env.example .env   # o usar .env generado desde raíz
npm install
npm run dev            # http://localhost:8080/health
```

`.env` del API usa `INDEXER_VAULT_ADDRESS` (mismo vault que la raíz).

## Sincronizar env al front

Desde la raíz del monorepo (valores públicos solamente):

```bash
# Tras editar avalanche-back/.env con EERC + vault
python3 scripts/sync-handoff-env.py   # si existe
```

O copiar manualmente a `frontend/.env.local`:

- `NEXT_PUBLIC_AVALANCHE_FUJI_RPC`
- `NEXT_PUBLIC_EERC_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_DEMO_*` (wallets registradas en eERC)
- `DATABASE_URL` (Neon, solo servidor en Vercel)

## Seguridad

- **Nunca** `PRIVATE_KEY` en Vercel ni `NEXT_PUBLIC_*`
- Rotar credenciales si se compartieron en chat
