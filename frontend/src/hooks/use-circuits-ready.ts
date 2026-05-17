"use client";

import { useEffect, useState } from "react";

export function useCircuitsReady() {
  const [ready, setReady] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/circuits/RegistrationCircuit.wasm", { method: "HEAD" })
      .then((r) => {
        if (!r.ok) {
          setReady(false);
          return;
        }
        const len = Number(r.headers.get("content-length") ?? 0);
        setReady(len >= 1_882_000);
      })
      .catch(() => setReady(false));
  }, []);

  return ready;
}
