/** Sesión local post-registro eERC (clave ZK + contexto institucional). Solo en el navegador. */

export const CELLO_SESSION_KEY = "cello-session";

export type CelloSessionV1 = {
  v: 1;
  walletAddress: string;
  contractAddress: string;
  decryptionKey: string;
  registeredAt: string;
  registerTxHash?: string;
  institution?: {
    name: string;
    initials: string;
  };
};

export type CelloSession = CelloSessionV1;

function normalizeAddress(addr: string): string {
  return addr.trim().toLowerCase();
}

export function loadCelloSession(): CelloSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CELLO_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CelloSession;
    if (
      parsed?.v !== 1 ||
      !parsed.walletAddress ||
      !parsed.contractAddress ||
      !parsed.decryptionKey
    ) {
      return null;
    }
    return {
      ...parsed,
      walletAddress: normalizeAddress(parsed.walletAddress),
      contractAddress: normalizeAddress(parsed.contractAddress),
    };
  } catch {
    return null;
  }
}

export function saveCelloSession(session: CelloSession): void {
  if (typeof window === "undefined") return;
  try {
    const payload: CelloSession = {
      ...session,
      v: 1,
      walletAddress: normalizeAddress(session.walletAddress),
      contractAddress: normalizeAddress(session.contractAddress),
    };
    sessionStorage.setItem(CELLO_SESSION_KEY, JSON.stringify(payload));
  } catch {
    // quota / private mode
  }
}

export function mergeCelloSession(
  partial: Partial<CelloSession> & {
    walletAddress: string;
    contractAddress: string;
    decryptionKey: string;
  },
): CelloSession {
  const existing = loadCelloSession();
  const next: CelloSession = {
    v: 1,
    walletAddress: normalizeAddress(partial.walletAddress),
    contractAddress: normalizeAddress(partial.contractAddress),
    decryptionKey: partial.decryptionKey,
    registeredAt: partial.registeredAt ?? existing?.registeredAt ?? new Date().toISOString(),
    registerTxHash: partial.registerTxHash ?? existing?.registerTxHash,
    institution: partial.institution ?? existing?.institution,
  };
  saveCelloSession(next);
  return next;
}

export function clearCelloSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(CELLO_SESSION_KEY);
  } catch {
    // ignore
  }
}

export function sessionMatches(
  session: CelloSession | null,
  wallet?: string,
  contract?: string,
): boolean {
  if (!session || !wallet || !contract) return false;
  return (
    session.walletAddress === normalizeAddress(wallet) &&
    session.contractAddress === normalizeAddress(contract)
  );
}

export type CelloSessionInput = {
  walletAddress: string;
  contractAddress: string;
  decryptionKey: string;
  registerTxHash?: string;
  institution?: { name: string; initials: string };
};

export function applyCelloSession(input: CelloSessionInput): void {
  saveCelloSession({
    v: 1,
    walletAddress: input.walletAddress,
    contractAddress: input.contractAddress,
    decryptionKey: input.decryptionKey.trim(),
    registeredAt: new Date().toISOString(),
    registerTxHash: input.registerTxHash,
    institution: input.institution,
  });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cello-session-updated"));
  }
}

/** Para consola: pegar objeto o JSON string sin recargar la página. */
export function applyCelloSessionFromConsole(
  payload: CelloSessionInput | string,
): string {
  try {
    const data =
      typeof payload === "string"
        ? (JSON.parse(payload) as CelloSessionInput)
        : payload;
    if (!data.walletAddress?.startsWith("0x")) {
      return "Error: walletAddress debe ser 0x… (minúsculas ok).";
    }
    if (!data.contractAddress?.startsWith("0x")) {
      return "Error: contractAddress debe ser 0x…";
    }
    if (!/^\d+$/.test(String(data.decryptionKey).trim())) {
      return "Error: decryptionKey debe ser el número largo (solo dígitos).";
    }
    applyCelloSession(data);
    return "OK — sesión guardada. Si no ves cambios, conectá la wallet correcta.";
  } catch {
    return "Error: JSON inválido.";
  }
}

export function sessionToExport(session: CelloSession): string {
  return JSON.stringify(session, null, 2);
}

export function parseCelloSessionFile(text: string): CelloSessionInput {
  const parsed = JSON.parse(text) as CelloSession;
  if (
    parsed?.v !== 1 ||
    !parsed.walletAddress ||
    !parsed.contractAddress ||
    !parsed.decryptionKey
  ) {
    throw new Error("Archivo de sesión inválido");
  }
  return {
    walletAddress: parsed.walletAddress,
    contractAddress: parsed.contractAddress,
    decryptionKey: parsed.decryptionKey,
    registerTxHash: parsed.registerTxHash,
    institution: parsed.institution,
  };
}

/** Descarga respaldo JSON (clave ZK + contexto). */
export function downloadCelloSessionFile(session?: CelloSession | null): boolean {
  if (typeof window === "undefined") return false;
  const data = session ?? loadCelloSession();
  if (!data) return false;

  const blob = new Blob([sessionToExport(data)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cello-session-${data.walletAddress.slice(2, 10)}.json`;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return true;
}

export function loadSessionDecryptionKey(
  wallet?: string,
  contract?: string,
): string | undefined {
  const session = loadCelloSession();
  if (!session) return undefined;
  if (wallet && contract && !sessionMatches(session, wallet, contract)) {
    return undefined;
  }
  if (wallet && session.walletAddress !== normalizeAddress(wallet)) {
    return undefined;
  }
  if (contract && session.contractAddress !== normalizeAddress(contract)) {
    return undefined;
  }
  return session.decryptionKey;
}
