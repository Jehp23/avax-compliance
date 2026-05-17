"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

import { Feedback } from "@/components/feedback";
import { PageHeader } from "@/components/cello/page-header";
import { PageShell } from "@/components/cello/page-shell";
import { useCelloEerc } from "@/contexts/eerc-context";
import { useMyInstitution } from "@/hooks/use-my-institution";
import { explorerAddressUrl } from "@/lib/explorer";
import { isAvaxPaymentMode } from "@/lib/payment-asset";

export default function RecibirPage() {
  const { address, isConnected } = useAccount();
  const { sdk } = useCelloEerc();
  const avaxMode = isAvaxPaymentMode();
  const { approved: institutionOk, loading: loadingInstitution } =
    useMyInstitution(address);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  async function copyAddress() {
    if (!address) return;
    setCopyMsg(null);
    try {
      await navigator.clipboard.writeText(address);
      setCopyMsg("Dirección copiada al portapapeles.");
    } catch {
      setCopyMsg("No se pudo copiar. Seleccioná el texto manualmente.");
    }
  }

  return (
    <PageShell width="narrow">
      <PageHeader
        kicker="Recibir"
        title="Dirección para cobros"
        description={
          avaxMode
            ? "Compartí esta dirección para recibir AVAX en Fuji. Los pagos deben originarse desde una institución verificada en Cello."
            : "Compartí esta dirección para recibir fondos cifrados. El remitente debe estar registrado en el mismo contrato eERC."
        }
      />

      {!isConnected || !address ? (
        <Feedback
          message="Conectá tu wallet en Fuji para ver tu dirección."
          variant="info"
        />
      ) : (
        <div className="receive-card">
          <p className="receive-label">Dirección en Fuji</p>
          <div className="receive-addr">{address}</div>
          <Feedback
            message={copyMsg}
            variant={copyMsg?.includes("No") ? "error" : "success"}
          />
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
        </div>
      )}

      <div className="note mt-6" role="note">
        {avaxMode ? (
          <>
            Estado en Cello:{" "}
            <span
              className={
                loadingInstitution
                  ? "status-warn"
                  : institutionOk
                    ? "status-ok"
                    : "status-warn"
              }
            >
              {loadingInstitution
                ? "verificando…"
                : institutionOk
                  ? "institución verificada"
                  : "onboarding pendiente (menú Registro)"}
            </span>
          </>
        ) : (
          <>
            Registro eERC:{" "}
            <span className={sdk.isRegistered ? "status-ok" : "status-warn"}>
              {sdk.isRegistered ? "activo" : "pendiente (menú Registro)"}
            </span>
            {" · "}
            Token: {sdk.symbol || "eERC"}
          </>
        )}
      </div>
    </PageShell>
  );
}
