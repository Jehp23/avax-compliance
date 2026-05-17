/** Código público por transferencia (ej. CEL-A3K9F2). */
export function generateAuditAccessCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `CEL-${suffix}`;
}
