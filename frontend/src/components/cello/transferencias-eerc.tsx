"use client";

import { type FormEvent, useState } from "react";
import { formatUnits, isAddress, parseUnits } from "viem";
import { useAccount } from "wagmi";

import { Feedback } from "@/components/feedback";
import { TxLink } from "@/components/tx-link";
import { TransferHistory } from "@/components/transfer-history";
import { EncBadge } from "@/components/cello/enc-badge";
import { PageHeader } from "@/components/cello/page-header";
import { PageShell } from "@/components/cello/page-shell";
import { WalletStatus } from "@/components/cello/wallet-status";
import { ZkProgress } from "@/components/zk-progress";
import {
  useEncryptedBalanceHook,
  useCelloEerc,
} from "@/contexts/eerc-context";
import { AuditCodeCard } from "@/components/cello/audit-code-card";
import { CounterpartiesPanel } from "@/components/cello/counterparties-panel";
import { ImportDemoKey } from "@/components/cello/import-demo-key";
import { RestoreZkKey } from "@/components/cello/restore-zk-key";
import { useApprovedInstitutions } from "@/hooks/use-approved-institutions";
import { getEercContractAddress } from "@/lib/contracts";
import { loadDecryptionKey } from "@/lib/decryption-key-storage";
import { formatTransferError } from "@/lib/format-transfer-error";
import { indexTransferOnServer } from "@/lib/index-transfer";
import { shortAddress } from "@/lib/format-address";

export function TransferenciasEerc() {
  const { address, isConnected } = useAccount();
  const { sdk, hasDecryptionKey, persistDecryptionKey } = useCelloEerc();
  const balance = useEncryptedBalanceHook();
  const contract = getEercContractAddress();

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
        setError(
          "Completá el onboarding institucional (menú Registro) antes de transferir.",
        );
        return;
      }
      if (
        !loadDecryptionKey(address, contract) &&
        !hasDecryptionKey
      ) {
        setError(
          "Falta la clave ZK. Completá el onboarding en Registro con esta wallet (mismo navegador).",
        );
        return;
      }
      const storedKey = loadDecryptionKey(address, contract);
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
        setError(
          "El destinatario debe estar registrado en eERC20 y en el directorio de Cello.",
        );
        return;
      }
      const destInDirectory = counterparties.some(
        (i) => i.walletAddress.toLowerCase() === trimmed.toLowerCase(),
      );
      if (counterparties.length > 0 && !destInDirectory) {
        setError(
          "El destino no está en el directorio de instituciones aprobadas. Elegí una contraparte de la lista.",
        );
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
        setError(
          "Monto con formato inválido. Usá solo números y punto decimal (ej. 100 o 10.5).",
        );
        return;
      }
      if (parsed <= 0n) {
        setError("El monto debe ser mayor que cero.");
        return;
      }
      if (!balance.encryptedBalance?.length) {
        setError(
          "No hay saldo cifrado cargado. Volvé a Registro para cargar la clave ZK y esperá unos segundos.",
        );
        return;
      }
      if (decrypted < parsed) {
        setError(
          `Saldo insuficiente: tenés ${formatUnits(decrypted, decimals)} ${sdk.symbol || "TOKEN"} y querés enviar ${amountNormalized}.`,
        );
        return;
      }

      setFeedback("Generando prueba ZK (1–2 min). No cierres la pestaña…");
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
        tokenSymbol: sdk.symbol || "TOKEN",
      });
      const code =
        indexed?.auditAccessCode ?? indexed?.transfer?.auditAccessCode;
      if (code) setLastAuditCode(code);
      setFeedback(
        code
          ? `Transferencia enviada. Código de auditoría: ${code}`
          : "Transferencia enviada correctamente.",
      );
      setAmount("");
    } catch (err) {
      setError(formatTransferError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell width="full">
      <div className="app-layout">
        <aside aria-label="Resumen">
          <div className="bal-block">
            <div className="bal-label">Saldo descifrado</div>
            <div className="bal-val">{bal}</div>
            <div className="bal-currency">
              {sdk.symbol || "eERC"} · {shortAddress(contract)}
            </div>
          </div>
          <WalletStatus />
        </aside>

        <div className="main">
          <PageHeader
            kicker="Transferencias"
            title="Nueva transferencia"
            description="Montos privados on-chain con copia auditada para el regulador."
            badge={<EncBadge />}
          />

          <Feedback message={error} variant="error" />
          {sdk.isRegistered && !hasDecryptionKey ? (
            <>
              <Feedback
                message="Falta la clave ZK en este navegador. Recuperala abajo o en Registro."
                variant="info"
              />
              <ImportDemoKey />
              <RestoreZkKey />
            </>
          ) : null}
          {showZeroBalanceHint ? (
            <div className="panel zero-balance-hint">
              <p className="panel-label">Saldo CELL en cero</p>
              <p className="panel-text text-sm">
                El registro eERC solo habilita la wallet; no acredita tokens. Necesitás
                un <strong>privateMint</strong> del operador del contrato o una
                transferencia entrante desde otra institución en el mismo contrato (
                {shortAddress(contract)}).
              </p>
              <p className="panel-text text-sm mt-2">
                Contrato del equipo Cello en Fuji:{" "}
                <span className="font-mono">0x45C131…FD7F</span>. Si te registraste en
                otro contrato (ej. 0x5E9c…), pedí mint ahí o volvé a registrarte con el
                contrato del deploy.
              </p>
            </div>
          ) : null}
          {lastAuditCode ? (
            <AuditCodeCard auditAccessCode={lastAuditCode} txHash={lastTx} />
          ) : null}
          <Feedback
            message={feedback}
            variant={
              feedback?.toLowerCase().includes("correctamente") ||
              feedback?.includes("enviada")
                ? "success"
                : busy
                  ? "loading"
                  : "info"
            }
          />
          {lastTx ? (
            <p className="tx-feedback">
              Transacción: <TxLink hash={lastTx} />
            </p>
          ) : null}
          {busy ? <ZkProgress /> : null}

          <form className="form-card" onSubmit={onSubmit}>
            <div className="form-card-head">
              <div className="form-card-title">Datos</div>
              <div className="form-card-meta">ZK · eERC</div>
            </div>
            <div className="fields">
              <div className="fl">
                <label className="fl-label" htmlFor="dest-address">
                  Destino (0x…)
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
                    placeholder="0"
                  />
                  <span className="currency-sel">{sdk.symbol || "TOKEN"}</span>
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
                disabled={busy || !sdk.isRegistered}
              >
                {busy ? "Enviando…" : "Transferir"}
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
