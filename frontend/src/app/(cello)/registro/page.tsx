"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { Feedback } from "@/components/feedback";
import { TxLink } from "@/components/tx-link";
import { PageHeader } from "@/components/cello/page-header";
import { PageShell } from "@/components/cello/page-shell";
import { ZkProgress } from "@/components/zk-progress";
import { useCelloEerc } from "@/contexts/eerc-context";
import { indexTransferOnServer } from "@/lib/index-transfer";
import { shortAddress } from "@/lib/format-address";

export default function RegistroPage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { sdk, persistDecryptionKey, contractAddress, hasDecryptionKey } =
    useCelloEerc();

  const [institutionName, setInstitutionName] = useState("");
  const [institutionInitials, setInstitutionInitials] = useState("");
  const [kycAccepted, setKycAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lastTx, setLastTx] = useState<`0x${string}` | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const walletDone = isConnected;
  const kycDone = kycAccepted;
  const registered = sdk.isRegistered;
  const sdkReady =
    Boolean(sdk) && sdk.isInitialized && sdk.isAllDataFetched;

  useEffect(() => {
    if (!address) return;
    void fetch("/api/institutions")
      .then((r) => r.json())
      .then((data: { institutions?: { walletAddress: string; name: string; initials: string }[] }) => {
        const mine = data.institutions?.find(
          (i) => i.walletAddress.toLowerCase() === address.toLowerCase(),
        );
        if (mine) {
          setInstitutionName(mine.name);
          setInstitutionInitials(mine.initials);
        }
      })
      .catch(() => {});
  }, [address]);

  async function saveInstitution() {
    if (!address || !institutionName.trim()) return;
    await fetch("/api/institutions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress: address,
        name: institutionName.trim(),
        initials: institutionInitials.trim() || institutionName.slice(0, 2).toUpperCase(),
        kycStatus: "approved",
      }),
    });
  }

  async function handleRegister() {
    setBusy(true);
    setError(null);
    setFeedback(null);
    try {
      if (!walletDone) {
        setError("Conectá tu wallet en Avalanche Fuji.");
        return;
      }
      if (!institutionName.trim()) {
        setError("Indicá el nombre de la institución.");
        return;
      }
      if (!kycDone) {
        setError("Confirmá el checklist institucional.");
        return;
      }
      if (!sdkReady) {
        setFeedback("Inicializando SDK eERC20…");
        return;
      }
      setFeedback("Generando prueba ZK y registro on-chain (1–2 min)…");
      const { key, transactionHash } = await sdk.register();
      persistDecryptionKey(key);
      setLastTx(transactionHash as `0x${string}`);
      await saveInstitution();
      void indexTransferOnServer({
        txHash: transactionHash,
        fromAddress: address!,
        transferType: "register",
        contractAddress,
      });
      setFeedback(
        `Registro exitoso. Tu clave quedó en este navegador — usá siempre la misma wallet aquí.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al registrar en eERC20.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAlreadyRegistered() {
    if (!walletDone || !institutionName.trim()) {
      setError("Completá nombre de institución y conectá wallet.");
      return;
    }
    setBusy(true);
    try {
      await saveInstitution();
      setFeedback("Institución guardada. Si ya registraste antes, tu clave debe estar en este navegador.");
    } finally {
      setBusy(false);
    }
  }

  const step3Class = registered
    ? "done"
    : walletDone && kycDone
      ? "current"
      : "";

  return (
    <PageShell width="narrow">
      <PageHeader
        kicker="Registro"
        title="Onboarding institucional"
        description="Una sola vez por wallet en Fuji: KYC, registro eERC20 y clave ZK en tu navegador."
      />

      <Feedback message={error} variant="error" />
      <Feedback
        message={feedback}
        variant={
          feedback?.toLowerCase().includes("exitoso") ||
          feedback?.includes("guardada")
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

      <div className="fields mb-4">
        <label className="fl">
          <span className="fl-label">Nombre institución</span>
          <input
            className="fl-input"
            value={institutionName}
            onChange={(e) => setInstitutionName(e.target.value)}
            placeholder="Ej. Mi Banco SA"
          />
        </label>
        <label className="fl">
          <span className="fl-label">Iniciales (opcional)</span>
          <input
            className="fl-input"
            value={institutionInitials}
            onChange={(e) => setInstitutionInitials(e.target.value)}
            placeholder="MB"
            maxLength={4}
          />
        </label>
      </div>

      <ol className="steps" aria-label="Pasos de onboarding">
        <li className={`step ${walletDone ? "done" : "current"}`}>
          <span className="step-num">{walletDone ? "✓" : "1"}</span>
          <div className="step-body">
            <div className="step-name">Wallet conectada</div>
            <div className="step-meta">MetaMask · Fuji</div>
          </div>
        </li>
        <li className={`step ${kycDone ? "done" : walletDone ? "current" : ""}`}>
          <span className="step-num">{kycDone ? "✓" : "2"}</span>
          <div className="step-body">
            <div className="step-name">KYC institucional</div>
            <div className="step-meta">Checklist</div>
          </div>
        </li>
        <li className={`step ${step3Class}`}>
          <span className="step-num">{registered ? "✓" : "3"}</span>
          <div className="step-body">
            <div className="step-name">Registro eERC20</div>
            <div className="step-meta">
              {registered ? "Activo on-chain" : "Claves + ZK"}
            </div>
          </div>
        </li>
      </ol>

      <label className="kyc-check">
        <input
          type="checkbox"
          checked={kycAccepted}
          onChange={(e) => setKycAccepted(e.target.checked)}
        />
        Confirmo operar como institución autorizada (KYC demo Fuji).
      </label>

      {!registered ? (
        <button
          type="button"
          className="primary-btn"
          disabled={busy || !walletDone || !kycDone || !sdkReady}
          onClick={handleRegister}
        >
          {busy ? "Registrando…" : "Registrar en eERC20"}
        </button>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            className="primary-btn"
            disabled={!hasDecryptionKey}
            onClick={() => router.push("/transferencias")}
          >
            {hasDecryptionKey ? "Ir a transferencias" : "Cargando clave local…"}
          </button>
          {!hasDecryptionKey ? (
            <p className="text-[12px] text-[var(--text3)]">
              Si registraste en otro dispositivo, volvé a registrar con esta wallet
              o usá el mismo navegador donde hiciste el onboarding.
            </p>
          ) : null}
          <button
            type="button"
            className="text-sm text-[var(--text2)] underline"
            disabled={busy}
            onClick={handleAlreadyRegistered}
          >
            Actualizar nombre en directorio
          </button>
        </div>
      )}

      <div className="note mt-4" role="note">
        Contrato {shortAddress(contractAddress)} · red Fuji testnet
      </div>
    </PageShell>
  );
}
