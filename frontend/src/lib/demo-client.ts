import { getPublicEnv } from "@/lib/env";

export function isDemoWalletAddress(
  address?: string | null,
): address is `0x${string}` {
  if (!address) return false;
  const w = address.toLowerCase();
  const { demoCounterparties } = getPublicEnv();
  const bank = demoCounterparties.bankaool?.toLowerCase();
  const fin = demoCounterparties.finnova?.toLowerCase();
  return Boolean((bank && w === bank) || (fin && w === fin));
}
