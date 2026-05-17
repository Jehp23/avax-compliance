"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

import { Feedback } from "@/components/feedback";
import { useCelloEerc } from "@/contexts/eerc-context";
import { isDemoWalletAddress } from "@/lib/demo-client";

export function ImportDemoKey() {
  const { address } = useAccount();
  const { sdk, hasDecryptionKey, persistDecryptionKey } = useCelloEerc();
  const [open, setOpen] = useState(true);
  const [passphrase, setPassphrase] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!sdk.isRegistered || hasDecryptionKey) return null;
  if (!address || !isDemoWalletAddress(address)) return null;

  async function unlockFromDeploy() {
    if (!address) {
      setMsg("Conectá la wallet en Fuji primero.");
      return;
    }
    if (!passphrase.trim()) {
      setMsg("Ingresá el código de equipo.");
      return;
    }

    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/demo/unlock-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          passphrase: passphrase.trim(),
        }),
      });
      const data = (await res.json()) as {
        decryptionKey?: string;
        error?: string;
      };
      if (!res.ok || !data.decryptionKey) {
        setMsg(data.error ?? "No se pudo desbloquear la clave.");
        return;
      }
      persistDecryptionKey(data.decryptionKey);
      setPassphrase("");
      setMsg("Clave ZK cargada. Ya podés ir a Transferencias.");
    } catch {
      setMsg("Error de red al contactar el servidor.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel mt-4">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <p className="panel-label mb-0">Recuperar clave (cuenta demo)</p>
        <p className="panel-text text-sm mt-1">
          Wallet ya registrada on-chain: cargá la clave ZK con el código de equipo.
        </p>
      </button>
      {open ? (
        <div className="mt-3 space-y-2">
          <label className="fl">
            <span className="fl-label">Código de equipo</span>
            <input
              className="fl-input"
              type="password"
              autoComplete="off"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Código del equipo"
            />
          </label>
          <button
            type="button"
            className="primary-btn"
            disabled={busy}
            onClick={() => void unlockFromDeploy()}
          >
            {busy ? "Desbloqueando…" : "Cargar clave ZK"}
          </button>
          <Feedback
            message={msg}
            variant={msg?.includes("cargada") ? "success" : "info"}
          />
        </div>
      ) : null}
    </div>
  );
}
