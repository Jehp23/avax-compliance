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
    <div className="panel audit-code-card">
      <p className="panel-label">Código de auditoría</p>
      <p className="panel-text">
        Compartí este código para que cualquiera revise los metadatos en{" "}
        <Link href="/auditoria" className="underline">
          Auditoría
        </Link>
        .
      </p>
      <p className="audit-code-card__code" aria-label="Código">
        {auditAccessCode}
      </p>
      <div className="audit-code-card__actions">
        <button type="button" className="primary-btn" onClick={copyCode}>
          Copiar código
        </button>
        <Link href={auditUrl} className="secondary-btn">
          Abrir consulta
        </Link>
      </div>
      {txHash ? (
        <p className="audit-code-card__tx font-mono">
          Tx: {txHash.slice(0, 10)}…{txHash.slice(-8)}
        </p>
      ) : null}
    </div>
  );
}
