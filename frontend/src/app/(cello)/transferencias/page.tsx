"use client";

import { type FormEvent, useState } from "react";
import { isAddress, parseEther } from "viem";
import {
  useAccount,
  useBalance,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";

import { Feedback } from "@/components/feedback";
import { TxLink } from "@/components/tx-link";
import { TransferHistory } from "@/components/transfer-history";
import { AuditCodeCard } from "@/components/cello/audit-code-card";
import { CounterpartiesPanel } from "@/components/cello/counterparties-panel";
import { PageHeader } from "@/components/cello/page-header";
import { PageShell } from "@/components/cello/page-shell";
import { WalletStatus } from "@/components/cello/wallet-status";
import { useApprovedInstitutions } from "@/hooks/use-approved-institutions";
import { useMyInstitution } from "@/hooks/use-my-institution";
import { getPublicEnv } from "@/lib/env";
import { indexTransferOnServer } from "@/lib/index-transfer";
import { isAvaxPaymentMode } from "@/lib/payment-asset";
import { formatAvaxDisplay } from "@/lib/format-avax";
import { TransferenciasEerc } from "@/components/cello/transferencias-eerc";

export default function TransferenciasPage() {
  if (!isAvaxPaymentMode()) {
    return <TransferenciasEerc />;
  }
  return <TransferenciasAvax />;
}

function TransferenciasAvax() {
  const { address, isConnected } = useAccount();
  const env = getPublicEnv();
  const { data: balance, refetch: refetchBalance } = useBalance({ address });
  const { sendTransactionAsync } = useSendTransaction();
  const { approved: myInstitutionOk, loading: loadingMe } =
    useMyInstitution(address);

  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingHash, setPendingHash] = useState<`0x${string}` | null>(null);
  const [lastTx, setLastTx] = useState<`0x${string}` | null>(null);
  const [historyKey, setHistoryKey] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastAuditCode, setLastAuditCode] = useState<string | null>(null);

  const { institutions: counterparties, loading: loadingCp } =
    useApprovedInstitutions(address);

  const { isLoading: waitingReceipt, isSuccess: receiptOk } =
    useWaitForTransactionReceipt({ hash: pendingHash ?? undefined });

  const avaxBal = formatAvaxDisplay(balance?.value);

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
    setLastAuditCode(null);

    try {
      if (!isConnected || !address) {
        setError("Conectá tu wallet en Avalanche Fuji.");
        return;
      }
      if (!myInstitutionOk) {
        setError(
          "Completá el onboarding institucional (menú Registro) antes de transferir.",
        );
        return;
      }
      const trimmed = destination.trim();
      if (!isAddress(trimmed)) {
        setError("Destino inválido: dirección 0x completa.");
        return;
      }
      if (trimmed.toLowerCase() === address.toLowerCase()) {
        setError("No podés transferir a tu misma wallet.");
        return;
      }

      const destApproved = counterparties.some(
        (i) => i.walletAddress.toLowerCase() === trimmed.toLowerCase(),
      );
      if (!destApproved) {
        setError(
          "El destinatario debe figurar en el directorio de instituciones verificadas. Seleccioná una contraparte de la lista.",
        );
        return;
      }

      if (!amount.trim()) {
        setError("Indicá un monto en AVAX.");
        return;
      }

      const amountNormalized = amount.trim().replace(",", ".");
      let value: bigint;
      try {
        value = parseEther(amountNormalized);
      } catch {
        setError("Monto inválido. Ejemplo: 0.01 o 0.1");
        return;
      }
      if (value <= 0n) {
        setError("El monto debe ser mayor que cero.");
        return;
      }

      const gasReserve = parseEther("0.002");
      const current = balance?.value ?? 0n;
      if (current < value + gasReserve) {
        setError(
          `Saldo insuficiente: tenés ${formatAvaxDisplay(current)} AVAX (dejá ~0.002 para gas).`,
        );
        return;
      }

      setFeedback("Enviando AVAX en Fuji…");
      const hash = await sendTransactionAsync({
        to: trimmed,
        value,
      });
      setPendingHash(hash);
      setFeedback("Esperando confirmación en la red…");

      const indexed = await indexTransferOnServer({
        txHash: hash,
        fromAddress: address,
        toAddress: trimmed,
        transferType: "transfer",
        reference: reference.trim() || undefined,
        contractAddress: env.vaultContract ?? undefined,
        amountDisplay: amountNormalized,
        tokenSymbol: "AVAX",
      });
      const code =
        indexed?.auditAccessCode ?? indexed?.transfer?.auditAccessCode;
      if (code) setLastAuditCode(code);

      setLastTx(hash);
      setHistoryKey((k) => k + 1);
      setAmount("");
      setFeedback(
        code
          ? `Transferencia enviada. Código de auditoría: ${code}`
          : "Transferencia AVAX confirmada.",
      );
      void refetchBalance();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar AVAX.");
    } finally {
      setBusy(false);
      setPendingHash(null);
    }
  }

  const formBusy = busy || waitingReceipt;

  return (
    <PageShell width="full">
      <div className="app-layout">
        <aside aria-label="Resumen">
          <div className="bal-block">
            <div className="bal-label">Saldo AVAX</div>
            <div className="bal-val">{avaxBal}</div>
            <div className="bal-currency">Avalanche Fuji · nativo</div>
          </div>
          <WalletStatus />
        </aside>

        <div className="main">
          <PageHeader
            kicker="Transferencias"
            title="Enviar AVAX"
            description="Transferencia nativa en Fuji entre instituciones registradas. Código de auditoría al confirmar."
          />

          <Feedback message={error} variant="error" />
          {!loadingMe && !myInstitutionOk ? (
            <Feedback
              message="Completá el onboarding institucional (menú Registro) antes de transferir."
              variant="info"
            />
          ) : null}
          {lastAuditCode ? (
            <AuditCodeCard auditAccessCode={lastAuditCode} txHash={lastTx} />
          ) : null}
          <Feedback
            message={feedback}
            variant={
              feedback?.includes("enviada") || receiptOk
                ? "success"
                : formBusy
                  ? "loading"
                  : "info"
            }
          />
          {lastTx ? (
            <p className="tx-feedback">
              Transacción: <TxLink hash={lastTx} />
            </p>
          ) : null}

          <form className="form-card" onSubmit={onSubmit}>
            <div className="form-card-head">
              <div className="form-card-title">Datos</div>
              <div className="form-card-meta">AVAX · Fuji</div>
            </div>
            <div className="fields">
              <div className="fl">
                <label className="fl-label" htmlFor="dest-address">
                  Destino (institución registrada)
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
                  Monto
                </span>
                <div
                  className="amt-row"
                  role="group"
                  aria-labelledby="amount-label"
                >
                  <input
                    className="fl-input lg"
                    style={{ flex: 1 }}
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.01"
                  />
                  <span className="currency-sel">AVAX</span>
                </div>
              </div>
              <div className="fl">
                <label className="fl-label" htmlFor="tx-ref">
                  Referencia
                </label>
                <input
                  id="tx-ref"
                  className="fl-input"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
            </div>
            <div className="form-footer">
              <button
                type="submit"
                className="submit-btn"
                disabled={formBusy || !myInstitutionOk}
              >
                {formBusy ? "Enviando…" : "Transferir AVAX"}
              </button>
            </div>
          </form>

          <h3 className="section-label">Historial</h3>
          <TransferHistory address={address} refreshKey={historyKey} />
        </div>

        <CounterpartiesPanel
          institutions={counterparties}
          loading={loadingCp}
          onSelect={pickCounterparty}
        />
      </div>
    </PageShell>
  );
}
