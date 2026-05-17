import { getPublicEnv } from "@/lib/env";

export function isAvaxPaymentMode(): boolean {
  return getPublicEnv().paymentAsset === "avax";
}

export function isEercPaymentMode(): boolean {
  return getPublicEnv().paymentAsset === "eerc";
}
