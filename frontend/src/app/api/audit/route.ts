import { eq } from "drizzle-orm";
import { type NextRequest } from "next/server";

import { getDb, isDatabaseConfigured, schema } from "@/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return Response.json({ error: "Base de datos no configurada" }, { status: 503 });
  }

  const code = req.nextUrl.searchParams.get("code")?.trim().toUpperCase();
  if (!code || code.length < 6) {
    return Response.json({ error: "Código inválido" }, { status: 400 });
  }

  const db = getDb();
  const [row] = await db
    .select()
    .from(schema.indexedTransfers)
    .where(eq(schema.indexedTransfers.auditAccessCode, code))
    .limit(1);

  if (!row) {
    return Response.json({ error: "No hay transferencia con ese código" }, { status: 404 });
  }

  let fromName: string | null = null;
  let toName: string | null = null;

  const inst = await db.select().from(schema.institutions);
  for (const i of inst) {
    const w = i.walletAddress.toLowerCase();
    if (w === row.fromAddress) fromName = i.name;
    if (row.toAddress && w === row.toAddress) toName = i.name;
  }

  return Response.json({
    transfer: {
      auditAccessCode: row.auditAccessCode,
      txHash: row.txHash,
      fromAddress: row.fromAddress,
      toAddress: row.toAddress,
      fromName,
      toName,
      transferType: row.transferType,
      reference: row.reference,
      amountDisplay: row.amountDisplay,
      tokenSymbol: row.tokenSymbol,
      contractAddress: row.contractAddress,
      indexedAt: row.indexedAt,
    },
  });
}
