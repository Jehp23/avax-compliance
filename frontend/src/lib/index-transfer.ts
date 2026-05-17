/** Registra una tx en Neon (best-effort; no bloquea el flujo ZK). */

export type IndexTransferPayload = {
  txHash: string;
  fromAddress: string;
  toAddress?: string | null;
  transferType?: "register" | "transfer" | "mint" | "burn" | "other";
  reference?: string;
  contractAddress?: string;
  amountDisplay?: string;
  tokenSymbol?: string;
};

export type IndexTransferResult = {
  indexed: boolean;
  auditAccessCode?: string;
  transfer?: { auditAccessCode: string };
};

export async function indexTransferOnServer(
  payload: IndexTransferPayload,
): Promise<IndexTransferResult | null> {
  try {
    const res = await fetch("/api/transfers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return (await res.json()) as IndexTransferResult;
  } catch {
    return null;
  }
}
