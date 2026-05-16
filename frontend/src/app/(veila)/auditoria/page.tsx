"use client";

import { type FormEvent, useState } from "react";
import { useAccount } from "wagmi";

import { Feedback } from "@/components/feedback";
import { useVeilaEerc } from "@/contexts/eerc-context";
import { getPublicEnv } from "@/lib/contracts";
import { explorerTx } from "@/lib/eerc-config";
import { shortAddress } from "@/lib/format-address";

type DecryptedRow = {
  type: string;
  amount: string;
  sender: `0x${string}`;
  receiver: `0x${string}` | null;
  transactionHash: `0x${string}`;
};

export default function AuditoriaPage() {
  const { address, isConnected } = useAccount();
  const { sdk, contractAddress } = useVeilaEerc();
  const env = getPublicEnv();

  const [unlocked, setUnlocked] = useState(false);
  const [secret, setSecret] = useState("");
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [rows, setRows] = useState<DecryptedRow[]>([]);

  const expected = env.auditorPreviewSecret;
  const requiresUnlock = Boolean(expected);
  const showPanel = !requiresUnlock || unlocked;

  function onUnlock(e: FormEvent) {
    e.preventDefault();
    setUnlockError(null);
    if (!expected) return;
    if (secret.trim() !== expected) {
      setUnlockError("Clave incorrecta.");
      return;
    }
    setUnlocked(true);
  }

  async function handleDecrypt() {
    setBusy(true);
    setError(null);
    setFeedback(null);
    setRows([]);

    try {
      if (!isConnected || !address) {
        setError("Conectá la wallet del auditor en Fuji.");
        return;
      }
      if (!sdk.isAuditorKeySet) {
        setError(
          "La clave pública del auditor no está configurada en el contrato. El deploy debe llamar setContractAuditorPublicKey.",
        );
        return;
      }
      if (!sdk.areYouAuditor) {
        setError(
          "Esta wallet no es el auditor del contrato. Usá la dirección configurada en el deploy (CNBV / HSM).",
        );
        return;
      }

      setFeedback("Descifrando transacciones auditables (puede tardar)…");
      const decrypted = await sdk.auditorDecrypt();
      setRows(decrypted as DecryptedRow[]);
      setFeedback(
        decrypted.length
          ? `${decrypted.length} transacción(es) descifradas.`
          : "Sin transacciones auditables todavía.",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo descifrar como auditor.",
      );
    } finally {
      setBusy(false);
    }
  }

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
              Descifrado regulatorio vía clave auditor del protocolo eERC20. Solo la
              wallet designada como auditor puede ver montos en claro.
            </p>
          </div>
          <div className="key-block">
            <div>
              <div className="key-lbl">AUDITOR KEY</div>
              <div className="key-v">
                {sdk.isAuditorKeySet ? "configurada on-chain" : "pendiente en deploy"}
              </div>
            </div>
          </div>
        </div>

        {!requiresUnlock ? (
          <p className="mb-4 rounded-lg border border-dashed border-[var(--border2)] bg-[var(--bg2)] px-3 py-2 text-[11px] text-[var(--text3)]">
            Tip: para demos públicas definí{" "}
            <code className="rounded bg-[var(--bg3)] px-1 font-mono">
              NEXT_PUBLIC_AUDITOR_PREVIEW_SECRET
            </code>{" "}
            y el panel quedará detrás de contraseña.
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
            {unlockError ? (
              <p className="mb-2 text-[12px] text-[var(--red)]">{unlockError}</p>
            ) : null}
            <button type="submit" className="primary-btn">
              Desbloquear panel (demo)
            </button>
          </form>
        ) : null}

        {showPanel ? (
          <>
            <div className="aud-stats" aria-label="Resumen">
              <div className="aud-stat">
                <div className="aud-stat-lbl">CONTRATO</div>
                <div className="aud-stat-val text-[14px]">
                  {shortAddress(contractAddress)}
                </div>
                <div className="aud-stat-sub">Avalanche Fuji</div>
              </div>
              <div className="aud-stat">
                <div className="aud-stat-lbl">WALLET</div>
                <div className="aud-stat-val">
                  {address ? shortAddress(address) : "—"}
                </div>
                <div className={`aud-stat-sub ${sdk.areYouAuditor ? "ok" : ""}`}>
                  {sdk.areYouAuditor ? "auditor activo" : "no es auditor"}
                </div>
              </div>
              <div className="aud-stat">
                <div className="aud-stat-lbl">TX DESCIFRADAS</div>
                <div className="aud-stat-val">{rows.length}</div>
                <div className="aud-stat-sub">última consulta</div>
              </div>
              <div className="aud-stat">
                <div className="aud-stat-lbl">ZK PROOFS</div>
                <div className="aud-stat-val">eERC</div>
                <div className="aud-stat-sub ok">BabyJubjub + ElGamal</div>
              </div>
            </div>

            <Feedback message={error} variant="error" />
            <Feedback message={feedback} variant="success" />

            <div className="mb-4">
              <button
                type="button"
                className="primary-btn"
                disabled={busy || !isConnected}
                onClick={handleDecrypt}
              >
                {busy ? "Descifrando…" : "Descifrar transacciones (auditor)"}
              </button>
            </div>

            <div className="aud-table" role="region" aria-label="Registro auditado">
              <div className="aud-table-head">
                <div className="aud-table-title">Registro completo</div>
                <div className="aud-table-meta">VISTA REGULATORIA · eERC20</div>
              </div>
              <div className="aud-th">
                <div>ORIGEN</div>
                <div>DESTINO</div>
                <div>MONTO REAL</div>
                <div>TIPO</div>
                <div>TX HASH</div>
              </div>

              {rows.length === 0 ? (
                <p className="px-4 py-6 text-[12px] text-[var(--text3)]">
                  Sin filas. Conectá la wallet auditor y ejecutá el descifrado después de
                  transferencias privadas en Fuji.
                </p>
              ) : (
                rows.map((row) => (
                  <div key={row.transactionHash} className="aud-row">
                    <div>
                      <div className="aud-addr">{shortAddress(row.sender)}</div>
                    </div>
                    <div>
                      <div className="aud-addr">
                        {row.receiver ? shortAddress(row.receiver) : "—"}
                      </div>
                    </div>
                    <div className="aud-amt">{row.amount}</div>
                    <div>
                      <span className="tag tag-ok">{row.type}</span>
                    </div>
                    <a
                      className="aud-link"
                      href={explorerTx(row.transactionHash)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {shortAddress(row.transactionHash)}
                    </a>
                  </div>
                ))
              )}
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
