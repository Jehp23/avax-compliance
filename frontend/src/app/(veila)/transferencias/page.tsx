"use client";

import { type FormEvent, useState } from "react";
import { isAddress } from "viem";
import { useAccount } from "wagmi";

import {
  demoHistory,
  verifiedCounterparties,
} from "@/data/demo";
import { getEercTokenAddress } from "@/lib/contracts";
import { shortAddress } from "@/lib/format-address";

export default function TransferenciasPage() {
  const { address, isConnected } = useAccount();
  const tokenEnv = getEercTokenAddress();
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState(
    "Liquidación préstamo Q2 · Bankaool",
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  function pickCounterparty(addrShort: string, fullEth?: string) {
    if (fullEth) setDestination(fullEth);
    else setDestination(addrShort);
    setFeedback(null);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (!isConnected || !address) {
      setFeedback("Conectá tu wallet para firmar la transferencia.");
      return;
    }

    const trimmed = destination.trim();
    if (!isAddress(trimmed)) {
      setFeedback(
        "Ingresá una dirección Ethereum válida (0x…) como destino institucional.",
      );
      return;
    }

    const token = tokenEnv;
    if (!token) {
      setFeedback(
        "Falta NEXT_PUBLIC_EERC_TOKEN_ADDRESS en .env.local. Cuando tu equipo deploye el token/contrato eERC20, pegá la dirección y reiniciá el servidor.",
      );
      return;
    }

    if (!amount.trim()) {
      setFeedback("Indicá un monto.");
      return;
    }

    setFeedback(
      `Listo para integrar SDK: destino ${shortAddress(trimmed)}, monto ${amount.trim()} MXN (referencia registrada). El siguiente paso es llamar a @avalabs/eerc-sdk desde este handler.`,
    );
  }

  return (
    <main id="main-content">
      <div className="app-layout">
        <aside aria-label="Resumen y navegación">
          <div className="bal-block">
            <div className="bal-label">SALDO DESCIFRADO (LOCAL)</div>
            <div className="bal-val">—</div>
            <div className="bal-currency">
              Pendiente de SDK · ejemplo demo $842,500 MXN
            </div>
            <div className="bal-enc">
              <span className="enc-dot" aria-hidden />
              on-chain permanece encriptado
            </div>
          </div>

          <div className="aside-sect">
            <div className="aside-label">MENÚ</div>
            <nav aria-label="Acciones">
              <div className="aside-item active">
                <span className="aside-icon" aria-hidden>
                  ⇄
                </span>{" "}
                Transferir
              </div>
              <div className="aside-item">
                <span className="aside-icon" aria-hidden>
                  ↓
                </span>{" "}
                Recibir
              </div>
              <div className="aside-item">
                <span className="aside-icon" aria-hidden>
                  ◎
                </span>{" "}
                Historial
              </div>
              <div className="aside-item">
                <span className="aside-icon" aria-hidden>
                  ◈
                </span>{" "}
                Mis claves
              </div>
            </nav>
          </div>

          <div className="aside-sect">
            <div className="aside-label">ESTADO</div>
            <div className="stat-row">
              <span className="stat-key">Wallet</span>
              <span className={`stat-val ${isConnected ? "ok" : "warn"}`}>
                {isConnected ? "conectada" : "desconectada"}
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-key">Cuenta</span>
              <span className="stat-val">{address ? shortAddress(address) : "—"}</span>
            </div>
            <div className="stat-row">
              <span className="stat-key">Contrato eERC</span>
              <span className={`stat-val ${tokenEnv ? "ok" : "warn"}`}>
                {tokenEnv ? "configurado" : "falta .env"}
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-key">Auditor</span>
              <span className="stat-val warn">CNBV</span>
            </div>
          </div>
        </aside>

        <div className="main">
          <div className="main-head">
            <div>
              <h2 className="main-title">Nueva transferencia</h2>
              <p className="main-sub">
                Montos cifrados para el público · copia auditada para el regulador
                · ZK proof al integrar el SDK
              </p>
            </div>
            <div className="enc-status">
              <span className="enc-dot" aria-hidden />
              Encriptación (eERC20)
            </div>
          </div>

          {feedback ? (
            <div
              className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--bg2)] px-3 py-2 text-[12px] leading-relaxed text-[var(--text2)]"
              role="status"
            >
              {feedback}
            </div>
          ) : null}

          <form className="form-card" onSubmit={onSubmit}>
            <div className="form-card-head">
              <div className="form-card-title">Datos de la transferencia</div>
              <div className="form-card-meta">eERC20 · privilegio dual</div>
            </div>
            <div className="fields">
              <div className="fl">
                <label className="fl-label" htmlFor="dest-address">
                  INSTITUCIÓN DESTINO (0x…)
                </label>
                <input
                  id="dest-address"
                  className="fl-input"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="0x…"
                  autoComplete="off"
                />
              </div>
              <div className="fl">
                <span className="fl-label" id="amount-label">
                  MONTO
                </span>
                <div className="amt-row" role="group" aria-labelledby="amount-label">
                  <input
                    className="fl-input lg"
                    style={{ flex: 1 }}
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    aria-describedby="amount-hint"
                  />
                  <span className="currency-sel" aria-hidden>
                    MXN
                  </span>
                  <span className="priv-flag">
                    <span className="enc-dot" aria-hidden />
                    dual-lock
                  </span>
                </div>
                <span id="amount-hint" className="visually-hidden">
                  Visible para destinatario y auditor al descifrar
                </span>
              </div>
              <div className="fl">
                <label className="fl-label" htmlFor="tx-ref">
                  REFERENCIA
                </label>
                <input
                  id="tx-ref"
                  className="fl-input"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>
            </div>
            <div className="form-footer">
              <button type="submit" className="submit-btn">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Preparar envío (ZK / SDK)
              </button>
            </div>
          </form>

          <h3 className="section-label">Historial (demo)</h3>
          <div className="tx-table" role="region" aria-label="Historial de ejemplo">
            <div className="tx-head">
              <div>DESTINO</div>
              <div>MONTO</div>
              <div>ESTADO</div>
              <div>FECHA</div>
            </div>
            {demoHistory.map((tx, i) => (
              <div key={i} className="tx-row">
                <div className="tx-ent">
                  <div className="tx-ico" aria-hidden>
                    {tx.direction === "out" ? "→" : "←"}
                  </div>
                  <div>
                    <div className="tx-to">{tx.counterparty}</div>
                    <div className="tx-hash-sm">{tx.hashShort}</div>
                  </div>
                </div>
                <div>
                  <div
                    className={`tx-amt ${tx.direction === "out" ? "out" : "in"}`}
                  >
                    {tx.amountLabel}
                  </div>
                </div>
                <div>
                  <span className="zk-tag">
                    <span className="enc-dot" aria-hidden />
                    ZK válido
                  </span>
                </div>
                <div className="tx-time-sm">{tx.timeLabel}</div>
              </div>
            ))}
          </div>
        </div>

        <aside className="right" aria-label="Contrapartes y técnico">
          <div>
            <div className="r-title">Instituciones verificadas</div>
            <div className="cp-list">
              {verifiedCounterparties.map((cp) => (
                <button
                  key={cp.addrShort}
                  type="button"
                  className="cp"
                  onClick={() => pickCounterparty(cp.addrShort)}
                >
                  <span className="cp-av" aria-hidden>
                    {cp.initials}
                  </span>
                  <span className="cp-body">
                    <span className="cp-name">{cp.name}</span>
                    <span className="cp-addr">{cp.addrShort}</span>
                  </span>
                  <span
                    className="kyc-dot"
                    title="KYC verificado"
                    aria-label="KYC verificado"
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="r-title">ZK Proof · última tx</div>
            <div className="proof-block">
              <div className="proof-head">
                <span className="enc-dot" aria-hidden />
                metadata esperada del SDK
              </div>
              <div className="proof-body">
                <div>
                  protocolo <span className="proof-val">BabyJubjub</span>
                </div>
                <div>
                  cifrado <span className="proof-val">ElGamal</span>
                </div>
                <div>
                  auditor <span className="proof-val">CNBV</span>
                </div>
                <div>
                  bloque <span className="proof-val">—</span>
                </div>
                <div>
                  válido <span className="proof-ok">pendiente de tx real</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
