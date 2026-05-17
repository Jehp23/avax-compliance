"use client";

import { useEffect, useState } from "react";

export type InstitutionRow = {
  id: string;
  walletAddress: string;
  name: string;
  initials: string;
  kycStatus: string;
};

export function useApprovedInstitutions(excludeAddress?: string) {
  const [institutions, setInstitutions] = useState<InstitutionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/institutions?approved=true");
        const data = (await res.json()) as { institutions?: InstitutionRow[] };
        if (cancelled) return;
        const list = (data.institutions ?? []).filter(
          (i) =>
            i.kycStatus === "approved" &&
            (!excludeAddress ||
              i.walletAddress.toLowerCase() !== excludeAddress.toLowerCase()),
        );
        setInstitutions(list);
      } catch {
        if (!cancelled) setInstitutions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [excludeAddress]);

  return { institutions, loading };
}
