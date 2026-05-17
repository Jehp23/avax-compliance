"use client";

import { type FormEvent, useEffect, useState } from "react";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { Feedback } from "@/components/feedback";
import { ZkProgress } from "@/components/zk-progress";
import { useCelloEerc, useEncryptedBalanceHook } from "@/contexts/eerc-context";
import { resolveConverterToken } from "@/lib/eerc-config";
import { formatTransferError } from "@/lib/format-transfer-error";
import { shortAddress } from "@/lib/format-address";

export function EercDepositPanel() {
  const { address, isConnected } = useAccount();
  const { sdk, contractAddress, hasDecryptionKey, env } = useCelloEerc();
  const tokenAddress = resolveConverterToken(env);
  const {
    deposit,
    refetchBalance,
    decimals: eercDecimalsRaw,
    decryptedBalance,
  } = useEncryptedBalanceHook();

  const [amount, setAmount] = useState("100");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<"idle" | "approve" | "deposit">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [approveHash, setApproveHash] = useState<`0x${string}` | null>(null);

  const { data: tokenDecimals } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: Boolean(tokenAddress) },
  });

  const { data: publicBal, refetch: refetchPublic } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(tokenAddress && address) },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args:
      address && contractAddress
        ? [address, contractAddress]
        : undefined,
    query: { enabled: Boolean(tokenAddress && address && contractAddress) },
  });

  const { writeContractAsync } = useWriteContract();
  const { isLoading: waitingApprove, isSuccess: approveOk } =
    useWaitForTransactionReceipt({
      hash: approveHash ?? undefined,
    });

  useEffect(() => {
    if (!approveOk || !approveHash) return;
    setApproveHash(null);
    setBusy(false);
    setStep("idle");
    setFeedback("Approve confirmado. Ahora podés depositar y cifrar.");
    void refetchAllowance();
  }, [approveOk, approveHash, refetchAllowance]);

  const decimals = tokenDecimals ? Number(tokenDecimals) : 18;
  const publicDisplay =
    publicBal !== undefined ? formatUnits(publicBal, decimals) : "—";
  const eercDecimals = eercDecimalsRaw ? Number(eercDecimalsRaw) : 18;
  const encryptedDisplay =
    hasDecryptionKey && sdk.isRegistered
      ? formatUnits(decryptedBalance ?? 0n, eercDecimals)
      : "—";

  function parseAmount(): bigint | null {
    const normalized = amount.trim().replace(",", ".");
    if (!normalized) return null;
    try {
      const v = parseUnits(normalized, decimals);
      return v > 0n ? v : null;
    } catch {
      return null;
    }
  }

  async function onApprove() {
    const value = parseAmount();
    if (!tokenAddress || !contractAddress || !value) {
      setError("Indicá un monto válido.");
      return;
    }
    setBusy(true);
    setStep("approve");
    setError(null);
    setFeedback("Aprobando token público para el contrato eERC…");
    try {
      const hash = await writeContractAsync({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [contractAddress, value],
      });
      setApproveHash(hash);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo aprobar.");
      setStep("idle");
      setBusy(false);
    }
  }

  async function onDeposit(e: FormEvent) {
    e.preventDefault();
    if (!tokenAddress) {
      setError("Falta NEXT_PUBLIC_CONVERTER_ERC20_ADDRESS en el deploy.");
      return;
    }
    if (!sdk.isConverter) {
      setError("Este contrato no está en modo converter.");
      return;
    }
    if (!sdk.isRegistered || !hasDecryptionKey) {
      setError("Completá el registro eERC y la clave ZK antes de depositar.");
      return;
    }
    const value = parseAmount();
    if (!value) {
      setError("Indicá un monto válido.");
      return;
    }
    if ((allowance ?? 0n) < value) {
      setError("Primero aprobá el monto (paso 1).");
      return;
    }

    setBusy(true);
    setStep("deposit");
    setError(null);
    setFeedback("Depositando y cifrando saldo (ZK)…");
    try {
      const { transactionHash } = await deposit(value);
      setFeedback(
        `Depósito confirmado · ${shortAddress(transactionHash)}. Revisá Transferencias.`,
      );
      void refetchPublic();
      void refetchAllowance();
      refetchBalance();
    } catch (err) {
      setError(formatTransferError(err));
    } finally {
      setBusy(false);
      setStep("idle");
    }
  }

  if (waitingApprove && approveHash) {
    return (
      <div className="panel">
        <ZkProgress />
        <Feedback message="Confirmando approve en Fuji…" variant="loading" />
      </div>
    );
  }

  const parsed = parseAmount();
  const needsApprove = parsed !== null && (allowance ?? 0n) < parsed;

  return (
    <div className="panel">
      <p className="panel-label">Cargar saldo (modo converter)</p>
      <p className="panel-text text-sm">
        Depositás tokens <strong>públicos</strong> TEST y el contrato los convierte
        a saldo <strong>cifrado</strong> eERC. No hace falta mint del operador.
      </p>

      <dl className="session-backup-card__meta mt-3">
        <div className="session-backup-card__meta-row">
          <dt>Token público</dt>
          <dd>{tokenAddress ? shortAddress(tokenAddress) : "—"}</dd>
        </div>
        <div className="session-backup-card__meta-row">
          <dt>Contrato eERC</dt>
          <dd>{shortAddress(contractAddress)}</dd>
        </div>
        <div className="session-backup-card__meta-row">
          <dt>Saldo público</dt>
          <dd>{publicDisplay} TEST</dd>
        </div>
        <div className="session-backup-card__meta-row">
          <dt>Saldo cifrado</dt>
          <dd>{encryptedDisplay}</dd>
        </div>
      </dl>

      {!isConnected ? (
        <Feedback message="Conectá tu wallet en Fuji." variant="info" />
      ) : null}
      {publicBal === 0n ? (
        <Feedback
          message="No tenés TEST públicos. Pedí mint del token demo al equipo o usá el faucet del deploy."
          variant="info"
        />
      ) : null}

      <form className="mt-4" onSubmit={onDeposit}>
        <label className="fl">
          <span className="fl-label">Monto a depositar</span>
          <input
            className="fl-input"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
          />
        </label>

        <div className="session-backup-card__actions mt-3">
          <button
            type="button"
            className="secondary-btn"
            disabled={busy || !needsApprove || !address}
            onClick={() => void onApprove()}
          >
            {step === "approve" ? "Aprobando…" : "1. Aprobar TEST"}
          </button>
          <button
            type="submit"
            className="primary-btn"
            disabled={
              busy || needsApprove || !sdk.isRegistered || !hasDecryptionKey
            }
          >
            {step === "deposit" ? "Depositando…" : "2. Depositar y cifrar"}
          </button>
        </div>
      </form>

      <Feedback message={error} variant="error" />
      <Feedback
        message={feedback}
        variant={feedback?.includes("confirmado") ? "success" : "info"}
      />
    </div>
  );
}
