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
import { useMyInstitution } from "@/hooks/use-my-institution";
import { indexTransferOnServer } from "@/lib/index-transfer";
import { isAvaxPaymentMode, isEercPaymentMode } from "@/lib/payment-asset";
import { shortAddress } from "@/lib/format-address";
import { getEercContractAddress } from "@/lib/contracts";
import {
  loadCelloSession,
  saveCelloSession,
  sessionMatches,
} from "@/lib/cello-session";
import { formatTransferError } from "@/lib/format-transfer-error";
import { ImportDemoKey } from "@/components/cello/import-demo-key";
import { RestoreZkKey } from "@/components/cello/restore-zk-key";

export default function RegistroPage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const {
    sdk,
    persistDecryptionKey,
    contractAddress,
    hasDecryptionKey,
    refreshDecryptionKey,
  } = useCelloEerc();
  const { approved: institutionOk, loading: loadingInst } =
    useMyInstitution(address);

  const [institutionName, setInstitutionName] = useState("");
  const [institutionInitials, setInstitutionInitials] = useState("");
  const [kycAccepted, setKycAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lastTx, setLastTx] = useState<`0x${string}` | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const avaxMode = isAvaxPaymentMode();
  const walletDone = isConnected;
  const kycDone = kycAccepted;
  const registered = avaxMode ? institutionOk : sdk.isRegistered;
  const sdkReady =
    Boolean(sdk) && sdk.isInitialized && sdk.isAllDataFetched;

  useEffect(() => {
    if (!address || avaxMode) return;
    const session = loadCelloSession();
    if (sessionMatches(session, address, contractAddress) && session) {
      if (session.institution) {
        setInstitutionName(session.institution.name);
        setInstitutionInitials(session.institution.initials);
      }
      if (hasDecryptionKey) {
        setFeedback(
          "Sesión local restaurada: clave ZK y datos de registro en este navegador.",
        );
      }
    }
  }, [address, avaxMode, contractAddress, hasDecryptionKey]);

  useEffect(() => {
    if (!avaxMode && sdk.isRegistered) {
      refreshDecryptionKey();
    }
  }, [avaxMode, sdk.isRegistered, refreshDecryptionKey]);

  useEffect(() => {
    if (!address) return;
    void fetch("/api/institutions")
      .then((r) => r.json())
      .then(
        (data: {
          institutions?: { walletAddress: string; name: string; initials: string }[];
        }) => {
          const mine = data.institutions?.find(
            (i) => i.walletAddress.toLowerCase() === address.toLowerCase(),
          );
          if (mine) {
            setInstitutionName(mine.name);
            setInstitutionInitials(mine.initials);
          }
        },
      )
      .catch(() => {});
  }, [address]);

  async function saveInstitution() {
    if (!address || !institutionName.trim()) return false;
    const res = await fetch("/api/institutions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress: address,
        name: institutionName.trim(),
        initials:
          institutionInitials.trim() ||
          institutionName.trim().slice(0, 2).toUpperCase(),
        kycStatus: "approved",
      }),
    });
    return res.ok;
  }

  async function handleAvaxRegister() {
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
      const ok = await saveInstitution();
      if (!ok) {
        setError("No se pudo guardar en el directorio. Revisá DATABASE_URL.");
        return;
      }
      setFeedback("Institución registrada. Ya podés enviar y recibir AVAX.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al registrar.");
    } finally {
      setBusy(false);
    }
  }

  async function handleEercRegister() {
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
      const initials =
        institutionInitials.trim() ||
        institutionName.trim().slice(0, 2).toUpperCase();
      saveCelloSession({
        v: 1,
        walletAddress: address!,
        contractAddress,
        decryptionKey: key,
        registeredAt: new Date().toISOString(),
        registerTxHash: transactionHash,
        institution: {
          name: institutionName.trim(),
          initials,
        },
      });
      setLastTx(transactionHash as `0x${string}`);
      await saveInstitution();
      void indexTransferOnServer({
        txHash: transactionHash,
        fromAddress: address!,
        transferType: "register",
        contractAddress: getEercContractAddress(),
      });
      setFeedback(
        `Registro eERC exitoso. Sesión guardada en este navegador · ${shortAddress(contractAddress)}`,
      );
    } catch (e) {
      setError(formatTransferError(e));
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
        description={
          avaxMode
            ? "Registrá tu institución en Fuji para enviar AVAX nativo entre wallets verificadas."
            : "Wallet, KYC y registro eERC20 con prueba ZK en Fuji."
        }
      />

      <Feedback message={error} variant="error" />
      <Feedback
        message={feedback}
        variant={
          feedback?.toLowerCase().includes("exitoso") ||
          feedback?.includes("registrada")
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
      {busy && isEercPaymentMode() ? <ZkProgress /> : null}

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
            <div className="step-name">
              {avaxMode ? "Alta en directorio" : "Registro eERC20"}
            </div>
            <div className="step-meta">
              {registered ? "Listo" : avaxMode ? "Sin ZK" : "Claves + ZK"}
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
        Confirmo operar como institución autorizada en la red de prueba Fuji.
      </label>

      {!registered ? (
        <button
          type="button"
          className="primary-btn"
          disabled={
            busy ||
            !walletDone ||
            !kycDone ||
            (!avaxMode && !sdkReady) ||
            loadingInst
          }
          onClick={() =>
            void (avaxMode ? handleAvaxRegister() : handleEercRegister())
          }
        >
          {busy
            ? "Registrando…"
            : avaxMode
              ? "Registrar institución"
              : "Registrar en eERC20"}
        </button>
      ) : (
        <>
          {!avaxMode && sdk.isRegistered && !hasDecryptionKey && sdkReady ? (
            <>
              <Feedback
                message="Registro on-chain activo, pero falta la clave ZK en este navegador. Usá una opción de abajo para recuperarla."
                variant="info"
              />
              <ImportDemoKey />
              <RestoreZkKey />
            </>
          ) : null}
          <button
            type="button"
            className="primary-btn"
            disabled={!avaxMode && !hasDecryptionKey}
            onClick={() => router.push("/transferencias")}
          >
            {avaxMode || hasDecryptionKey
              ? "Ir a transferencias"
              : "Recuperá la clave ZK para continuar"}
          </button>
        </>
      )}

      <div className="note mt-4" role="note">
        {avaxMode
          ? "Pagos en AVAX nativo (Fuji testnet). Necesitás AVAX para gas y monto."
          : `Contrato eERC ${shortAddress(contractAddress)}. La sesión (clave ZK + institución) se guarda en sessionStorage como JSON en este navegador.`}
      </div>
    </PageShell>
  );
}
