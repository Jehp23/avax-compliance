import { and, desc, eq, or } from "drizzle-orm";
import { type NextRequest } from "next/server";
import { isAddress, isHash } from "viem";

import { getDb, isDatabaseConfigured, schema } from "@/db";
import { generateAuditAccessCode } from "@/lib/audit-code";
import { getEercContractAddress } from "@/lib/contracts";

export const dynamic = "force-dynamic";

function normalizeAddr(addr: string): string {
  return addr.toLowerCase();
}

async function isApprovedInstitution(wallet: string): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({ kycStatus: schema.institutions.kycStatus })
    .from(schema.institutions)
    .where(eq(schema.institutions.walletAddress, normalizeAddr(wallet)))
    .limit(1);
  return rows[0]?.kycStatus === "approved";
}

export async function GET(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return Response.json({ transfers: [], db: false });
  }

  const { searchParams } = req.nextUrl;
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
  const address = searchParams.get("address")?.trim();

  const db = getDb();

  const transfers =
    address && isAddress(address)
      ? await db
          .select()
          .from(schema.indexedTransfers)
          .where(
            or(
              eq(schema.indexedTransfers.fromAddress, normalizeAddr(address)),
              eq(schema.indexedTransfers.toAddress, normalizeAddr(address)),
            ),
          )
          .orderBy(desc(schema.indexedTransfers.indexedAt))
          .limit(limit)
      : await db
          .select()
          .from(schema.indexedTransfers)
          .orderBy(desc(schema.indexedTransfers.indexedAt))
          .limit(limit);

  return Response.json({ transfers, db: true });
}

export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return Response.json({ error: "DATABASE_URL no configurada" }, { status: 503 });
  }

  const body = (await req.json()) as {
    txHash?: string;
    fromAddress?: string;
    toAddress?: string | null;
    transferType?: "register" | "transfer" | "mint" | "burn" | "other";
    reference?: string;
    contractAddress?: string;
    amountDisplay?: string;
    tokenSymbol?: string;
  };

  const txHash = body.txHash?.trim();
  if (!txHash || !isHash(txHash)) {
    return Response.json({ error: "txHash inválido" }, { status: 400 });
  }
  const from = body.fromAddress?.trim();
  if (!from || !isAddress(from)) {
    return Response.json({ error: "fromAddress inválida" }, { status: 400 });
  }

  let to: string | null = null;
  if (body.toAddress?.trim()) {
    if (!isAddress(body.toAddress)) {
      return Response.json({ error: "toAddress inválida" }, { status: 400 });
    }
    to = normalizeAddr(body.toAddress);
  }

  const transferType = body.transferType ?? "transfer";
  if (transferType === "transfer" && to) {
    const destApproved = await isApprovedInstitution(to);
    if (!destApproved) {
      return Response.json(
        {
          error:
            "El destinatario debe estar registrado en Cello (institución aprobada).",
        },
        { status: 400 },
      );
    }
  }

  const db = getDb();
  const contractRaw = body.contractAddress?.trim();
  const contract = contractRaw
    ? contractRaw.toLowerCase()
    : (() => {
        try {
          return getEercContractAddress();
        } catch {
          return "native-avax";
        }
      })();
  const hash = txHash.toLowerCase();

  const existing = await db
    .select()
    .from(schema.indexedTransfers)
    .where(eq(schema.indexedTransfers.txHash, hash))
    .limit(1);

  if (existing[0]) {
    return Response.json({
      transfer: existing[0],
      indexed: false,
      auditAccessCode: existing[0].auditAccessCode,
    });
  }

  let auditAccessCode = generateAuditAccessCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const [row] = await db
        .insert(schema.indexedTransfers)
        .values({
          txHash: hash,
          fromAddress: normalizeAddr(from),
          toAddress: to,
          transferType,
          reference: body.reference?.trim() || null,
          contractAddress: contract.toLowerCase(),
          auditAccessCode,
          amountDisplay: body.amountDisplay?.trim() || null,
          tokenSymbol: body.tokenSymbol?.trim() || null,
        })
        .returning();

      return Response.json({
        transfer: row,
        indexed: true,
        auditAccessCode: row.auditAccessCode,
      });
    } catch {
      auditAccessCode = generateAuditAccessCode();
    }
  }

  return Response.json({ error: "No se pudo indexar la transferencia" }, { status: 500 });
}
