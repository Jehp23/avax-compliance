/** Variables públicas validadas en build/runtime del cliente. */

export type PaymentAsset = "avax" | "eerc";

export type CelloPublicEnv = {
  paymentAsset: PaymentAsset;
  vaultContract: `0x${string}` | null;
  eercContract: `0x${string}` | null;
  eercMode: "standalone" | "converter";
  converterErc20: `0x${string}` | null;
  fujiRpc: string;
  indexerFromBlock: bigint;
  demoCounterparties: {
    bankaool?: `0x${string}`;
    finnova?: `0x${string}`;
    rutalog?: `0x${string}`;
  };
  auditorPreviewSecret: string | null;
  showDevStatusBar: boolean;
};

function readAddress(key: string): `0x${string}` | null {
  const raw = process.env[key]?.trim();
  if (!raw?.startsWith("0x") || raw.length < 42) return null;
  return raw as `0x${string}`;
}

export function getPublicEnv(): CelloPublicEnv {
  const mode =
    process.env.NEXT_PUBLIC_EERC_MODE === "converter"
      ? "converter"
      : "standalone";

  let indexerFromBlock = 0n;
  const blockRaw = process.env.NEXT_PUBLIC_INDEXER_FROM_BLOCK;
  if (blockRaw) {
    try {
      indexerFromBlock = BigInt(blockRaw);
    } catch {
      indexerFromBlock = 0n;
    }
  }

  const paymentAsset: PaymentAsset =
    process.env.NEXT_PUBLIC_PAYMENT_ASSET === "avax" ? "avax" : "eerc";

  return {
    paymentAsset,
    vaultContract: readAddress("NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS"),
    eercContract: readAddress("NEXT_PUBLIC_EERC_CONTRACT_ADDRESS"),
    eercMode: mode,
    converterErc20: readAddress("NEXT_PUBLIC_CONVERTER_ERC20_ADDRESS"),
    fujiRpc:
      process.env.NEXT_PUBLIC_AVALANCHE_FUJI_RPC ??
      "https://api.avax-test.network/ext/bc/C/rpc",
    indexerFromBlock,
    demoCounterparties: {
      bankaool: readAddress("NEXT_PUBLIC_DEMO_BANKAOOL") ?? undefined,
      finnova: readAddress("NEXT_PUBLIC_DEMO_FINNOVA") ?? undefined,
      rutalog: readAddress("NEXT_PUBLIC_DEMO_RUTALOG") ?? undefined,
    },
    auditorPreviewSecret:
      process.env.NEXT_PUBLIC_AUDITOR_PREVIEW_SECRET?.trim() || null,
    showDevStatusBar: process.env.NEXT_PUBLIC_SHOW_DEV_STATUS_BAR === "1",
  };
}

export function isEercConfigured(): boolean {
  return getPublicEnv().eercContract !== null;
}
