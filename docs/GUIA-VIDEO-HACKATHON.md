# Guía práctica — video hackathon Cello

**URL:** https://cello-avax.vercel.app  
**Contrato Fuji:** `0x45C1316953c92C402AB9e14EA628182A3494FD7F`  
**Duración objetivo:** 3–5 minutos (más prep off-camera)

---

## Regla de oro para el video

**En cámara solo mostrás la UI de Cello.** Nada de consola del navegador, terminal ni MetaMask seed phrase.

Hay dos caminos válidos; elegí **uno** y ensayalo una vez completo.

| Camino | Cuándo usarlo | En video se ve |
|--------|----------------|----------------|
| **A — 100% UI (recomendado)** | Wallets nuevas que nunca registraste por script | Registro ZK en vivo → transferencia → auditoría |
| **B — Prep + importar clave** | Reutilizás wallets ya registradas on-chain (deployer/FinNova) | Panel “Importar clave local” en `/registro` (15 s, off-script o narrado) |

---

## Camino A — Demo solo UI (el que mejor queda en video)

### Antes de grabar (30–45 min, sin cámara)

1. **Dos perfiles de Chrome** (o dos navegadores):
   - Perfil **Bankaool** → MetaMask wallet A  
   - Perfil **FinNova** → MetaMask wallet B  

2. **Faucet Fuji** en ambas: https://faucet.avax.network/

3. **Wallet A — registro completo en la app:**
   - https://cello-avax.vercel.app/registro  
   - Conectar → Fuji → checkbox KYC → **Registrar en eERC20**  
   - Esperar ZK (~1–2 min) hasta “Registro exitoso”  
   - La app guarda la clave sola; **no hace falta consola**

4. **Anotá la dirección de A** (para mint off-camera).

5. **Mint de saldo demo** (terminal, off-camera):

   ```bash
   cd avalanche-back/EncryptedERC
   RECIPIENT_ADDRESS=0xTU_WALLET_A MINT_AMOUNT=5000 \
     npx hardhat run scripts/mint-demo-fuji.ts --network fuji
   ```

6. **Wallet B — solo registro** (mismo flujo en `/registro` con perfil B).

7. **Ensayo:** A en `/transferencias` → saldo ~5000 → transferir a B → B o A auditor en `/auditoria`.

8. **Barra de estado** (header): que esté en verde o al menos Contrato + Circuitos + Fuji.

### Qué mostrar en pantalla (guion 3–5 min)

| Min | Pantalla | Qué decir / qué hacer |
|-----|----------|------------------------|
| 0:00 | `/` Landing | Problema: bancos no pueden mostrar montos on-chain; Cello + eERC en Avalanche. |
| 0:30 | `/registro` (wallet A) | “Onboarding institucional: wallet, KYC demo, registro ZK en Fuji.” Mostrar los 3 pasos en verde si ya registraste antes; **o** registrar en vivo si querés dramatismo (suma 2 min). |
| 1:30 | `/transferencias` (wallet A) | Saldo descifrado solo en esta wallet. Elegir contraparte **FinNova**. Monto ej. 100 CELL. **Transferir** → barra ZK. |
| 2:30 | Snowtrace (tx hash) | “En el explorador el monto no está en claro.” |
| 3:00 | `/auditoria` (wallet B o auditor) | “Vista CNBV: descifrar con clave auditor.” Tabla con montos reales. |
| 3:30 | `/recibir` (wallet B) | Dirección institucional para cobrar. Cierre: testnet Fuji, contrato propio, listo para KYC real. |

### Qué NO mostrar

- Consola F12  
- `sessionStorage`  
- Terminal / Hardhat (salvo B-roll editado)  
- Wallets con “registrado” pero saldo “—” (falta clave o mint)

---

## Camino B — Wallets demo en producción (recomendado si ya están registradas)

Todo en **https://cello-avax.vercel.app** — sin localhost ni consola.

### Antes de grabar (5 min)

1. Confirmar deploy: https://cello-avax.vercel.app/api/demo/status → `demoUnlockConfigured: true`  
2. Perfil **Bankaool** → MetaMask `0x79d23…` → `/registro`  
3. Esperar 2–3 s en `/registro` o `/transferencias` → **Clave ZK: en sesión** (auto-sync servidor demo, sin código en pantalla)  
4. **Transferencias** → saldo ~5000 CELL  
5. Perfil **FinNova** → misma cuenta demo; **auditoría** con esa wallet  

### En el video (15 s, en `/registro`)

> “Las credenciales institucionales se sincronizan con el HSM de demo al conectar la wallet — sin pegar secretos ni códigos en pantalla.”

Mostrá el panel **Estado** con **Clave ZK: en sesión** (no F12).

---

## Checklist visual antes de grabar

- [ ] https://cello-avax.vercel.app/api/health → `"ok": true`  
- [ ] MetaMask en **Avalanche Fuji** (43113)  
- [ ] Barra demo: **Circuitos** y **Contrato** en verde  
- [ ] Wallet emisora: **Registro** + **Clave ZK** en verde (panel lateral en transferencias)  
- [ ] Saldo distinto de “—”  
- [ ] Destino registrado (FinNova o contraparte del .env)  
- [ ] Segunda pestaña lista para `/auditoria`  

---

## Plan B si ZK tarda o falla en vivo

1. Tener **captura o clip corto** de una transferencia exitosa.  
2. Decir: “La prueba ZK corre en el cliente; en producción usamos workers y CDN.”  
3. Mostrar igual **Snowtrace** + **auditoría** con txs ya hechas en el ensayo.

---

## Qué resaltar para los jueces (mensajes clave)

1. **Privacidad real:** eERC20 + SDK Ava Labs, no mock.  
2. **Contrato propio** en Fuji (dirección en footer / barra de estado).  
3. **Dual-lock:** privado para el mundo, legible para contraparte y auditor.  
4. **Producto institucional:** KYC demo, contrapartes, panel CNBV, Neon para metadata (sin montos en claro en DB).  
5. **InterbankVault** (opcional 10 s): segundo contrato escrow AVAX — roadmap, no obligatorio en el video.

---

## Estructura sugerida del archivo de video

1. Hook (15 s) — problema + logo Cello  
2. Demo UI (3 min) — registro o import → transfer → auditor  
3. Tech stack (30 s) — Fuji, eERC, ZK en browser  
4. Cierre (15 s) — link vercel + GitHub  

---

## Resumen para el equipo

| Rol | Acción en video |
|-----|------------------|
| **Presentador** | Narra en landing + transferencias |
| **Operador wallet A** | Bankaool — transferencia |
| **Operador wallet B** | FinNova — recibir / auditoría |

**Mejor inversión de tiempo:** Camino A con **dos wallets nuevas** registradas solo por `/registro`. Cero consola, historia coherente para hackathon.
