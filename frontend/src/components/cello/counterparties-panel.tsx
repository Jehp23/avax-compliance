"use client";

import Link from "next/link";

import type { InstitutionRow } from "@/hooks/use-approved-institutions";
import { shortAddress } from "@/lib/format-address";

type CounterpartiesPanelProps = {
  institutions: InstitutionRow[];
  loading: boolean;
  onSelect: (address: `0x${string}`) => void;
};

export function CounterpartiesPanel({
  institutions,
  loading,
  onSelect,
}: CounterpartiesPanelProps) {
  return (
    <aside className="right" aria-label="Directorio de contrapartes">
      <div className="panel panel--directory">
        <p className="panel-label">Instituciones verificadas</p>
        <p className="panel-hint">
          Entidades habilitadas para recibir operaciones en Fuji.
        </p>
        <div className="cp-list">
          {loading ? (
            <p className="cp-empty" role="status">
              Actualizando directorio…
            </p>
          ) : institutions.length === 0 ? (
            <div className="cp-empty" role="status">
              <p className="cp-empty-title">Sin contrapartes adicionales</p>
              <p className="cp-empty-text">
                Cuando otra institución complete el onboarding, aparecerá en
                esta lista para seleccionarla como destino.
              </p>
            </div>
          ) : (
            institutions.map((cp) => (
              <button
                key={cp.walletAddress}
                type="button"
                className="cp"
                onClick={() => onSelect(cp.walletAddress as `0x${string}`)}
              >
                <span className="cp-av" aria-hidden>
                  {cp.initials}
                </span>
                <span className="cp-body">
                  <span className="cp-name">{cp.name}</span>
                  <span className="cp-addr">
                    {shortAddress(cp.walletAddress as `0x${string}`)}
                  </span>
                </span>
                <span className="kyc-dot" title="Institución verificada" />
              </button>
            ))
          )}
        </div>
      </div>
      <p className="panel-foot">
        <Link href="/recibir" className="panel-foot-link">
          Dirección para cobros entrantes
        </Link>
      </p>
    </aside>
  );
}
