# Guion de demo en vivo — Cello

Duración sugerida: **5–7 minutos**. Contrato eERC: `0x45C1316953c92C402AB9e14EA628182A3494FD7F` (Fuji).

## Roles

| Rol | Wallet (Fuji) | Pantalla |
|-----|---------------|----------|
| **Bankaool (A)** | `0x79d23BB592FD230e441874d0e889C58f8FD92E07` | `/transferencias` |
| **FinNova (B)** | `0xC8af2C4e87C942F82BaBC4da98364C2c1A82DF32` | `/recibir` |
| **CNBV (auditor)** | Misma que FinNova (auditor on-chain) | `/auditoria` |

Ver [FASES-DEMO.md](./FASES-DEMO.md) para preparación on-chain. Si registraste vía script, importá `sessionStorage` (clave de descifrado) antes de la demo.

## Pre-demo (15 min antes)

1. Abrí Cello en **Chrome** (una ventana por rol o perfiles de MetaMask).
2. Verificá la **barra de estado** bajo el header: circuitos, contrato, Fuji.
3. Si usás contrato propio: confirmá `NEXT_PUBLIC_EERC_CONTRACT_ADDRESS` en Vercel.
4. Wallet A (deployer): importá clave de descifrado si registraste por script (ver `FASES-DEMO.md`).
5. Wallet auditor (FinNova): conectá en `/auditoria` — chip **Auditor key** verde.

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

> “Cello es la capa institucional sobre eERC20 en Avalanche — contrato propio en Fuji, listo para KYC real.”

## Frases de respaldo (Q&A)

- **¿Es mainnet?** Fuji testnet; mismo protocolo eERC de Ava Labs.
- **¿Dónde está el auditor key?** En el contrato, no en el front; la wallet auditor firma `auditorDecrypt`.
- **¿Por qué tarda?** Prueba ZK en el cliente (snarkjs) — producción puede optimizar con workers/CDN.
- **¿InterbankVault?** Segundo contrato (escrow AVAX); la demo principal es eERC. Ver `design-dual-contract-flows.md`.

## Si algo falla en vivo

| Fallo | Plan B |
|-------|--------|
| ZK colgado | Recargar; segunda wallet ya registrada de antes |
| RPC caído | Cambiar `NEXT_PUBLIC_AVALANCHE_FUJI_RPC` |
| Contrato demo | Usar defaults Fuji del SDK (sin env) |
| Auditor no descifra | Mostrar screenshot / video de backup |
