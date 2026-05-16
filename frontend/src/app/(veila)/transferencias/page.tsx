"use client";

import { type FormEvent, useState } from "react";
import { isAddress, parseUnits } from "viem";
import { useAccount } from "wagmi";

import { Feedback } from "@/components/feedback";
import { TxLink } from "@/components/tx-link";
import { ZkProgress } from "@/components/zk-progress";
import {
  useEncryptedBalanceHook,
  useVeilaEerc,
} from "@/contexts/eerc-context";
import { getVerifiedCounterparties } from "@/data/demo";
import { getEercContractAddress } from "@/lib/contracts";
import { shortAddress } from "@/lib/format-address";

export default function TransferenciasPage() {
  const { address, isConnected } = useAccount();
  const { sdk } = useVeilaEerc();
  const balance = useEncryptedBalanceHook();
  const contract = getEercContractAddress();

  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastTx, setLastTx] = useState<`0x${string}` | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const counterparties = getVerifiedCounterparties();
  const decimals = balance.decimals ? Number(balance.decimals) : 18;
  const bal = balance.parsedDecryptedBalance ?? "—";

  function pickCounterparty(addr?: `0x${string}`) {
    if (addr) {
      setDestination(addr);
      setError(null);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFeedback(null);

    try {
      if (!isConnected || !address) {
        setError("Conectá tu wallet en Fuji.");
        return;
      }
      if (!sdk.isRegistered) {
        setError("Completá el registro en /registro antes de transferir.");
        return;
      }
      const trimmed = destination.trim();
      if (!isAddress(trimmed)) {
        setError("Destino inválido: dirección 0x completa.");
        return;
      }
      const { isRegistered: destOk } = await sdk.isAddressRegistered(trimmed);
      if (!destOk) {
        setError("El destinatario debe estar registrado en eERC20.");
        return;
      }
      if (!amount.trim()) {
        setError("Indicá un monto.");
        return;
      }

      setFeedback("Generando prueba ZK (1–2 min). No cierres la pestaña…");
      const parsed = parseUnits(amount.trim(), decimals);
      const { transactionHash } = await balance.privateTransfer(
        trimmed,
        parsed,
        reference.trim() || undefined,
      );
      balance.refetchBalance();
      setLastTx(transactionHash as `0x${string}`);
      setFeedback("Transferencia enviada correctamente.");
      setAmount("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo enviar la transferencia.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main-content">
      <div className="app-layout">
        <aside aria-label="Resumen y navegación">
          <div className="bal-block">
            <div className="bal-label">SALDO DESCIFRADO (LOCAL)</div>
            <div className="bal-val">{bal}</div>
            <div className="bal-currency">
              {sdk.symbol || "eERC"} · contrato {shortAddress(contract)}
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
              <span className="stat-key">Registro eERC</span>
              <span className={`stat-val ${sdk.isRegistered ? "ok" : "warn"}`}>
                {sdk.isRegistered ? "activo" : "pendiente"}
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
                · ZK proof vía @avalabs/eerc-sdk
              </p>
            </div>
            <div className="enc-status">
              <span className="enc-dot" aria-hidden />
              Encriptación (eERC20)
            </div>
          </div>

          <Feedback message={error} variant="error" />
          <Feedback message={feedback} variant="success" />
          {lastTx ? (
            <p className="mb-4 text-[12px] text-[var(--text3)]">
              Transacción: <TxLink hash={lastTx} />
            </p>
          ) : null}
          {busy ? <ZkProgress /> : null}

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
                    {sdk.symbol || "TOKEN"}
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
              <button
                type="submit"
                className="submit-btn"
                disabled={busy || !sdk.isRegistered}
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
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                {busy ? "Enviando…" : "Transferir (ZK privado)"}
              </button>
            </div>
          </form>

          <h3 className="section-label">Historial</h3>
          <p className="text-[12px] text-[var(--text3)]">
            Las transacciones privadas se consultan en Snowtrace o en el panel del
            auditor. Próximo paso: listado en UI vía indexer.
          </p>
        </div>

        <aside className="right" aria-label="Contrapartes y técnico">
          <div>
            <div className="r-title">Instituciones verificadas</div>
            <div className="cp-list">
              {counterparties.map((cp) => (
                <button
                  key={cp.addrShort}
                  type="button"
                  className="cp"
                  disabled={!cp.address}
                  onClick={() => pickCounterparty(cp.address)}
                >
                  <span className="cp-av" aria-hidden>
                    {cp.initials}
                  </span>
                  <span className="cp-body">
                    <span className="cp-name">{cp.name}</span>
                    <span className="cp-addr">
                      {cp.address ? shortAddress(cp.address) : "sin .env"}
                    </span>
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
            <div className="r-title">ZK Proof · protocolo</div>
            <div className="proof-block">
              <div className="proof-head">
                <span className="enc-dot" aria-hidden />
                eERC20 · Avalanche Fuji
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
                  contrato <span className="proof-val">{shortAddress(contract)}</span>
                </div>
                <div>
                  válido <span className="proof-ok">on-chain tras tx</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
