"use client";

import { useEffect, useState } from "react";

import { getEercContractAddress } from "@/lib/contracts";

export function ConfigBanner() {
  const [circuitsOk, setCircuitsOk] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/circuits/RegistrationCircuit.wasm", { method: "HEAD" })
      .then((r) => setCircuitsOk(r.ok))
      .catch(() => setCircuitsOk(false));
  }, []);

  if (circuitsOk !== false) return null;

  const contract = getEercContractAddress();

  return (
    <div
      className="border-b border-[var(--amber)] bg-[var(--amber-lt)] px-4 py-2 text-center text-[12px] text-[var(--amber)]"
      role="status"
    >
      Faltan circuitos ZK en{" "}
      <code className="font-mono">public/circuits/</code>. Ejecutá{" "}
      <code className="font-mono">npm run circuits:fetch</code> en{" "}
      <code className="font-mono">frontend/</code>. Contrato activo:{" "}
      <code className="font-mono">{contract}</code>
    </div>
  );
}
