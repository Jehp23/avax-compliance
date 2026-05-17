"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

import { Feedback } from "@/components/feedback";
import { useCelloEerc } from "@/contexts/eerc-context";
import { applyCelloSession } from "@/lib/cello-session";

/** Pegar clave ZK exportada al registrarse (mismo navegador u otro dispositivo). */
export function RestoreZkKey() {
  const { address } = useAccount();
  const { sdk, contractAddress, hasDecryptionKey, persistDecryptionKey } =
    useCelloEerc();
  const [keyInput, setKeyInput] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  if (!sdk.isRegistered || hasDecryptionKey) return null;

  function onRestore() {
    if (!address) {
      setMsg("Conectá la wallet primero.");
      return;
    }
    const key = keyInput.trim();
    if (!key || !/^\d+$/.test(key)) {
      setMsg("Pegá la clave numérica completa que obtuviste al registrarte.");
      return;
    }
    persistDecryptionKey(key);
    applyCelloSession({
      walletAddress: address,
      contractAddress,
      decryptionKey: key,
    });
    setKeyInput("");
    setMsg("Clave restaurada. Podés ir a Transferencias sin recargar.");
  }

  return (
    <div className="panel mt-4">
      <p className="panel-label">Restaurar clave ZK manualmente</p>
      <p className="panel-text text-sm">
        Si registraste esta wallet antes, pegá la clave privada de descifrado
        (número largo) que se guardó al hacer el onboarding.
      </p>
      <label className="fl mt-3">
        <span className="fl-label">Clave de descifrado</span>
        <textarea
          className="fl-input min-h-[72px] font-mono text-xs"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder="1786377130476436939165516341661479903892551626273299201306892914679192368067"
          spellCheck={false}
        />
      </label>
      <button
        type="button"
        className="primary-btn mt-2"
        onClick={onRestore}
      >
        Guardar clave en sesión
      </button>
      <Feedback
        message={msg}
        variant={msg?.includes("restaurada") ? "success" : "info"}
      />
    </div>
  );
}
