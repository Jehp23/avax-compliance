# Fases demo Cello — Fuji (hackathon)

Checklist para dejar el producto listo en **testnet casi real**. Ir en orden.

## Fase 1 — On-chain (contrato `0x45C1316953c92C402AB9e14EA628182A3494FD7F`)

| # | Tarea | Estado |
|---|--------|--------|
| 1.1 | Deploy eERC standalone | Hecho |
| 1.2 | Compilar circuitos zkit (`npx hardhat zkit make --force` en `EncryptedERC/`) | Hecho |
| 1.3 | Registrar wallets demo | Deployer + FinNova vía scripts |
| 1.4 | `setAuditorPublicKey` (FinNova) | Hecho |
| 1.5 | `privateMint` saldo Bankaool (deployer) | 5000 CELL |
| 1.6 | Importar clave en browser (sessionStorage) | **Manual** — ver abajo |

### Comandos útiles (Fase 1)

```bash
cd avalanche-back/EncryptedERC

# Ver estado
npx hardhat run scripts/demo-status-fuji.ts --network fuji

# Registrar otra wallet (solo si tenés su PRIVATE_KEY)
WALLET_PRIVATE_KEY=0x... npx hardhat run scripts/register-fuji-wallet.ts --network fuji

# Auditor (después de registrar auditor)
AUDITOR_ADDRESS=0xC8af2C4e87C942F82BaBC4da98364C2c1A82DF32 \
  npx hardhat run scripts/set-auditor-fuji.ts --network fuji

# Mint (después de auditor + destinatario registrado)
RECIPIENT_ADDRESS=0x79d23BB592FD230e441874d0e889C58f8FD92E07 MINT_AMOUNT=5000 \
  npx hardhat run scripts/mint-demo-fuji.ts --network fuji
```

### Desbloquear claves en producción (sin consola)

1. https://cello-avax.vercel.app/registro  
2. Conectar wallet demo (Bankaool o FinNova)  
3. **Cargar clave desde el deploy** → código: `cello-hackathon-2026`  
4. Verificar: https://cello-avax.vercel.app/api/demo/status → `demoUnlockConfigured: true`

Scripts Hardhat versionados: `avalanche-back/scripts/eerc-fuji/` (ejecutar desde `EncryptedERC/`).

---

## Fase 2 — Env y deploy (Vercel) ✅

| # | Tarea | Estado |
|---|--------|--------|
| 2.1 | Variables en Vercel | Hecho (production) |
| 2.2 | Circuitos en `public/circuits/` | Hecho (commiteados) |
| 2.3 | Health en producción | [https://cello-avax.vercel.app/api/health](https://cello-avax.vercel.app/api/health) → `ok: true` |
| 2.4 | Sync env tras cambios | `python3 scripts/sync-handoff-env.py` + `bash scripts/sync-vercel-env.sh` |

**URL demo:** https://cello-avax.vercel.app

**Proyecto Vercel:** `jehp23s-projects/cello-avax` (root `frontend/`)

---

## Fase 3 — Ensayo guion 5 min

Seguir [DEMO.md](./DEMO.md):

1. Wallet deployer → `/transferencias` (saldo ~5000 CELL)
2. Transferir a FinNova (`0xC8af2C4e87C942F82BaBC4da98364C2c1A82DF32`)
3. Wallet FinNova → `/auditoria` → descifrar

---

## Fase 4 — Día del pitch

- [ ] Barra de estado 8/8 verde
- [ ] Tres perfiles MetaMask (o 2 + auditor)
- [ ] RPC estable
- [ ] Video/captura backup

---

## Roles demo (actualizado)

| Rol | Dirección Fuji |
|-----|----------------|
| Bankaool | `0x79d23BB592FD230e441874d0e889C58f8FD92E07` (deployer) |
| FinNova | `0xC8af2C4e87C942F82BaBC4da98364C2c1A82DF32` |
| CNBV / auditor | Misma que FinNova (wallet auditor on-chain) |

> Para demo con 3 wallets distintas: registrá una tercera en `/registro` y ejecutá `set-auditor-fuji.ts` con esa dirección.
