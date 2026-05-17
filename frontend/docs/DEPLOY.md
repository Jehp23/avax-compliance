# Deploy del frontend Cello

## Requisitos

- Node.js **20+**
- Cuenta [Vercel](https://vercel.com) (o cualquier host que soporte Next.js 16 + webpack)

## Setup local

```bash
cd frontend
cp .env.example .env.local
npm install
npm run circuits:fetch    # si public/circuits/ está vacío
npm run dev --webpack
```

Build de producción:

```bash
npm run build    # usa next build --webpack (ver package.json)
npm run start
```

## Deploy en Vercel

1. **Import** del repo
2. **Root Directory** = `frontend` (**obligatorio** si ves `No Next.js version detected`)
3. **Framework Preset** = Next.js (auto si el root es `frontend`)
3. **Build Command** (default o explícito):

   ```bash
   npm run build
   ```

   Los circuitos ZK deben existir en `public/circuits/`. Opciones:

   - **Recomendado (hackathon):** commitear `public/circuits/` en Git → build más rápido
   - **Alternativa:** Build Command = `npm run circuits:fetch && npm run build`

4. **Install Command:** `npm install`
5. Pegar variables de [ENV.md](./ENV.md) en *Settings → Environment Variables*
6. Deploy → abrir `https://<tu-app>/api/health`

## Health check

```bash
curl https://<tu-app>/api/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "chain": "avalanche-fuji",
  "chainId": 43113,
  "contract": "0x...",
  "eercEnvConfigured": true,
  "circuits": true,
  "timestamp": "..."
}
```

## Scripts npm

| Script | Descripción |
|--------|-------------|
| `npm run dev --webpack` | Desarrollo (webpack requerido por eerc-sdk) |
| `npm run build` | Producción |
| `npm run start` | Servir build |
| `npm run lint` | ESLint |
| `npm run circuits:fetch` | Descarga WASM/ZKEY a `public/circuits/` |

## Configuración Next.js

- `next.config.ts`: `transpilePackages: @avalabs/eerc-sdk`, webpack + polyfills (`crypto-browserify`)
- El build **debe** usar webpack (`--webpack`), no solo Turbopack, por WASM/ZK

## Error `No Next.js version detected`

Vercel busca `next` en el `package.json` del **Root Directory** del proyecto.

- **Opción A (recomendada):** Vercel → *Project Settings* → *General* → **Root Directory** → `frontend` → *Save* → *Redeploy*.
- **Opción B:** Dejar Root Directory en la raíz del repo; el monorepo usa `workspaces` + `vercel.json` en la raíz (ver `../vercel.json`).

No mezcles `installCommand: npm install --prefix frontend` con Root Directory vacío y `framework: nextjs` en la raíz: el install corre en `frontend/` pero la detección lee el `package.json` de la raíz.

## Checklist post-deploy

- [ ] `/` landing carga
- [ ] `/api/health` → `circuits: true`
- [ ] Barra de estado: contrato + Fuji en verde
- [ ] Registro completa con tx en Snowtrace
- [ ] Transferencia entre dos wallets registradas
- [ ] Auditoría con wallet auditor

## CI

GitHub Actions en `.github/workflows/ci.yml` valida build + lint en cada push/PR.
