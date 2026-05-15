"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { avalancheFuji } from "wagmi/chains";

import { shortAddress } from "@/lib/format-address";

export function WalletButton() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();

  const injected = connectors.find((c) => c.id === "injected");

  if (!isConnected || !address) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          className="wallet-pill"
          disabled={isPending || !injected}
          onClick={() => injected && connect({ connector: injected })}
        >
          <span className="w-dot" aria-hidden />
          {isPending ? "Conectando…" : "Conectar wallet"}
        </button>
        {error ? (
          <span className="max-w-[220px] text-right text-[10px] text-[var(--red)]">
            {error.message}
          </span>
        ) : null}
      </div>
    );
  }

  const wrongNetwork = chainId !== avalancheFuji.id;

  return (
    <div className="flex flex-col items-end gap-1">
      <button type="button" className="wallet-pill" onClick={() => disconnect()}>
        <span className="w-dot" aria-hidden />
        {shortAddress(address)}
      </button>
      {wrongNetwork ? (
        <button
          type="button"
          className="rounded-md border border-[var(--amber)] bg-[var(--amber-lt)] px-2 py-1 text-[10px] font-medium text-[var(--amber)]"
          disabled={switching}
          onClick={() => switchChain({ chainId: avalancheFuji.id })}
        >
          {switching ? "Cambiando…" : "Usar Avalanche Fuji"}
        </button>
      ) : null}
    </div>
  );
}
