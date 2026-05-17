"use client";

import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";

import { useCelloEerc } from "@/contexts/eerc-context";
import { isDemoWalletAddress } from "@/lib/demo-client";

/** Carga la clave ZK de wallets demo sin pedir código (video / hackathon). */
export function useAutoDemoUnlock() {
  const { address } = useAccount();
  const { sdk, hasDecryptionKey, persistDecryptionKey } = useCelloEerc();
  const attempted = useRef<string | null>(null);

  useEffect(() => {
    if (!address || !isDemoWalletAddress(address)) return;
    if (!sdk.isRegistered || !sdk.isAllDataFetched) return;
    if (hasDecryptionKey) return;
    if (attempted.current === address) return;

    let cancelled = false;
    attempted.current = address;

    void (async () => {
      try {
        const res = await fetch("/api/demo/auto-unlock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress: address }),
        });
        const data = (await res.json()) as {
          decryptionKey?: string;
        };
        if (cancelled || !res.ok || !data.decryptionKey) return;
        persistDecryptionKey(data.decryptionKey);
      } catch {
        attempted.current = null;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    address,
    sdk.isRegistered,
    sdk.isAllDataFetched,
    hasDecryptionKey,
    persistDecryptionKey,
  ]);
}
