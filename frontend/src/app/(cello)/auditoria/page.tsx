"use client";

import { type FormEvent, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { Feedback } from "@/components/feedback";
import { PageHeader } from "@/components/cello/page-header";
import { PageShell } from "@/components/cello/page-shell";
import { TxLink } from "@/components/tx-link";
import { shortAddress } from "@/lib/format-address";

type AuditTransfer = {
  auditAccessCode: string;
  txHash: string;
  fromAddress: string;
  toAddress: string | null;
  fromName: string | null;
  toName: string | null;
  transferType: string;
  reference: string | null;
  amountDisplay: string | null;
  tokenSymbol: string | null;
  contractAddress: string | null;
  indexedAt: string;
};

function AuditoriaContent() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [row, setRow] = useState<AuditTransfer | null>(null);

  useEffect(() => {
    const q = searchParams.get("code")?.trim().toUpperCase();
    if (q) {
      setCode(q);
      void lookup(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function lookup(accessCode: string) {
    const normalized = accessCode.trim().toUpperCase();
    if (!normalized) {
      setError("Ingresá un código de auditoría.");
      return;
    }
    setBusy(true);
    setError(null);
    setRow(null);
    try {
      const res = await fetch(
        `/api/audit?code=${encodeURIComponent(normalized)}`,
      );
      const data = (await res.json()) as {
        transfer?: AuditTransfer;
        error?: string;
      };
      if (!res.ok || !data.transfer) {
        setError(data.error ?? "Código no encontrado.");
        return;
      }
      setRow(data.transfer);
    } catch {
      setError("Error de red al consultar el código.");
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void lookup(code);
  }

  return (
    <>
      <form onSubmit={onSubmit} className="panel audit-search-form">
        <label className="fl">
          <span className="fl-label">Código de auditoría</span>
          <input
            className="fl-input font-mono tracking-wider uppercase"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="CEL-XXXXXX"
            autoComplete="off"
          />
        </label>
        <div className="audit-search-form__actions">
          <button type="submit" className="primary-btn" disabled={busy}>
            {busy ? "Consultando…" : "Consultar transferencia"}
          </button>
        </div>
      </form>

      <Feedback message={error} variant="error" />

      {row ? (
        <div className="panel audit-result" role="region" aria-label="Detalle auditado">
          <header className="audit-result__head">
            <p className="panel-label">Transferencia verificada</p>
            <p className="audit-result__code" aria-label="Código de auditoría">
              {row.auditAccessCode}
            </p>
          </header>
          <dl className="audit-result__details">
            <AuditDl
              label="Monto (declarado)"
              value={
                row.amountDisplay
                  ? `${row.amountDisplay} ${row.tokenSymbol ?? "CELL"}`
                  : "—"
              }
            />
            <AuditDl
              label="Origen"
              value={
                row.fromName
                  ? `${row.fromName} · ${shortAddress(row.fromAddress)}`
                  : row.fromAddress
              }
            />
            <AuditDl
              label="Destino"
              value={
                row.toAddress
                  ? row.toName
                    ? `${row.toName} · ${shortAddress(row.toAddress)}`
                    : row.toAddress
                  : "—"
              }
            />
            <AuditDl label="Tipo" value={row.transferType} />
            <AuditDl label="Referencia" value={row.reference ?? "—"} />
            <AuditDl
              label="Contrato"
              value={shortAddress(row.contractAddress ?? "0x0")}
            />
            <AuditDl
              label="Fecha"
              value={new Date(row.indexedAt).toLocaleString("es-MX")}
            />
            <div>
              <dt className="text-[var(--text3)] text-xs mb-1">Transacción</dt>
              <dd>
                <TxLink hash={row.txHash as `0x${string}`} />
              </dd>
            </div>
          </dl>
          <p className="audit-result__footnote">
            En Snowtrace el monto sigue privado on-chain. Este registro es el
            comprobante institucional emitido al confirmar la transferencia.
          </p>
        </div>
      ) : null}
    </>
  );
}

function AuditDl({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[var(--text3)] text-xs mb-0.5">{label}</dt>
      <dd className="font-mono text-[13px] break-all">{value}</dd>
    </div>
  );
}

export default function AuditoriaPage() {
  return (
    <PageShell width="wide">
      <PageHeader
        kicker="Auditoría"
        title="Consulta por código"
        description="Con el código de una transferencia, cualquiera puede revisar origen, destino, monto declarado y hash en Fuji."
      />
      <Suspense fallback={<Feedback message="Cargando…" variant="loading" />}>
        <AuditoriaContent />
      </Suspense>
    </PageShell>
  );
}
