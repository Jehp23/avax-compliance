import {
  clearCelloSession,
  loadSessionDecryptionKey,
  mergeCelloSession,
} from "@/lib/cello-session";

const LEGACY_STORAGE_KEY = "cello-eerc-decryption-key";
const LEGACY_VEILA_KEY = "veila-eerc-decryption-key";

export function loadDecryptionKey(
  wallet?: string,
  contract?: string,
): string | undefined {
  if (typeof window === "undefined") return undefined;

  const fromSession = loadSessionDecryptionKey(wallet, contract);
  if (fromSession) return fromSession;

  try {
    const legacy =
      sessionStorage.getItem(LEGACY_STORAGE_KEY) ??
      sessionStorage.getItem(LEGACY_VEILA_KEY) ??
      undefined;
    if (!legacy) return undefined;
    if (wallet && contract) {
      mergeCelloSession({
        walletAddress: wallet,
        contractAddress: contract,
        decryptionKey: legacy,
      });
      sessionStorage.removeItem(LEGACY_STORAGE_KEY);
      sessionStorage.removeItem(LEGACY_VEILA_KEY);
    }
    return legacy;
  } catch {
    return undefined;
  }
}

export function saveDecryptionKey(
  key: string,
  wallet?: string,
  contract?: string,
): void {
  if (typeof window === "undefined") return;
  try {
    if (wallet && contract) {
      mergeCelloSession({
        walletAddress: wallet,
        contractAddress: contract,
        decryptionKey: key,
      });
      return;
    }
    sessionStorage.setItem(LEGACY_STORAGE_KEY, key);
    sessionStorage.removeItem(LEGACY_VEILA_KEY);
  } catch {
    // ignore quota / private mode
  }
}

export function hasDecryptionKey(wallet?: string, contract?: string): boolean {
  return Boolean(loadDecryptionKey(wallet, contract));
}

export function clearDecryptionKey(): void {
  if (typeof window === "undefined") return;
  try {
    clearCelloSession();
    sessionStorage.removeItem(LEGACY_STORAGE_KEY);
    sessionStorage.removeItem(LEGACY_VEILA_KEY);
  } catch {
    // ignore
  }
}
