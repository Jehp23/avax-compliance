"use client";

import Link from "next/link";

type Props = {
  auditAccessCode: string;
  txHash?: string | null;
};

export function AuditCodeCard({ auditAccessCode, txHash }: Props) {
  const auditUrl = `/auditoria?code=${encodeURIComponent(auditAccessCode)}`;

  function copyCode() {
    void navigator.clipboard.writeText(auditAccessCode);
  }

  return (
    <div className="panel mt-4 border border-[var(--green)]/30 bg-[var(--bg2)]">
      <p className="panel-label mb-1">Código de auditoría</p>
      <p className="panel-text text-sm mb-3">
        Compartí este código para que cualquiera revise los metadatos de esta
        transferencia en{" "}
        <Link href="/auditoria" className="underline">
          Auditoría
        </Link>
        .
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <code className="rounded-lg bg-[var(--bg3)] px-3 py-2 font-mono text-lg tracking-wider">
          {auditAccessCode}
        </code>
        <button type="button" className="primary-btn text-sm" onClick={copyCode}>
          Copiar
        </button>
        <Link href={auditUrl} className="text-sm text-[var(--text2)] underline">
          Abrir consulta
        </Link>
      </div>
      {txHash ? (
        <p className="mt-2 text-[11px] text-[var(--text3)] font-mono">
          Tx: {txHash.slice(0, 10)}…{txHash.slice(-8)}
        </p>
      ) : null}
    </div>
  );
}
