"use client";

import { useAccount } from "wagmi";
import { avalancheFuji } from "wagmi/chains";

import { useCelloEerc } from "@/contexts/eerc-context";
import { useMyInstitution } from "@/hooks/use-my-institution";
import { isAvaxPaymentMode } from "@/lib/payment-asset";
import { shortAddress } from "@/lib/format-address";

export function WalletStatus() {
  const { address, isConnected, chainId } = useAccount();
  const { sdk, hasDecryptionKey } = useCelloEerc();
  const { approved } = useMyInstitution(address);
  const avaxMode = isAvaxPaymentMode();

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
    avaxMode
      ? {
          key: "Institución",
          value: approved ? "registrada" : "pendiente",
          ok: approved,
        }
      : {
          key: "eERC",
          value: sdk.isRegistered ? "registrado" : "pendiente",
          ok: sdk.isRegistered,
        },
    ...(avaxMode
      ? []
      : [
          {
            key: "Clave ZK",
            value: hasDecryptionKey ? "en sesión" : "falta",
            ok: hasDecryptionKey,
          },
        ]),
  ];

  return (
    <div className="panel">
      <p className="panel-label">Estado</p>
      <ul className="stat-list">
        {rows.map((row) => (
          <li key={row.key} className="stat-row">
            <span className="stat-key">{row.key}</span>
            <span className={`stat-val ${row.ok ? "ok" : "warn"}`}>{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
