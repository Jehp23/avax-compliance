<div align="center">

# Cello ·

### Pagos institucionales privados en Avalanche

**Montos cifrados on-chain** · **auditoría regulatoria nativa** · **eERC20 de Ava Labs**

<br />

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Avalanche Fuji](https://img.shields.io/badge/Red-Fuji-ef4444?style=flat-square&logo=avalanche&logoColor=white)](https://faucet.avax.network/)
[![eERC SDK](https://img.shields.io/badge/eERC-Ava_Labs-00b87a?style=flat-square)](https://docs.avacloud.io/encrypted-erc/welcome)
[![License](https://img.shields.io/badge/Hackathon-Avalanche_LatAm-888?style=flat-square)]()

**[Demo en vivo](#-demo-en-60-segundos)** · **[Arranque rápido](#-arranque-rápido)** · **[Arquitectura](#-arquitectura)** · **[Para jueces](#-para-jueces)**

---

## El problema

Los bancos no pueden transferir en cadena sin **exponer montos** al mercado. El regulador necesita **auditabilidad** sin destruir confidencialidad comercial.

**Cello** es la capa institucional sobre **EncryptedERC (eERC20)**: cada pago es privado para el público, legible para contraparte y auditor autorizado.

```
  Institución A                    Institución B
       │                                ▲
       │  ZK + transferencia privada    │
       └──────────────► eERC Fuji ──────┘
                              │
                    copia cifrada (dual-lock)
                              ▼
                         CNBV / auditor
```

---

## Demo en 60 segundos

| Paso | Ruta | Qué muestra |
|:----:|------|-------------|
| 1 | [`/registro`](http://localhost:3000/registro) | Wallet + KYC demo + `register()` con prueba ZK |
| 2 | [`/transferencias`](http://localhost:3000/transferencias) | Saldo descifrado + `privateTransfer` |
| 3 | [`/recibir`](http://localhost:3000/recibir) | Dirección institucional para cobrar |
| 4 | [`/auditoria`](http://localhost:3000/auditoria) | `auditorDecrypt()` — montos en claro solo para el auditor |

**Barra de estado** (verde = listo): wallet · Fuji · circuitos ZK · contrato · SDK · registro · auditor key · Neon DB.

---

## Arranque rápido

```bash
git clone --recurse-submodules https://github.com/Jehp23/avax-compliance.git
cd avax-compliance/frontend
cp .env.example .env.local
npm install
npm run circuits:fetch    # WASM/ZKEY → public/circuits/
npm run dev --webpack
```

| URL | Descripción |
|-----|-------------|
| http://localhost:3000 | Landing |
| http://localhost:3000/registro | Onboarding institucional |
| http://localhost:3000/api/health | Health check (deploy) |

> **Contrato propio:** definí `NEXT_PUBLIC_EERC_CONTRACT_ADDRESS` tras el deploy en Fuji. Ver [avalanche-back/docs/DEPLOY-EERC.md](./avalanche-back/docs/DEPLOY-EERC.md).

---

## Arquitectura

```
avax-compliance/
├── frontend/          ← Cello UI (Next.js 16 + @avalabs/eerc-sdk)
│   ├── src/app/       App Router: marketing + 4 flujos eERC
│   ├── src/db/        Neon PostgreSQL (metadata sin montos)
│   └── public/circuits/   Circuitos ZK (fetch en install)
├── docs/              Guiones demo y checklist deploy
└── avalanche-back/    Foundry — deploy EncryptedERC en Fuji
```

| Capa | Tecnología |
|------|------------|
| **Privacidad** | eERC20 · BabyJubjub · ElGamal · Groth16 |
| **Cliente** | wagmi 2 · viem 2 · pruebas ZK en browser |
| **Off-chain** | Neon + Drizzle — índice de txs e instituciones (sin montos en claro) |
| **Red** | Avalanche Fuji (43113) |

---

## Para jueces

### Qué construimos

- **Producto completo en UI:** landing, onboarding, transferencias privadas, recibir pagos y panel regulatorio.
- **SDK real:** `@avalabs/eerc-sdk` — no mock de montos; ZK en cliente (1–2 min por tx).
- **Dual-lock:** cada transferencia cifra para destinatario **y** para clave auditor del contrato.
- **Modo oscuro** y diseño minimalista centrado (marca **Cello**).
- **Metadata off-chain** en Neon para historial e instituciones sin romper privacidad on-chain.

### Diferenciadores

| Otros enfoques | Cello |
|----------------|-------|
| “Privacy” solo en marketing | eERC20 en Fuji con SDK oficial Ava Labs |
| Auditoría off-chain opaca | `auditorDecrypt()` nativo del protocolo |
| UI genérica DeFi | Flujos institucionales: KYC demo, contrapartes, panel CNBV |

### Criterios sugeridos

| Criterio | Evidencia |
|----------|-----------|
| **Innovación** | eERC + ZK + UI institucional integrada |
| **Técnico** | 4 flujos on-chain, circuitos, health API, CI |
| **UX** | Barra de preparación, progreso ZK, Snowtrace links |
| **Impacto** | Pagos interbancarios privados + compliance CNBV |

### Demo en vivo (5 min)

Guion detallado → **[docs/DEMO.md](./docs/DEMO.md)**

1. Landing — narrativa dual-lock  
2. Registro — wallet Fuji + checkbox KYC + tx `register`  
3. Transferencia — monto privado a contraparte registrada  
4. Auditoría — wallet auditor + descifrado regulatorio  

---

## Variables clave

| Variable | Dónde | Obligatoria |
|----------|-------|:-----------:|
| `NEXT_PUBLIC_EERC_CONTRACT_ADDRESS` | Vercel / `.env.local` | Recomendada (prod) |
| `DATABASE_URL` | Servidor | Opcional (historial Neon) |
| `NEXT_PUBLIC_AUDITOR_PREVIEW_SECRET` | Cliente | Opcional (protege UI demo) |

Detalle → [frontend/docs/ENV.md](./frontend/docs/ENV.md)

---

## Deploy

```text
1. Deploy EncryptedERC en Fuji  →  avalanche-back/
2. Pasar contrato al frontend   →  NEXT_PUBLIC_EERC_CONTRACT_ADDRESS
3. Vercel (root: frontend/)     →  npm run build
4. Verificar                    →  GET /api/health  →  ok: true
```

Checklist coordinado → **[docs/DEPLOY.md](./docs/DEPLOY.md)**

---

## Documentación

| Documento | Audiencia |
|-----------|-----------|
| [docs/DEMO.md](./docs/DEMO.md) | Presentación en vivo |
| [docs/DEPLOY.md](./docs/DEPLOY.md) | Coordinación front + back |
| [frontend/docs/DEPLOY.md](./frontend/docs/DEPLOY.md) | Vercel, CI, health |
| [frontend/docs/ENV.md](./frontend/docs/ENV.md) | Variables de entorno |
| [frontend/docs/DATABASE.md](./frontend/docs/DATABASE.md) | Neon + Drizzle |
| [avalanche-back/docs/DEPLOY-EERC.md](./avalanche-back/docs/DEPLOY-EERC.md) | Contratos eERC |

---

## Recursos

- [Encrypted ERC — Ava Cloud](https://docs.avacloud.io/encrypted-erc/welcome)
- [eERC SDK](https://github.com/ava-labs/eerc-sdk)
- [EncryptedERC contracts](https://github.com/ava-labs/EncryptedERC)
- [Faucet Fuji](https://faucet.avax.network/)

---

<div align="center">

**Cello** · Avalanche LatAm Institucional Hackathon

*Privados para el sistema financiero · auditables para el regulador*

</div>
