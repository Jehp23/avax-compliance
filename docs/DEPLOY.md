# Checklist de deploy — Cello (coordinación front + back)

Usá esta lista el día del deploy. Cada ítem tiene responsable y verificación.

## Fase 0 — Antes del deploy (ambos equipos)

- [ ] Node.js 20+ y Foundry instalados en máquinas de deploy
- [ ] Wallets Fuji con AVAX ([faucet](https://faucet.avax.network/))
- [ ] Tres wallets identificadas: **Institución A**, **Institución B**, **Auditor CNBV**
- [ ] `frontend`: `npm install` + `npm run circuits:fetch` (o circuitos ya en `public/circuits/`)
- [ ] `frontend`: `npm run build` pasa en local

## Fase 1 — Contratos (equipo back)

Ver detalle: [avalanche-back/docs/DEPLOY-EERC.md](../avalanche-back/docs/DEPLOY-EERC.md)

- [x] Deploy **EncryptedERC** en Fuji — `0x45C1316953c92C402AB9e14EA628182A3494FD7F`
- [x] Auditor — FinNova `0xC8af2C4e87C942F82BaBC4da98364C2c1A82DF32`
- [x] Registro deployer + FinNova (scripts) + mint 5000 CELL al deployer
- [ ] Importar claves `sessionStorage` en browser (ver [FASES-DEMO.md](./FASES-DEMO.md))

**Entregable al front:** archivo `.env.production.snippet` (ver plantilla abajo)

## Fase 2 — Frontend (equipo front)

Ver detalle: [frontend/docs/DEPLOY.md](../frontend/docs/DEPLOY.md)

- [ ] Crear proyecto en [Vercel](https://vercel.com) apuntando a `frontend/` (root del subproyecto)
- [ ] Variables de entorno en Vercel (sección siguiente)
- [ ] Deploy → verificar `https://<dominio>/api/health` → `"circuits": true`
- [ ] Smoke test: registro → transferencia → auditoría

## Variables para Vercel (copiar cuando el back entregue)

```env
NEXT_PUBLIC_AVALANCHE_FUJI_RPC=https://api.avax-test.network/ext/bc/C/rpc
NEXT_PUBLIC_EERC_CONTRACT_ADDRESS=0x...   # del deploy EncryptedERC
NEXT_PUBLIC_EERC_MODE=standalone
NEXT_PUBLIC_INDEXER_FROM_BLOCK=12345678
NEXT_PUBLIC_DEMO_BANKAOOL=0x...
NEXT_PUBLIC_DEMO_FINNOVA=0x...
NEXT_PUBLIC_DEMO_RUTALOG=0x...
# Solo staging / demo pública:
# NEXT_PUBLIC_AUDITOR_PREVIEW_SECRET=...
```

## Fase 3 — Demo en vivo (pitch)

Seguir [DEMO.md](./DEMO.md). Antes de subir al escenario:

- [ ] Barra de estado en Cello: todos los checks en verde
- [ ] Wallet A y B ya registradas
- [ ] Wallet auditor conectada en pestaña aparte (o segundo navegador)
- [ ] RPC estable (si el público falla, tener RPC privado en env)

## Fase 4 — Post-hackathon (24–48 h)

- [ ] KYC real (reemplazar checkbox en `/registro`)
- [ ] Quitar `NEXT_PUBLIC_AUDITOR_PREVIEW_SECRET` en producción
- [ ] RPC dedicado (Alchemy / Infura / AvaCloud)
- [ ] Indexer de eventos eERC para historial en UI
- [ ] Verificación de contrato en Snowtrace

## Troubleshooting rápido

| Síntoma | Causa probable | Acción |
|---------|----------------|--------|
| Build falla en Vercel | Falta `--webpack` o circuitos | Ver `frontend/docs/DEPLOY.md` |
| “SDK no listo” eterno | Sin wallet / Fuji | Conectar MetaMask en Fuji |
| Transfer falla “no registrado” | Destino sin `register()` | Registrar wallet B primero |
| `auditorDecrypt` falla | Wallet no es auditor | Usar wallet del deploy |
| ZK tarda mucho | Normal 1–2 min | No cerrar pestaña; ver barra ZK |

## CI

El workflow `.github/workflows/ci.yml` corre en cada push:

- `npm run build --webpack` en `frontend/`
- `npm run lint` en `frontend/`
- `forge build` en `avalanche-back/` (si Foundry está en el runner)
