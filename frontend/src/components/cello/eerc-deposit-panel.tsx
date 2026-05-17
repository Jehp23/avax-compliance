"use client";

import { type FormEvent, useEffect, useState } from "react";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { avalancheFuji } from "wagmi/chains";

import { Feedback } from "@/components/feedback";
import { ZkProgress } from "@/components/zk-progress";
import { WalletStatus } from "@/components/cello/wallet-status";
import { useCelloEerc, useEncryptedBalanceHook } from "@/contexts/eerc-context";
import { resolveConverterToken } from "@/lib/eerc-config";
import { explorerAddressUrl } from "@/lib/explorer";
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

  const { data: avaxBal, refetch: refetchAvax } = useBalance({
    address,
    chainId: avalancheFuji.id,
    query: { enabled: Boolean(address) },
  });

  const { data: tokenSymbol } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "symbol",
    query: { enabled: Boolean(tokenAddress) },
  });

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
      void refetchAvax();
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
  const symbol = tokenSymbol ?? "TEST";
  const avaxDisplay =
    avaxBal?.value !== undefined
      ? `${formatUnits(avaxBal.value, avaxBal.decimals)} AVAX`
      : "—";
  const registeredOnThisContract = sdk.isRegistered;
  const decrypted = decryptedBalance ?? 0n;

  function useMaxPublic() {
    if (publicBal !== undefined && publicBal > 0n) {
      setAmount(formatUnits(publicBal, decimals));
    }
  }

  async function addTokenToWallet() {
    const provider = (
      window as Window & {
        ethereum?: { request: (args: unknown) => Promise<unknown> };
      }
    ).ethereum;
    if (!tokenAddress || !provider) return;
    try {
      await provider.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: tokenAddress,
            symbol: String(symbol).slice(0, 11),
            decimals,
          },
        },
      });
    } catch {
      /* usuario canceló */
    }
  }

  return (
    <>
      <WalletStatus />

      <div className="panel mt-4">
        <p className="panel-label">Tu wallet en Fuji</p>
        <p className="panel-text text-sm">
          Lo que ves acá es tu cuenta en <strong>Avalanche Fuji</strong>. MetaMask
          puede mostrar otros activos en otras redes; para cargar eERC necesitás el
          token <strong>{symbol}</strong> (columna del medio).
        </p>

        <div className="grid gap-3 mt-4 sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--border)] p-3">
            <p className="text-[11px] uppercase tracking-wide text-[var(--text2)]">
              Gas (nativo)
            </p>
            <p className="text-lg font-semibold mt-1 tabular-nums">{avaxDisplay}</p>
            <p className="text-xs text-[var(--text2)] mt-1">Comisiones de red</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-3">
            <p className="text-[11px] uppercase tracking-wide text-[var(--text2)]">
              {symbol} en wallet
            </p>
            <p className="text-lg font-semibold mt-1 tabular-nums">
              {publicDisplay} {symbol}
            </p>
            <p className="text-xs text-[var(--text2)] mt-1">Se deposita y pasa a cifrado</p>
            {tokenAddress ? (
              <button
                type="button"
                className="text-xs underline mt-2 text-[var(--text2)]"
                onClick={() => void addTokenToWallet()}
              >
                Ver {symbol} en MetaMask
              </button>
            ) : null}
          </div>
          <div className="rounded-lg border border-[var(--border)] p-3">
            <p className="text-[11px] uppercase tracking-wide text-[var(--text2)]">
              Saldo cifrado eERC
            </p>
            <p className="text-lg font-semibold mt-1 tabular-nums">{encryptedDisplay}</p>
            <p className="text-xs text-[var(--text2)] mt-1">Usado en Transferencias</p>
          </div>
        </div>

        <dl className="session-backup-card__meta mt-4">
          <div className="session-backup-card__meta-row">
            <dt>Tu cuenta</dt>
            <dd>{address ? shortAddress(address) : "—"}</dd>
          </div>
          <div className="session-backup-card__meta-row">
            <dt>Token ERC20 ({symbol})</dt>
            <dd>
              {tokenAddress ? (
                <a
                  href={explorerAddressUrl(tokenAddress)}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {shortAddress(tokenAddress)}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div className="session-backup-card__meta-row">
            <dt>Contrato eERC</dt>
            <dd>{shortAddress(contractAddress)}</dd>
          </div>
        </dl>

        {!isConnected ? (
          <Feedback message="Conectá tu wallet en Fuji." variant="info" />
        ) : null}
        {isConnected && !registeredOnThisContract ? (
          <Feedback
            message="Esta wallet no está registrada en el contrato eERC actual. Andá a Registro con la misma cuenta (contrato converter)."
            variant="info"
          />
        ) : null}
        {isConnected && registeredOnThisContract && !hasDecryptionKey ? (
          <Feedback
            message="Falta la clave ZK en este navegador. Completá Registro o importá tu JSON de sesión."
            variant="info"
          />
        ) : null}
        {isConnected && publicBal === 0n ? (
          <Feedback
            message={`Tenés 0 ${symbol} en este token. Si en MetaMask ves AVAX u otro activo, es distinto: acá solo cuenta el ERC20 demo en ${tokenAddress ? shortAddress(tokenAddress) : "Fuji"}. Pedí mint al equipo.`}
            variant="info"
          />
        ) : null}
        {isConnected && publicBal !== undefined && publicBal > 0n && decrypted === 0n ? (
          <Feedback
            message={`Tenés ${publicDisplay} ${symbol} para depositar. Usá los pasos de abajo; después el saldo cifrado aparece en Transferencias.`}
            variant="success"
          />
        ) : null}

        <p className="panel-label mt-5">Convertir {symbol} → saldo cifrado</p>

        <form className="mt-3" onSubmit={onDeposit}>
          <label className="fl">
            <span className="fl-label">Monto a depositar</span>
            <div className="flex gap-2">
              <input
                className="fl-input flex-1"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
              />
              <button
                type="button"
                className="secondary-btn shrink-0"
                disabled={!publicBal || publicBal === 0n}
                onClick={useMaxPublic}
              >
                Máximo
              </button>
            </div>
          </label>

          <div className="session-backup-card__actions mt-3">
            <button
              type="button"
              className="secondary-btn"
              disabled={busy || !needsApprove || !address}
              onClick={() => void onApprove()}
            >
              {step === "approve" ? "Aprobando…" : `1. Aprobar ${symbol}`}
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
    </>
  );
}
