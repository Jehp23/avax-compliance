import { formatEther, formatUnits } from "viem";

function formatNumberCompact(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "0";
  if (n >= 1000) {
    return n.toLocaleString("es-MX", { maximumFractionDigits: 2 });
  }
  return n.toLocaleString("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}

/** Saldo en wei/units legible en UI (evita decimales infinitos). */
export function formatWeiDisplay(
  wei: bigint | undefined | null,
  decimals = 18,
): string {
  if (wei == null) return "—";
  const n = Number(formatUnits(wei, decimals));
  return formatNumberCompact(n);
}

/** Saldo AVAX legible en UI (evita decimales infinitos de wei). */
export function formatAvaxDisplay(wei: bigint | undefined | null): string {
  if (wei == null) return "—";
  const n = Number(formatEther(wei));
  if (!Number.isFinite(n)) return "—";
  return formatNumberCompact(n);
}
