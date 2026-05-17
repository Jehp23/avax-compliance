"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

import { Feedback } from "@/components/feedback";
import { useCelloEerc } from "@/contexts/eerc-context";
import {
  applyCelloSession,
  isValidDecryptionKey,
  normalizeDecryptionKey,
  parseCelloSessionFile,
} from "@/lib/cello-session";
import { shortAddress } from "@/lib/format-address";

/** Pegar clave ZK o JSON de respaldo exportado al registrarse. */
export function RestoreZkKey() {
  const { address } = useAccount();
  const { sdk, contractAddress, hasDecryptionKey, persistDecryptionKey } =
    useCelloEerc();
  const [keyInput, setKeyInput] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [msgVariant, setMsgVariant] = useState<"info" | "success" | "error">(
    "info",
  );

  if (!sdk.isRegistered || hasDecryptionKey) return null;

  function onRestore() {
    if (!address) {
      setMsg("Conectá la wallet primero.");
      setMsgVariant("error");
      return;
    }

    const raw = keyInput.trim();
    if (!raw) {
      setMsg("Pegá el JSON completo o solo el valor de decryptionKey.");
      setMsgVariant("error");
      return;
    }

    // JSON completo de respaldo
    if (raw.startsWith("{")) {
      try {
        const data = parseCelloSessionFile(raw);
        if (data.walletAddress.toLowerCase() !== address.toLowerCase()) {
          setMsg(
            `Este archivo es de otra wallet (${shortAddress(data.walletAddress as `0x${string}`)}). Conectá la wallet correcta en MetaMask.`,
          );
          setMsgVariant("error");
          return;
        }
        if (
          data.contractAddress.toLowerCase() !==
          contractAddress.toLowerCase()
        ) {
          setMsg(
            `El registro fue en el contrato ${shortAddress(data.contractAddress as `0x${string}`)}, pero la app usa ${shortAddress(contractAddress)}. Ajustá NEXT_PUBLIC_EERC_CONTRACT_ADDRESS en el deploy o registrate de nuevo en este contrato.`,
          );
          setMsgVariant("error");
          return;
        }
        if (!isValidDecryptionKey(data.decryptionKey)) {
          setMsg("El JSON no trae una decryptionKey válida.");
          setMsgVariant("error");
          return;
        }
        const key = normalizeDecryptionKey(data.decryptionKey);
        applyCelloSession({ ...data, decryptionKey: key });
        persistDecryptionKey(key);
        setKeyInput("");
        setMsg("Sesión restaurada desde JSON. Ya podés ir a Transferencias.");
        setMsgVariant("success");
        return;
      } catch {
        setMsg("JSON inválido. Usá el archivo exportado al registrarte.");
        setMsgVariant("error");
        return;
      }
    }

    // Solo decryptionKey
    const key = normalizeDecryptionKey(raw);
    if (!isValidDecryptionKey(key)) {
      setMsg(
        "Clave inválida. Pegá el campo decryptionKey del JSON o el archivo completo.",
      );
      setMsgVariant("error");
      return;
    }

    persistDecryptionKey(key);
    applyCelloSession({
      walletAddress: address,
      contractAddress,
      decryptionKey: key,
    });
    setKeyInput("");
    setMsg("Clave guardada. Ya podés ir a Transferencias.");
    setMsgVariant("success");
  }

  return (
    <div className="panel mt-4">
      <p className="panel-label">Restaurar clave ZK manualmente</p>
      <p className="panel-text text-sm">
        Pegá el <strong>JSON completo</strong> de respaldo (recomendado) o solo
        el valor de <code>decryptionKey</code>.
      </p>
      <label className="fl mt-3">
        <span className="fl-label">JSON o clave</span>
        <textarea
          className="fl-input min-h-[96px] font-mono text-xs"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder='{"v":1,"walletAddress":"0x…","decryptionKey":"…"}'
          spellCheck={false}
        />
      </label>
      <button type="button" className="primary-btn mt-2" onClick={onRestore}>
        Guardar clave en sesión
      </button>
      <Feedback message={msg} variant={msgVariant} />
    </div>
  );
}
