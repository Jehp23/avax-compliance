/**
 * Direcciones públicas tras deploy Fuji — las completa tu equipo en `.env.local`.
 */
export function getEercTokenAddress(): `0x${string}` | undefined {
  const raw = process.env.NEXT_PUBLIC_EERC_TOKEN_ADDRESS;
  if (!raw || !raw.startsWith("0x") || raw.length < 42) return undefined;
  return raw as `0x${string}`;
}
