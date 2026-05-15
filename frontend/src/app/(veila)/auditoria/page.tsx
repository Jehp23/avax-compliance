"use client";

import { type FormEvent, useState } from "react";

import { auditorRows } from "@/data/demo";

export default function AuditoriaPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);

  const expected = process.env.NEXT_PUBLIC_AUDITOR_PREVIEW_SECRET;
  const requiresUnlock = Boolean(expected);

  function onUnlock(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!expected) return;
    if (secret.trim() !== expected) {
      setError("Clave incorrecta.");
      return;
    }
    setUnlocked(true);
  }

  const showPanel = !requiresUnlock || unlocked;

  return (
    <main id="main-content" className="screen">
      <div className="aud-wrap">
        <div className="aud-banner">
          <div className="aud-left">
            <h2 className="aud-title">
              Panel de auditoría
              <span className="restricted">CNBV · RESTRINGIDO</span>
            </h2>
            <p className="aud-sub">
              Vista regulatoria · montos en claro aquí son datos de ejemplo hasta que el
              backend descifre transacciones reales con la auditor key.
            </p>
          </div>
          <div className="key-block">
            <div>
              <div className="key-lbl">AUDITOR KEY</div>
              <div className="key-v">HSM / variable segura en prod.</div>
            </div>
          </div>
        </div>

        {!requiresUnlock ? (
          <p className="mb-4 rounded-lg border border-dashed border-[var(--border2)] bg-[var(--bg2)] px-3 py-2 text-[11px] text-[var(--text3)]">
            Tip: para demos públicas definí{" "}
            <code className="rounded bg-[var(--bg3)] px-1 font-mono">NEXT_PUBLIC_AUDITOR_PREVIEW_SECRET</code>{" "}
            y la tabla quedará detrás de contraseña.
          </p>
        ) : null}

        {requiresUnlock && !unlocked ? (
          <form
            onSubmit={onUnlock}
            className="mb-6 max-w-md rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-5"
          >
            <p className="mb-3 text-[13px] text-[var(--text3)]">
              Ingresá la clave de vista previa configurada en{" "}
              <code className="rounded bg-[var(--bg3)] px-1 py-0.5 font-mono text-[11px]">
                .env.local
              </code>
              .
            </p>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-[var(--text4)]">
              Clave de vista previa
            </label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="mb-3 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 font-mono text-[12px]"
              placeholder="••••••••"
              autoComplete="off"
            />
            {error ? (
              <p className="mb-2 text-[12px] text-[var(--red)]">{error}</p>
            ) : null}
            <button type="submit" className="primary-btn">
              Desbloquear panel (demo)
            </button>
          </form>
        ) : null}

        {showPanel ? (
          <>
            <div className="aud-stats" aria-label="Resumen global (demo)">
              <div className="aud-stat">
                <div className="aud-stat-lbl">TX TOTALES</div>
                <div className="aud-stat-val">1,284</div>
                <div className="aud-stat-sub">últimos 30 días</div>
              </div>
              <div className="aud-stat">
                <div className="aud-stat-lbl">VOLUMEN</div>
                <div className="aud-stat-val">$42.8M</div>
                <div className="aud-stat-sub">MXN (dataset demo)</div>
              </div>
              <div className="aud-stat">
                <div className="aud-stat-lbl">INSTITUCIONES</div>
                <div className="aud-stat-val">12</div>
                <div className="aud-stat-sub">activas</div>
              </div>
              <div className="aud-stat">
                <div className="aud-stat-lbl">ZK PROOFS</div>
                <div className="aud-stat-val">100%</div>
                <div className="aud-stat-sub ok">todos válidos (demo)</div>
              </div>
            </div>

            <div className="aud-table" role="region" aria-label="Registro auditado (demo)">
              <div className="aud-table-head">
                <div className="aud-table-title">Registro completo</div>
                <div className="aud-table-meta">VISTA REGULATORIA</div>
              </div>
              <div className="aud-th">
                <div>ORIGEN</div>
                <div>DESTINO</div>
                <div>MONTO REAL</div>
                <div>ESTADO</div>
                <div>DESCIFRADO</div>
                <div>TX HASH</div>
              </div>

              {auditorRows.map((row, i) => (
                <div key={i} className="aud-row">
                  <div>
                    <div className="aud-addr">{row.fromAddr}</div>
                    <div className="aud-name">{row.fromName}</div>
                  </div>
                  <div>
                    <div className="aud-addr">{row.toAddr}</div>
                    <div className="aud-name">{row.toName}</div>
                  </div>
                  <div className="aud-amt">{row.amount}</div>
                  <div>
                    <span
                      className={`tag ${row.txStatus === "ok" ? "tag-ok" : "tag-pnd"}`}
                    >
                      {row.txStatus === "ok" ? "confirmada" : "pendiente"}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`tag ${row.decryptStatus === "ok" ? "tag-ok" : "tag-ndec"}`}
                    >
                      {row.decryptStatus === "ok" ? "descifrado" : "pendiente"}
                    </span>
                  </div>
                  <div className="aud-link" tabIndex={0} role="link">
                    {row.hashShort}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
