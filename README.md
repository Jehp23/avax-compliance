<div align="center">

# Veila

### Pagos institucionales privados sobre Avalanche  
*Privados para el sistema financiero · auditables para el regulador*

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![eERC SDK](https://img.shields.io/badge/eERC-Ava_Labs-E84142?style=for-the-badge&logo=avalanche&logoColor=white)](https://docs.avacloud.io/encrypted-erc/welcome)
[![Fuji](https://img.shields.io/badge/Red-Fuji_testnet-888?style=for-the-badge)](https://faucet.avax.network/)

**EncryptedERC (eERC20)** · ZK en cliente · panel **CNBV** vía `auditorDecrypt`

[Demo local](#-arranque-rápido) · [Documentación](#-documentación) · [Deploy](#-deploy)


---

## Por qué existe Veila

Los bancos no pueden transferir en cadena sin exponer montos al mercado. El regulador necesita auditabilidad sin destruir confidencialidad comercial.

Veila es la **UI institucional** sobre **eERC20**: montos cifrados on-chain, visibles solo para contraparte y auditor autorizado.

> **Dual-lock:** cada transferencia tiene candado para el destino y candado para el regulador.

---

## Estructura del repo

```
avax-compliance/
├── docs/              Índice, DEMO en vivo, checklist deploy coordinado
├── frontend/          Next.js + @avalabs/eerc-sdk (producto Veila)
└── avalanche-back/    Foundry — guía eERC + legacy InterbankVault
```

| Equipo | Empezar aquí |
|--------|----------------|
| **Frontend** | [frontend/docs/DEPLOY.md](./frontend/docs/DEPLOY.md) |
| **Contratos** | [avalanche-back/docs/DEPLOY-EERC.md](./avalanche-back/docs/DEPLOY-EERC.md) |
| **Demo / pitch** | [docs/DEMO.md](./docs/DEMO.md) |

---

## Arranque rápido

```bash
git clone https://github.com/Jehp23/avax-compliance.git
cd avax-compliance/frontend
cp .env.example .env.local
npm install
npm run circuits:fetch
npm run dev --webpack
```

→ http://localhost:3000 (landing) · http://localhost:3000/registro (app)

---

## Documentación

| Archivo | Para quién |
|---------|------------|
| [docs/README.md](./docs/README.md) | Índice general |
| [docs/DEPLOY.md](./docs/DEPLOY.md) | Checklist deploy front + back |
| [docs/DEMO.md](./docs/DEMO.md) | Guion 5–7 min en vivo |
| [frontend/docs/ENV.md](./frontend/docs/ENV.md) | Variables `NEXT_PUBLIC_*` |
| [frontend/docs/DEPLOY.md](./frontend/docs/DEPLOY.md) | Vercel, CI, health |

---

## Deploy

1. **Back:** deploy EncryptedERC en Fuji → pasar `NEXT_PUBLIC_EERC_CONTRACT_ADDRESS` al front ([guía](./avalanche-back/docs/DEPLOY-EERC.md)).
2. **Front:** Vercel con root `frontend/` → variables de [ENV.md](./frontend/docs/ENV.md).
3. Verificar: `https://<app>/api/health` → `"ok": true`.
4. Demo: [docs/DEMO.md](./docs/DEMO.md).

---

## Estado del producto

| Listo | Pendiente (post-hackathon) |
|-------|----------------------------|
| Landing, 4 flujos UI, SDK eERC integrado | Contrato propio en Fuji (equipo back) |
| Barra estado demo, progreso ZK, links Snowtrace | KYC real |
| Circuitos ZK, build webpack, CI GitHub | Indexer historial txs |
| Panel auditor `auditorDecrypt` | RPC dedicado prod |

---

## Recursos

- [Encrypted ERC — Ava Cloud](https://docs.avacloud.io/encrypted-erc/welcome)
- [eERC SDK](https://github.com/ava-labs/eerc-sdk)
- [EncryptedERC contracts](https://github.com/ava-labs/EncryptedERC)
- [Faucet Fuji](https://faucet.avax.network/)

---

<div align="center">

**Veila** · Hackathon Avalanche LatAm Institucional

</div>
