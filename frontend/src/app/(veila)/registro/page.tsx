"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAccount } from "wagmi";

export default function RegistroPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [kycDone, setKycDone] = useState(false);

  function simulateKyc() {
    setKycDone(true);
  }

  const walletDone = isConnected;

  return (
    <main id="main-content">
      <section className="screen" aria-labelledby="registro-heading">
        <div className="ob-wrap">
          <p className="ob-kicker">REGISTRO INSTITUCIONAL · PROTOCOLO eERC20</p>
          <h1 id="registro-heading" className="ob-title">
            Pagos privados con
            <br />
            compliance regulatorio
          </h1>
          <p className="ob-desc">
            Cada transferencia viaja como una “caja” con dos candados: una llave
            para la contraparte y otra para el auditor (CNBV). El mundo ve que
            hubo un movimiento; solo ellos pueden ver el monto. Completá los pasos
            para habilitar tu institución.
          </p>

          <ol className="steps" aria-label="Pasos de onboarding">
            <li className={`step ${walletDone ? "done" : "current"}`}>
              <span className="step-num">{walletDone ? "✓" : "1"}</span>
              <div className="step-body">
                <div className="step-name">Wallet conectada</div>
                <div className="step-meta">MetaMask u otra wallet · Avalanche Fuji</div>
              </div>
              <span
                className={`step-badge ${walletDone ? "badge-done" : "badge-current"}`}
              >
                {walletDone ? "listo" : "pendiente"}
              </span>
            </li>

            <li className={`step ${kycDone ? "done" : walletDone ? "current" : ""}`}>
              <span className="step-num">{kycDone ? "✓" : "2"}</span>
              <div className="step-body">
                <div className="step-name">KYC institucional verificado</div>
                <div className="step-meta">
                  {kycDone
                    ? "Demo · listo para Fuji"
                    : "Simulación hackathon — marcá como listo cuando quieras"}
                </div>
              </div>
              <span
                className={`step-badge ${kycDone ? "badge-done" : walletDone ? "badge-current" : "badge-pending"}`}
              >
                {kycDone ? "listo" : "pendiente"}
              </span>
            </li>

            <li className={`step ${walletDone && kycDone ? "current" : ""}`}>
              <span className="step-num">3</span>
              <div className="step-body">
                <div className="step-name">Registro en protocolo eERC20</div>
                <div className="step-meta">
                  Claves BabyJubjub locales + registro on-chain (tu equipo / SDK)
                </div>
              </div>
              <span className="step-badge badge-current">siguiente</span>
            </li>
          </ol>

          {!kycDone ? (
            <button
              type="button"
              className="mb-2 w-full rounded-lg border border-[var(--border)] bg-[var(--bg2)] px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-[var(--bg3)]"
              onClick={simulateKyc}
            >
              Simular KYC aprobado (demo)
            </button>
          ) : null}

          <button
            type="button"
            className="primary-btn"
            disabled={!walletDone || !kycDone}
            onClick={() => router.push("/transferencias")}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Ir a transferencias
          </button>

          {!walletDone || !kycDone ? (
            <p className="note !mt-3" role="note">
              Conectá la wallet en la barra superior y, si querés, simulá el KYC
              para desbloquear el flujo completo del MVP.
            </p>
          ) : (
            <div className="note" role="note">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
                style={{ flexShrink: 0, marginTop: 1 }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Las claves se generan localmente (BabyJubjub). La clave privada no
              sale del dispositivo; la pública queda en el contrato cuando el
              equipo integra el SDK.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
