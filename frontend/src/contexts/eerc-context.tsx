"use client";

import {
  type CompatiblePublicClient,
  type CompatibleWalletClient,
  useEERC,
} from "@avalabs/eerc-sdk";
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { avalancheFuji } from "wagmi/chains";

import {
  CIRCUIT_CONFIG,
  resolveConverterToken,
  resolveEercContract,
} from "@/lib/eerc-config";
import { getPublicEnv } from "@/lib/env";
import { loadDecryptionKey, saveDecryptionKey } from "@/lib/decryption-key-storage";

type EercSdk = ReturnType<typeof useEERC>;

type EercContextValue = {
  contractAddress: `0x${string}`;
  env: ReturnType<typeof getPublicEnv>;
  sdk: EercSdk;
  walletConnected: boolean;
  persistDecryptionKey: (key: string) => void;
};

const EercContext = createContext<EercContextValue | null>(null);

export function EercProvider({ children }: { children: ReactNode }) {
  const env = useMemo(() => getPublicEnv(), []);
  const contractAddress = useMemo(() => resolveEercContract(env), [env]);
  const { isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: avalancheFuji.id });
  const { data: walletClient } = useWalletClient();
  const storedKey = useMemo(() => loadDecryptionKey(), []);

  const sdk = useEERC(
    publicClient as CompatiblePublicClient,
    (walletClient ?? publicClient) as CompatibleWalletClient,
    contractAddress,
    CIRCUIT_CONFIG,
    storedKey,
  );

  const value = useMemo<EercContextValue>(
    () => ({
      contractAddress,
      env,
      sdk,
      walletConnected: isConnected,
      persistDecryptionKey: saveDecryptionKey,
    }),
    [contractAddress, env, sdk, isConnected],
  );

  return (
    <EercContext.Provider value={value}>{children}</EercContext.Provider>
  );
}

export function useVeilaEerc(): EercContextValue {
  const ctx = useContext(EercContext);
  if (!ctx) {
    throw new Error("useVeilaEerc debe usarse dentro de <EercProvider>");
  }
  return ctx;
}

export function useEncryptedBalanceHook() {
  const { sdk, env } = useVeilaEerc();
  const token = resolveConverterToken(env);
  return sdk.useEncryptedBalance(token);
}
