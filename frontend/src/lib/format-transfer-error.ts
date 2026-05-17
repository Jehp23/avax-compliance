/** Mensajes claros para errores de transferencia / ZK en el browser. */

export function formatTransferError(err: unknown): string {
  const msg =
    err instanceof Error ? err.message : typeof err === "string" ? err : "";

  if (/failed to fetch/i.test(msg)) {
    return (
      "Error de red al generar o enviar la transacción (Failed to fetch). " +
      "Si tu wallet ya estaba registrada on-chain: pegá la clave en consola " +
      "(cello-eerc-decryption-key) y recargá la página. " +
      "También verificá red Fuji, conexión estable y que el destinatario esté registrado."
    );
  }

  if (/invalid amount/i.test(msg)) {
    return (
      "Monto inválido para esta transferencia. Suele pasar si: (1) el monto es 0 o vacío, " +
      "(2) el saldo descifrado es 0 o menor al monto (clave incorrecta o wallet sin mint), " +
      "(3) usás coma decimal — probá con punto, ej. 100.5. " +
      "Pasá por /registro con la wallet institucional demo; el mint está en Bankaool (deployer)."
    );
  }

  if (/insufficient|balance|saldo/i.test(msg)) {
    return `Saldo insuficiente o no descifrado: ${msg}`;
  }

  return msg || "No se pudo enviar la transferencia.";
}
