"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

import { Feedback } from "@/components/feedback";
import { useCelloEerc } from "@/contexts/eerc-context";
import { applyCelloSession, isValidDecryptionKey } from "@/lib/cello-session";

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
    if (!isValidDecryptionKey(key)) {
      setMsg(
        "Pegá el valor de decryptionKey del JSON (hex 64 caracteres o número decimal largo).",
      );
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
        Pegá el campo decryptionKey de tu JSON de respaldo, o importá el archivo
        completo en el panel de arriba.
      </p>
      <label className="fl mt-3">
        <span className="fl-label">Clave de descifrado</span>
        <textarea
          className="fl-input min-h-[72px] font-mono text-xs"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder="35c952063b6e698f213141d745b12566c7b071df056de795c35be0254ba7f5b"
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
