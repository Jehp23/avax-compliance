"use client";

import { useEffect, useState } from "react";

export function useMyInstitution(walletAddress?: string) {
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) {
      setApproved(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/institutions?approved=true");
        const data = (await res.json()) as {
          institutions?: { walletAddress: string; kycStatus: string }[];
        };
        if (cancelled) return;
        const ok = (data.institutions ?? []).some(
          (i) =>
            i.walletAddress.toLowerCase() === walletAddress.toLowerCase() &&
            i.kycStatus === "approved",
        );
        setApproved(ok);
      } catch {
        if (!cancelled) setApproved(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [walletAddress]);

  return { approved, loading };
}
