import { existsSync, statSync } from "node:fs";
import path from "node:path";

import { sql } from "drizzle-orm";

import { getDb, isDatabaseConfigured } from "@/db";
import { resolveEercContract } from "@/lib/eerc-config";
import { getPublicEnv, isEercConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const env = getPublicEnv();
  const contract = resolveEercContract(env);
  const circuitsPath = path.join(
    process.cwd(),
    "public/circuits/RegistrationCircuit.wasm",
  );
  const registrationWasmBytes = existsSync(circuitsPath)
    ? statSync(circuitsPath).size
    : 0;
  /** EncryptedERC zkit ≈ 1_882_087; demo 3dent ≈ 1_881_217 */
  const circuitsCelloOk = registrationWasmBytes >= 1_882_000;
  const circuits = circuitsCelloOk;

  let database = false;
  if (isDatabaseConfigured()) {
    try {
      await getDb().execute(sql`SELECT 1`);
      database = true;
    } catch {
      database = false;
    }
  }

  const body = {
    ok: circuits && Boolean(contract),
    chain: "avalanche-fuji",
    chainId: 43113,
    contract,
    eercEnvConfigured: isEercConfigured(),
    eercMode: env.eercMode,
    circuits,
    circuitsCelloOk,
    registrationWasmBytes,
    database,
    databaseConfigured: isDatabaseConfigured(),
    timestamp: new Date().toISOString(),
  };

  return Response.json(body, {
    status: body.ok ? 200 : 503,
  });
}
