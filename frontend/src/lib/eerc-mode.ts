import { getPublicEnv } from "@/lib/env";

export function isEercConverterMode(): boolean {
  const env = getPublicEnv();
  return env.paymentAsset === "eerc" && env.eercMode === "converter";
}

export function isEercStandaloneMode(): boolean {
  const env = getPublicEnv();
  return env.paymentAsset === "eerc" && env.eercMode === "standalone";
}
