"use client";

import { useAccount } from "wagmi";
import { avalancheFuji } from "wagmi/chains";

import { useVeilaEerc } from "@/contexts/eerc-context";
import { shortAddress } from "@/lib/format-address";

export function WalletStatus() {
  const { address, isConnected, chainId } = useAccount();
  const { sdk } = useVeilaEerc();

  const rows = [
    {
      key: "Wallet",
      value: isConnected ? "conectada" : "desconectada",
      ok: isConnected,
    },
    {
      key: "Cuenta",
      value: address ? shortAddress(address) : "—",
      ok: Boolean(address),
    },
    {
      key: "Red",
      value: chainId === avalancheFuji.id ? "Fuji" : "incorrecta",
      ok: chainId === avalancheFuji.id,
    },
    {
      key: "eERC",
      value: sdk.isRegistered ? "registrado" : "pendiente",
      ok: sdk.isRegistered,
    },
  ];

  return (
    <div className="panel">
      <p className="panel-label">Estado</p>
      <dl className="stat-list">
        {rows.map((row) => (
          <div key={row.key} className="stat-row">
            <dt className="stat-key">{row.key}</dt>
            <dd className={`stat-val ${row.ok ? "ok" : "warn"}`}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
