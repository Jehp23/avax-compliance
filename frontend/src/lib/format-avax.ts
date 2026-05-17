import { formatEther } from "viem";

/** Saldo AVAX legible en UI (evita decimales infinitos de wei). */
export function formatAvaxDisplay(wei: bigint | undefined | null): string {
  if (wei == null) return "—";
  const n = Number(formatEther(wei));
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "0";
  if (n >= 1000) {
    return n.toLocaleString("es-MX", { maximumFractionDigits: 2 });
  }
  const s = n.toLocaleString("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
  return s;
}
