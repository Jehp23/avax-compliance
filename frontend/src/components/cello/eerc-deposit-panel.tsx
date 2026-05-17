"use client";

import Link from "next/link";
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
import { PageHeader } from "@/components/cello/page-header";
import { WalletStatus } from "@/components/cello/wallet-status";
import { useCelloEerc, useEncryptedBalanceHook } from "@/contexts/eerc-context";
import { resolveConverterToken } from "@/lib/eerc-config";
import { explorerAddressUrl } from "@/lib/explorer";
import { formatAvaxDisplay, formatWeiDisplay } from "@/lib/format-avax";
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
  const eercDecimals = eercDecimalsRaw ? Number(eercDecimalsRaw) : 18;
  const symbol = tokenSymbol ?? "TEST";
  const registeredOnThisContract = sdk.isRegistered;
  const decrypted = decryptedBalance ?? 0n;

  const avaxDisplay = formatAvaxDisplay(avaxBal?.value);
  const publicDisplay = formatWeiDisplay(publicBal, decimals);
  const encryptedDisplay =
    hasDecryptionKey && sdk.isRegistered
      ? formatWeiDisplay(decryptedBalance, eercDecimals)
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
    <div className="app-layout cargar-layout">
      <aside aria-label="Saldos de tu wallet">
        <div className="aside-sect">
          <div className="aside-label">Tu wallet · Fuji</div>
          <div className="bal-block">
            <div className="bal-label">Gas</div>
            <div className="bal-val" title={avaxDisplay}>
              {avaxDisplay}
            </div>
            <div className="bal-currency">AVAX</div>
          </div>
          <div className="bal-block">
            <div className="bal-label">{symbol} público</div>
            <div className="bal-val" title={publicDisplay}>
              {publicDisplay}
            </div>
            <div className="bal-currency">{symbol} · para depositar</div>
            {tokenAddress ? (
              <button
                type="button"
                className="cargar-aside-link"
                onClick={() => void addTokenToWallet()}
              >
                + MetaMask
              </button>
            ) : null}
          </div>
          <div className="bal-block">
            <div className="bal-label">Saldo cifrado</div>
            <div className="bal-val" title={encryptedDisplay}>
              {encryptedDisplay}
            </div>
            <div className="bal-currency">eERC · Transferencias</div>
            <div className="bal-enc">
              <span className="enc-dot" aria-hidden />
              privado on-chain
            </div>
          </div>
        </div>

        <div className="aside-sect">
          <div className="aside-label">Referencias</div>
          <div className="stat-row">
            <span className="stat-key">Cuenta</span>
            <span className="stat-val">{address ? shortAddress(address) : "—"}</span>
          </div>
          <div className="stat-row">
            <span className="stat-key">Token</span>
            <span className="stat-val">
              {tokenAddress ? (
                <a
                  href={explorerAddressUrl(tokenAddress)}
                  target="_blank"
                  rel="noreferrer"
                  className="cargar-explorer-link"
                >
                  {shortAddress(tokenAddress)}
                </a>
              ) : (
                "—"
              )}
            </span>
          </div>
          <div className="stat-row">
            <span className="stat-key">eERC</span>
            <span className="stat-val">{shortAddress(contractAddress)}</span>
          </div>
        </div>

        <WalletStatus />
      </aside>

      <div className="main">
        <PageHeader
          kicker="Cargar saldo"
          title={`Depositar ${symbol} → eERC`}
          description="Aprobá el token público y depositá. El saldo cifrado queda disponible en Transferencias."
        />

        <Feedback message={error} variant="error" />

        {!isConnected ? (
          <Feedback message="Conectá tu wallet en Fuji." variant="info" />
        ) : null}
        {isConnected && !registeredOnThisContract ? (
          <Feedback
            message="Registrate en este contrato (Registro) con la misma wallet."
            variant="info"
          />
        ) : null}
        {isConnected && registeredOnThisContract && !hasDecryptionKey ? (
          <Feedback
            message="Falta la clave ZK. Completá Registro o importá tu JSON."
            variant="info"
          />
        ) : null}
        {isConnected && publicBal === 0n ? (
          <Feedback
            message={`Sin ${symbol} en wallet. MetaMask puede mostrar AVAX; acá hace falta el ERC20 demo. Pedí mint al equipo.`}
            variant="info"
          />
        ) : null}
        {isConnected && publicBal !== undefined && publicBal > 0n && decrypted === 0n ? (
          <Feedback
            message={`Tenés ${publicDisplay} ${symbol} listos para depositar.`}
            variant="success"
          />
        ) : null}

        <Feedback
          message={feedback}
          variant={feedback?.includes("confirmado") ? "success" : "info"}
        />
        {busy ? <ZkProgress /> : null}

        <form className="form-card" onSubmit={onDeposit}>
          <div className="form-card-head">
            <div className="form-card-title">Depósito</div>
            <div className="form-card-meta">Converter · ZK</div>
          </div>
          <div className="fields">
            <p className="panel-hint" style={{ margin: 0 }}>
              Paso 1: permitir gasto de {symbol}. Paso 2: cifrar en el contrato eERC.
            </p>
            <div className="fl">
              <span className="fl-label">Monto</span>
              <div className="amt-row">
                <input
                  className="fl-input lg"
                  style={{ flex: 1 }}
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100"
                />
                <button
                  type="button"
                  className="secondary-btn"
                  disabled={!publicBal || publicBal === 0n}
                  onClick={useMaxPublic}
                >
                  Máx.
                </button>
              </div>
            </div>
          </div>
          <div className="form-footer">
            <div className="btn-row cargar-btn-row">
              <button
                type="button"
                className="secondary-btn"
                disabled={busy || !needsApprove || !address}
                onClick={() => void onApprove()}
              >
                {step === "approve" ? "Aprobando…" : `1 · Aprobar ${symbol}`}
              </button>
              <button
                type="submit"
                className="primary-btn"
                disabled={
                  busy || needsApprove || !sdk.isRegistered || !hasDecryptionKey
                }
              >
                {step === "deposit" ? "Depositando…" : "2 · Depositar y cifrar"}
              </button>
            </div>
          </div>
        </form>

        <p className="cargar-footnote">
          <Link href="/transferencias">Ir a transferencias →</Link>
        </p>
      </div>
    </div>
  );
}
