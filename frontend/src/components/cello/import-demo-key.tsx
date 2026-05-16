"use client";

import { useState } from "react";

import { Feedback } from "@/components/feedback";
import { useCelloEerc } from "@/contexts/eerc-context";

export function ImportDemoKey() {
  const { sdk, hasDecryptionKey, persistDecryptionKey } = useCelloEerc();
  const [open, setOpen] = useState(!hasDecryptionKey);
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  if (!sdk.isRegistered) return null;

  function onImport() {
    const trimmed = value.trim();
    if (!/^\d+$/.test(trimmed)) {
      setMsg("Pegá la clave numérica que entregó el equipo (solo dígitos).");
      return;
    }
    persistDecryptionKey(trimmed);
    setValue("");
    setMsg("Clave cargada. Podés ir a Transferencias.");
  }

  return (
    <div className="panel mt-4">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <p className="panel-label mb-0">
          {hasDecryptionKey
            ? "Clave institucional en sesión"
            : "Ya registrado on-chain: importar clave local"}
        </p>
        <p className="panel-text text-sm mt-1">
          Demo institucional — sin consola del navegador.
        </p>
      </button>
      {open ? (
        <div className="mt-3 space-y-2">
          <label className="fl">
            <span className="fl-label">Clave de descifrado (demo)</span>
            <input
              className="fl-input font-mono text-sm"
              type="password"
              autoComplete="off"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Clave numérica del equipo"
            />
          </label>
          <button type="button" className="primary-btn" onClick={onImport}>
            Importar clave en este navegador
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
