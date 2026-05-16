"use client";

import { useAccount } from "wagmi";

import { Feedback } from "@/components/feedback";
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
    <main id="main-content">
      <section className="receive-wrap screen" aria-labelledby="recibir-heading">
        <p className="ob-kicker">RECIBIR PAGOS · eERC20</p>
        <h1 id="recibir-heading" className="ob-title">
          Tu dirección institucional
        </h1>
        <p className="ob-desc">
          Compartí esta dirección con la contraparte. El remitente debe estar registrado en el
          mismo contrato eERC y tener saldo privado para enviarte fondos.
        </p>

        {!isConnected || !address ? (
          <Feedback
            message="Conectá tu wallet en Fuji para ver tu dirección de recepción."
            variant="info"
          />
        ) : (
          <>
            <div className="receive-addr" id="receive-address">
              {address}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="primary-btn" onClick={copyAddress}>
                Copiar dirección
              </button>
              <a
                href={explorerAddressUrl(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-[12px] text-[var(--text2)] hover:bg-[var(--bg2)]"
              >
                Ver en Snowtrace ↗
              </a>
            </div>
          </>
        )}

        <div className="note mt-6" role="note">
          Registro eERC:{" "}
          <span className={sdk.isRegistered ? "text-[var(--green)]" : "text-[var(--amber)]"}>
            {sdk.isRegistered ? "activo" : "completá /registro primero"}
          </span>
          . Token: {sdk.symbol || "eERC"}.
        </div>
      </section>
    </main>
  );
}
