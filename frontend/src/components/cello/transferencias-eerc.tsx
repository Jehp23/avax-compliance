"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { formatUnits, isAddress, parseUnits } from "viem";
import { useAccount } from "wagmi";

import { Feedback } from "@/components/feedback";
import { TxLink } from "@/components/tx-link";
import { TransferHistory } from "@/components/transfer-history";
import { AuditCodeCard } from "@/components/cello/audit-code-card";
import { CounterpartiesChips } from "@/components/cello/counterparties-chips";
import { ImportDemoKey } from "@/components/cello/import-demo-key";
import { PageHeader } from "@/components/cello/page-header";
import { PageShell } from "@/components/cello/page-shell";
import { RestoreZkKey } from "@/components/cello/restore-zk-key";
import { ZkProgress } from "@/components/zk-progress";
import {
  useEncryptedBalanceHook,
  useCelloEerc,
} from "@/contexts/eerc-context";
import { useApprovedInstitutions } from "@/hooks/use-approved-institutions";
import { loadDecryptionKey } from "@/lib/decryption-key-storage";
import { formatTransferError } from "@/lib/format-transfer-error";
import { indexTransferOnServer } from "@/lib/index-transfer";
import { shortAddress } from "@/lib/format-address";

export function TransferenciasEerc() {
  const { address, isConnected } = useAccount();
  const { sdk, hasDecryptionKey, persistDecryptionKey, contractAddress } =
    useCelloEerc();
  const balance = useEncryptedBalanceHook();
  const contract = contractAddress;
  const tokenLabel = sdk.symbol || "CELL";

  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastTx, setLastTx] = useState<`0x${string}` | null>(null);
  const [historyKey, setHistoryKey] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastAuditCode, setLastAuditCode] = useState<string | null>(null);

  const { institutions: counterparties, loading: loadingCp } =
    useApprovedInstitutions(address);
  const decimals = balance.decimals ? Number(balance.decimals) : 18;
  const decrypted = balance.decryptedBalance ?? 0n;
  const bal =
    hasDecryptionKey && sdk.isRegistered
      ? formatUnits(decrypted, decimals)
      : "—";
  const showZeroBalanceHint =
    hasDecryptionKey &&
    sdk.isRegistered &&
    sdk.isAllDataFetched &&
    decrypted === 0n;

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
        setError("Completá el registro en la sección Registro.");
        return;
      }
      if (
        !loadDecryptionKey(address, contractAddress) &&
        !hasDecryptionKey
      ) {
        setError("Falta la clave ZK. Volvé a Registro en este navegador.");
        return;
      }
      const storedKey = loadDecryptionKey(address, contractAddress);
      if (storedKey && !hasDecryptionKey) {
        persistDecryptionKey(storedKey);
      }
      const trimmed = destination.trim();
      if (!isAddress(trimmed)) {
        setError("Destino inválido: dirección 0x completa.");
        return;
      }
      const { isRegistered: destOk } = await sdk.isAddressRegistered(trimmed);
      if (!destOk) {
        setError("El destinatario debe estar registrado en Cello.");
        return;
      }
      const destInDirectory = counterparties.some(
        (i) => i.walletAddress.toLowerCase() === trimmed.toLowerCase(),
      );
      if (counterparties.length > 0 && !destInDirectory) {
        setError("Elegí una institución de la lista o agregala al directorio.");
        return;
      }
      if (!amount.trim()) {
        setError("Indicá un monto.");
        return;
      }

      const amountNormalized = amount.trim().replace(",", ".");
      let parsed: bigint;
      try {
        parsed = parseUnits(amountNormalized, decimals);
      } catch {
        setError("Monto inválido. Ejemplo: 100 o 10.5");
        return;
      }
      if (parsed <= 0n) {
        setError("El monto debe ser mayor que cero.");
        return;
      }
      if (!balance.encryptedBalance?.length) {
        setError("No hay saldo cifrado. Recargá la página tras el registro.");
        return;
      }
      if (decrypted < parsed) {
        setError(
          `Saldo insuficiente (${formatUnits(decrypted, decimals)} ${tokenLabel}).`,
        );
        return;
      }

      setFeedback("Generando prueba ZK (1–2 min)…");
      const { transactionHash } = await balance.privateTransfer(
        trimmed,
        parsed,
        reference.trim() || undefined,
      );
      balance.refetchBalance();
      setLastTx(transactionHash as `0x${string}`);
      setLastAuditCode(null);
      setHistoryKey((k) => k + 1);
      const indexed = await indexTransferOnServer({
        txHash: transactionHash,
        fromAddress: address,
        toAddress: trimmed,
        transferType: "transfer",
        reference: reference.trim() || undefined,
        contractAddress: contract,
        amountDisplay: amountNormalized,
        tokenSymbol: sdk.symbol || "CELL",
      });
      const code =
        indexed?.auditAccessCode ?? indexed?.transfer?.auditAccessCode;
      if (code) setLastAuditCode(code);
      setFeedback(
        code ? `Enviado · código ${code}` : "Transferencia confirmada.",
      );
      setAmount("");
    } catch (err) {
      setError(formatTransferError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell width="narrow">
      <PageHeader
        kicker="Transferencias"
        title="Enviar CELL"
        description="Monto privado on-chain con traza auditada para el regulador."
      />

      <div className="transfer-stack">
        <div className="balance-hero" aria-live="polite">
          <p className="balance-hero-label">Saldo disponible</p>
          <p className="balance-hero-val">
            {bal} <span className="balance-hero-unit">{tokenLabel}</span>
          </p>
          <p className="balance-hero-meta">{shortAddress(contract)} · Fuji</p>
        </div>

        <Feedback message={error} variant="error" />
        {showZeroBalanceHint ? (
          <Feedback
            message="Saldo en cero: pedí un mint al operador o recibí una transferencia."
            variant="info"
          />
        ) : null}
        {sdk.isRegistered && !hasDecryptionKey ? (
          <details className="recover-details">
            <summary>Recuperar clave ZK</summary>
            <ImportDemoKey />
            <RestoreZkKey />
          </details>
        ) : null}
        {lastAuditCode ? (
          <AuditCodeCard auditAccessCode={lastAuditCode} txHash={lastTx} />
        ) : null}
        <Feedback
          message={feedback}
          variant={
            feedback?.includes("confirmada") || feedback?.includes("Enviado")
              ? "success"
              : busy
                ? "loading"
                : "info"
          }
        />
        {lastTx ? (
          <p className="tx-feedback tx-feedback--center">
            <TxLink hash={lastTx} />
          </p>
        ) : null}
        {busy ? <ZkProgress /> : null}

        <form className="form-card" onSubmit={onSubmit}>
          <div className="fields">
            <div className="fl">
              <label className="fl-label" htmlFor="dest-address">
                Destinatario
              </label>
              <input
                id="dest-address"
                className="fl-input font-mono"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="0x…"
                autoComplete="off"
              />
              <CounterpartiesChips
                institutions={counterparties}
                loading={loadingCp}
                onSelect={pickCounterparty}
              />
            </div>
            <div className="fl">
              <label className="fl-label" htmlFor="amount">
                Monto ({tokenLabel})
              </label>
              <input
                id="amount"
                className="fl-input lg"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="fl">
              <label className="fl-label" htmlFor="tx-ref">
                Referencia <span className="fl-optional">opcional</span>
              </label>
              <input
                id="tx-ref"
                className="fl-input"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Pago proveedor"
              />
            </div>
          </div>
          <div className="form-footer">
            <button
              type="submit"
              className="submit-btn submit-btn--full"
              disabled={busy || !sdk.isRegistered}
            >
              {busy ? "Enviando…" : "Transferir"}
            </button>
          </div>
        </form>

        <section
          className="transfer-history-section"
          aria-labelledby="hist-label"
        >
          <h2 id="hist-label" className="section-label section-label--center">
            Historial
          </h2>
          <TransferHistory address={address} refreshKey={historyKey} />
        </section>

        <p className="page-foot-link">
          <Link href="/recibir">Tu dirección para recibir</Link>
          {" · "}
          <Link href="/auditoria">Consultar código de auditoría</Link>
        </p>
      </div>
    </PageShell>
  );
}
