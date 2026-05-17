import { isAddress } from "viem";

import {
  getDemoDecryptionKey,
  isDemoAutoUnlockEnabled,
  resolveDemoRole,
} from "@/lib/demo-server";

export const dynamic = "force-dynamic";

type Body = { walletAddress?: string };

/** Devuelve la clave demo sin passphrase (solo wallets Bankaool / FinNova en testnet). */
export async function POST(request: Request) {
  if (!isDemoAutoUnlockEnabled()) {
    return Response.json(
      { error: "Auto-unlock demo desactivado en el servidor." },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const wallet = body.walletAddress?.trim();
  if (!wallet || !isAddress(wallet)) {
    return Response.json({ error: "walletAddress inválida" }, { status: 400 });
  }

  const role = resolveDemoRole(wallet);
  if (!role) {
    return Response.json(
      { error: "Wallet no es cuenta demo institucional" },
      { status: 403 },
    );
  }

  const decryptionKey = getDemoDecryptionKey(role);
  if (!decryptionKey) {
    return Response.json({ error: "Clave demo no configurada" }, { status: 503 });
  }

  return Response.json({ ok: true, role, decryptionKey });
}
