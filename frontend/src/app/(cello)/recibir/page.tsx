"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

import { Feedback } from "@/components/feedback";
import { PageHeader } from "@/components/cello/page-header";
import { PageShell } from "@/components/cello/page-shell";
import { useCelloEerc } from "@/contexts/eerc-context";
import { explorerAddressUrl } from "@/lib/explorer";
import { isAvaxPaymentMode } from "@/lib/payment-asset";

export default function RecibirPage() {
  const { address, isConnected } = useAccount();
  const { sdk } = useCelloEerc();
  const avaxMode = isAvaxPaymentMode();
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  async function copyAddress() {
    if (!address) return;
    setCopyMsg(null);
    try {
      await navigator.clipboard.writeText(address);
      setCopyMsg("Copiado.");
    } catch {
      setCopyMsg("No se pudo copiar.");
    }
  }

  return (
    <PageShell width="narrow">
      <PageHeader
        kicker="Recibir"
        title="Tu dirección"
        description="Compartila para que otra institución te envíe CELL en Fuji."
      />

      {!isConnected || !address ? (
        <Feedback message="Conectá tu wallet en Fuji." variant="info" />
      ) : (
        <div className="receive-card">
          <p className="receive-label">Wallet en Fuji</p>
          <div className="receive-addr">{address}</div>
          <Feedback
            message={copyMsg}
            variant={copyMsg?.includes("No") ? "error" : "success"}
          />
          <div className="btn-row">
            <button type="button" className="primary-btn" onClick={copyAddress}>
              Copiar
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
        </div>
      )}

      {!avaxMode && isConnected ? (
        <p className="receive-status">
          eERC:{" "}
          <span className={sdk.isRegistered ? "status-ok" : "status-warn"}>
            {sdk.isRegistered ? "registrado" : "pendiente"}
          </span>
        </p>
      ) : null}
    </PageShell>
  );
}
