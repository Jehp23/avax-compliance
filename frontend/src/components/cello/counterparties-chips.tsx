"use client";

import type { InstitutionRow } from "@/hooks/use-approved-institutions";
import { shortAddress } from "@/lib/format-address";

type CounterpartiesChipsProps = {
  institutions: InstitutionRow[];
  loading: boolean;
  onSelect: (address: `0x${string}`) => void;
};

export function CounterpartiesChips({
  institutions,
  loading,
  onSelect,
}: CounterpartiesChipsProps) {
  if (loading) {
    return (
      <p className="cp-chips-hint" role="status">
        Cargando instituciones…
      </p>
    );
  }

  if (institutions.length === 0) {
    return (
      <p className="cp-chips-hint">
        Pegá la dirección <span className="font-mono">0x…</span> del destinatario
        (debe estar registrado en Cello).
      </p>
    );
  }

  return (
    <div className="cp-chips" role="list" aria-label="Instituciones verificadas">
      {institutions.map((cp) => (
        <button
          key={cp.walletAddress}
          type="button"
          className="cp-chip"
          role="listitem"
          onClick={() => onSelect(cp.walletAddress as `0x${string}`)}
        >
          <span className="cp-chip-av" aria-hidden>
            {cp.initials}
          </span>
          <span className="cp-chip-name">{cp.name}</span>
          <span className="cp-chip-addr">
            {shortAddress(cp.walletAddress as `0x${string}`)}
          </span>
        </button>
      ))}
    </div>
  );
}
