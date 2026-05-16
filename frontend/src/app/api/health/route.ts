import { existsSync } from "node:fs";
import path from "node:path";

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
  const circuits = existsSync(circuitsPath);

  const body = {
    ok: circuits && Boolean(contract),
    chain: "avalanche-fuji",
    chainId: 43113,
    contract,
    eercEnvConfigured: isEercConfigured(),
    eercMode: env.eercMode,
    circuits,
    timestamp: new Date().toISOString(),
  };

  return Response.json(body, {
    status: body.ok ? 200 : 503,
  });
}
