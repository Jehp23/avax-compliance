# Veila — Frontend

App **Next.js 16** para pagos institucionales con **eERC20** (`@avalabs/eerc-sdk`) en Avalanche Fuji.

## Documentación del equipo

| Doc | Contenido |
|-----|-----------|
| [docs/DEPLOY.md](./docs/DEPLOY.md) | Deploy Vercel, health check, checklist |
| [docs/ENV.md](./docs/ENV.md) | Variables de entorno |
| [../docs/DEMO.md](../docs/DEMO.md) | Guion de demo en vivo |
| [../docs/DEPLOY.md](../docs/DEPLOY.md) | Coordinación front + back |
| [../avalanche-back/docs/DEPLOY-EERC.md](../avalanche-back/docs/DEPLOY-EERC.md) | Deploy contratos |

## Arranque rápido

```bash
cp .env.example .env.local
npm install
npm run circuits:fetch   # si public/circuits/ está vacío
npm run dev --webpack
```

- Landing: http://localhost:3000/
- Registro: http://localhost:3000/registro

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing + narrativa producto |
| `/registro` | Wallet + KYC demo + `sdk.register()` |
| `/transferencias` | Saldo privado + `privateTransfer` |
| `/recibir` | Dirección `0x` para pagos entrantes |
| `/auditoria` | `sdk.auditorDecrypt()` (wallet auditor) |
| `/api/health` | Health check para deploy |

## Scripts

```bash
npm run dev --webpack    # desarrollo
npm run build            # producción (webpack)
npm run lint
npm run circuits:fetch   # WASM/ZKEY → public/circuits/
```

## Barra de estado

En rutas `/registro`, `/transferencias`, etc. aparece la **barra de preparación demo** (wallet, Fuji, circuitos, contrato, SDK, registro, auditor key). Verde = listo para pitch.

## Stack

- Next.js App Router · TypeScript · Tailwind 4
- wagmi 2 + viem 2 + TanStack Query
- `@avalabs/eerc-sdk` · circuitos en `/public/circuits/`

## Deploy

Ver [docs/DEPLOY.md](./docs/DEPLOY.md). Root Directory en Vercel: **`frontend`**.
