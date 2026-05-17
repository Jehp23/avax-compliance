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
      if (data.walletAddress.toLowerCase() !== address.toLowerCase()) {
        setMsg(
          `El archivo es de ${shortAddress(data.walletAddress as `0x${string}`)}. Conectá esa wallet en MetaMask.`,
        );
        return;
      }
      if (
        data.contractAddress.toLowerCase() !== contractAddress.toLowerCase()
      ) {
        setMsg(
          `El archivo usa el contrato ${shortAddress(data.contractAddress as `0x${string}`)}; la app está en ${shortAddress(contractAddress)}.`,
        );
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
    <section
      className={`session-backup-card panel ${highlightDownload ? "panel--highlight" : ""}`}
      aria-labelledby="session-backup-title"
    >
      <header className="session-backup-card__head">
        <p id="session-backup-title" className="panel-label">
          Respaldo de sesión
        </p>
        <p className="panel-text">
          Descargá el JSON con tu clave ZK y datos institucionales. Lo necesitás
          si cambiás de navegador o borrás datos del sitio.
        </p>
        <p className="session-backup-card__warn">
          No compartas este archivo: equivale a tu llave privada de descifrado.
        </p>
      </header>

      <dl className="session-backup-card__meta">
        <div className="session-backup-card__meta-row">
          <dt>Wallet</dt>
          <dd>{shortAddress(session.walletAddress as `0x${string}`)}</dd>
        </div>
        <div className="session-backup-card__meta-row">
          <dt>Contrato</dt>
          <dd>{shortAddress(session.contractAddress as `0x${string}`)}</dd>
        </div>
      </dl>

      <div className="session-backup-card__actions">
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

      {msg ? (
        <div className="session-backup-card__feedback">
          <Feedback
            message={msg}
            variant={
              msg.toLowerCase().includes("descargado") ||
              msg.toLowerCase().includes("importada")
                ? "success"
                : "info"
            }
          />
        </div>
      ) : null}
    </section>
  );
}
