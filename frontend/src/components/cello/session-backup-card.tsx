"use client";

import { useRef, useState } from "react";
import { useAccount } from "wagmi";

import { Feedback } from "@/components/feedback";
import { useCelloEerc } from "@/contexts/eerc-context";
import {
  applyCelloSession,
  downloadCelloSessionFile,
  loadCelloSession,
  parseCelloSessionFile,
  sessionMatches,
} from "@/lib/cello-session";
import { shortAddress } from "@/lib/format-address";

type SessionBackupCardProps = {
  highlightDownload?: boolean;
};

export function SessionBackupCard({
  highlightDownload = false,
}: SessionBackupCardProps) {
  const { address } = useAccount();
  const { contractAddress, hasDecryptionKey, persistDecryptionKey } =
    useCelloEerc();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const session = loadCelloSession();
  const canUse =
    Boolean(address) &&
    hasDecryptionKey &&
    sessionMatches(session, address, contractAddress);

  if (!canUse || !session) return null;

  function onDownload() {
    const ok = downloadCelloSessionFile(session);
    setMsg(
      ok
        ? "Archivo descargado. Guardalo en un lugar seguro (contiene tu clave ZK)."
        : "No se pudo generar el archivo.",
    );
  }

  async function onImportFile(file: File | undefined) {
    if (!file || !address) return;
    setMsg(null);
    try {
      const text = await file.text();
      const data = parseCelloSessionFile(text);
      if (
        data.walletAddress.toLowerCase() !== address.toLowerCase()
      ) {
        setMsg("El archivo pertenece a otra wallet. Conectá la wallet correcta.");
        return;
      }
      applyCelloSession(data);
      persistDecryptionKey(data.decryptionKey);
      setMsg("Sesión importada desde el archivo JSON.");
    } catch {
      setMsg("Archivo inválido. Usá el JSON exportado al registrarte.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div
      className={`panel mt-4 ${highlightDownload ? "panel--highlight" : ""}`}
    >
      <p className="panel-label">Respaldo de sesión</p>
      <p className="panel-text text-sm">
        Descargá el JSON con tu clave ZK y datos institucionales. Lo necesitás
        si cambiás de navegador o borrás datos del sitio.{" "}
        <strong>No lo compartas</strong> — es equivalente a tu llave privada de
        descifrado.
      </p>
      <p className="panel-text text-sm mt-2 font-mono">
        Wallet {shortAddress(session.walletAddress as `0x${string}`)} · Contrato{" "}
        {shortAddress(session.contractAddress as `0x${string}`)}
      </p>
      <div className="btn-row mt-3">
        <button type="button" className="primary-btn" onClick={onDownload}>
          Descargar JSON de sesión
        </button>
        <button
          type="button"
          className="secondary-btn"
          onClick={() => fileRef.current?.click()}
        >
          Importar JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(e) => void onImportFile(e.target.files?.[0])}
        />
      </div>
      <Feedback
        message={msg}
        variant={
          msg?.toLowerCase().includes("descargado") ||
          msg?.toLowerCase().includes("importada")
            ? "success"
            : "info"
        }
      />
    </div>
  );
}
