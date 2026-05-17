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
      "Completá el onboarding en Registro y verificá saldo en testnet."
    );
  }

  if (/0xe450d38c|ERC20InsufficientBalance/i.test(msg)) {
    return (
      "No tenés suficiente token público (DMT/TEST) en la wallet para ese monto. " +
      "La columna «DMT público» debe ser mayor que cero antes de depositar. Pedí mint del token demo al equipo."
    );
  }

  if (/insufficient|balance|saldo/i.test(msg)) {
    return `Saldo insuficiente o no descifrado: ${msg}`;
  }

  if (/deposit.*reverted|function "deposit"/i.test(msg)) {
    return (
      "El depósito fue rechazado por el contrato. Revisá que tengas token público suficiente " +
      "y que hayas aprobado el monto antes (paso 1)."
    );
  }

  return msg || "No se pudo completar la operación.";
}
