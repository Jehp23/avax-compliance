"use client";

import { useAccount } from "wagmi";

import { Feedback } from "@/components/feedback";
import { PageHeader } from "@/components/veila/page-header";
import { PageShell } from "@/components/veila/page-shell";
import { useVeilaEerc } from "@/contexts/eerc-context";
import { explorerAddressUrl } from "@/lib/explorer";

export default function RecibirPage() {
  const { address, isConnected } = useAccount();
  const { sdk } = useVeilaEerc();

  async function copyAddress() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      /* ignore */
    }
  }

  return (
    <PageShell width="narrow">
      <PageHeader
        kicker="Recibir"
        title="Tu dirección institucional"
        description="Compartí este 0x con quien te envíe fondos. El remitente debe estar registrado en el mismo contrato eERC."
      />

      {!isConnected || !address ? (
        <Feedback
          message="Conectá tu wallet en Fuji para ver tu dirección."
          variant="info"
        />
      ) : (
        <>
          
          <div className="receive-addr">{address}</div>
          <div className="btn-row">
            <button type="button" className="primary-btn" onClick={copyAddress}>
              Copiar dirección
            </button>
            <a
              href={explorerAddressUrl(address)}
              target="_blank"
              rel="noopener noreferrer"
              className="secondary-btn"
            >
              Snowtrace ↗
            </a>
          </div>
        </>
      )}

      <div className="note mt-6" role="note">
        Registro eERC:{" "}
        <span className={sdk.isRegistered ? "text-[var(--green)]" : "text-[var(--amber)]"}>
          {sdk.isRegistered ? "activo" : "pendiente — /registro"}
        </span>
        {" · "}
        Token: {sdk.symbol || "eERC"}
      </div>
    </PageShell>
  );
}
