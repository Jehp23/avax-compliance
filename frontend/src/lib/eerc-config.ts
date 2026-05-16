import type { VeilaPublicEnv } from "@/lib/env";

/** Contratos de referencia en Fuji (3dent / Ava Labs demo). Override con env en prod. */
export const FUJI_EERC_STANDALONE =
  "0x5E9c6F952fB9615583182e70eDDC4e6E4E0aC0e0" as const;

export const FUJI_EERC_CONVERTER =
  "0x372dAB27c8d223Af11C858ea00037Dc03053B22E" as const;

export const FUJI_DEMO_ERC20 =
  "0xb0Fe621B4Bd7fe4975f7c58E3D6ADaEb2a2A35CD" as const;

export const EXPLORER_ADDRESS = "https://testnet.snowtrace.io/address/";
export const EXPLORER_TX = "https://testnet.snowtrace.io/tx/";

export const CIRCUIT_CONFIG = {
  register: {
    wasm: "/circuits/RegistrationCircuit.wasm",
    zkey: "/circuits/RegistrationCircuit.groth16.zkey",
  },
  mint: {
    wasm: "/circuits/MintCircuit.wasm",
    zkey: "/circuits/MintCircuit.groth16.zkey",
  },
  transfer: {
    wasm: "/circuits/TransferCircuit.wasm",
    zkey: "/circuits/TransferCircuit.groth16.zkey",
  },
  withdraw: {
    wasm: "/circuits/WithdrawCircuit.wasm",
    zkey: "/circuits/WithdrawCircuit.groth16.zkey",
  },
  burn: {
    wasm: "/circuits/MintCircuit.wasm",
    zkey: "/circuits/MintCircuit.groth16.zkey",
  },
} as const;

export function resolveEercContract(env: VeilaPublicEnv): `0x${string}` {
  if (env.eercContract) return env.eercContract;
  return env.eercMode === "converter"
    ? FUJI_EERC_CONVERTER
    : FUJI_EERC_STANDALONE;
}

export function resolveConverterToken(env: VeilaPublicEnv): `0x${string}` | undefined {
  if (env.eercMode !== "converter") return undefined;
  return env.converterErc20 ?? FUJI_DEMO_ERC20;
}

export function explorerTx(hash: string): string {
  return `${EXPLORER_TX}${hash}`;
}
