# Guion de demo en vivo — Veila

Duración sugerida: **5–7 minutos**. Requiere 3 wallets en Fuji con AVAX.

## Roles

| Rol | Wallet | Pantalla |
|-----|--------|----------|
| **Bankaool (A)** | Wallet institución emisora | `/registro` → `/transferencias` |
| **FinNova (B)** | Wallet receptora | `/registro` (solo registro) |
| **CNBV (auditor)** | Wallet auditor del contrato | `/auditoria` |

Configurá las direcciones en `.env.local` como `NEXT_PUBLIC_DEMO_*` para autocompletar contrapartes.

## Pre-demo (15 min antes)

1. Abrí Veila en **Chrome** (una ventana por rol o perfiles de MetaMask).
2. Verificá la **barra de estado** bajo el header: circuitos, contrato, Fuji.
3. Si usás contrato propio: confirmá `NEXT_PUBLIC_EERC_CONTRACT_ADDRESS` en Vercel.
4. Wallet A y B: entrá a `/registro`, KYC checkbox, **Registrar en eERC20** (esperá ZK ~1–2 min cada una).
5. Wallet auditor: conectá en `/auditoria` — debe decir **auditor activo**.

## Acto 1 — Problema (30 s)

> “Los bancos no pueden transferir en cadena sin que el mundo vea los montos. El regulador necesita auditabilidad sin destruir la confidencialidad comercial.”

Mostrá la **landing** (`/`) — dual-lock, eERC20, Avalanche.

## Acto 2 — Registro institucional (1 min)

Wallet **Bankaool** en `/registro`:

1. Conectar wallet → Fuji
2. Checkbox KYC (demo)
3. **Registrar en eERC20** — mostrá barra de progreso ZK
4. Link a Snowtrace cuando confirme

> “Generamos claves BabyJubjub en el navegador; el monto on-chain queda encriptado; el auditor recibe copia cifrada en cada movimiento.”

## Acto 3 — Transferencia privada (2 min)

Misma wallet en `/transferencias`:

1. Saldo descifrado local (solo esta wallet)
2. Destino: clic en **FinNova** (o pegar `0x` de wallet B)
3. Monto + referencia opcional
4. **Transferir (ZK privado)** — no cerrar pestaña
5. Abrir tx en Snowtrace: el explorador **no** muestra el monto en claro

> “Para el público es privado; para FinNova y CNBV existe descifrado autorizado.”

## Acto 4 — Vista regulador (1 min)

Wallet **CNBV** en `/auditoria`:

1. (Opcional) clave `NEXT_PUBLIC_AUDITOR_PREVIEW_SECRET` si está en staging
2. **Descifrar transacciones (auditor)**
3. Tabla con montos reales, origen, destino, hash

> “Esto es lo que ve el regulador con su clave — sin romper la confidencialidad frente al resto de la red.”

## Acto 5 — Recibir / cierre (30 s)

Wallet B en `/recibir` — mostrar dirección `0x` para pagos entrantes.

> “Veila es la capa institucional sobre eERC20 en Avalanche — listo para KYC real y nuestro contrato en Fuji.”

## Frases de respaldo (Q&A)

- **¿Es mainnet?** Fuji testnet; mismo protocolo eERC de Ava Labs.
- **¿Dónde está el auditor key?** En el contrato, no en el front; la wallet auditor firma `auditorDecrypt`.
- **¿Por qué tarda?** Prueba ZK en el cliente (snarkjs) — producción puede optimizar con workers/CDN.
- **¿InterbankVault?** Legacy en `avalanche-back`; producto actual es EncryptedERC.

## Si algo falla en vivo

| Fallo | Plan B |
|-------|--------|
| ZK colgado | Recargar; segunda wallet ya registrada de antes |
| RPC caído | Cambiar `NEXT_PUBLIC_AVALANCHE_FUJI_RPC` |
| Contrato demo | Usar defaults Fuji del SDK (sin env) |
| Auditor no descifra | Mostrar screenshot / video de backup |
