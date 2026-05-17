"use client";

import {
  type CompatiblePublicClient,
  type CompatibleWalletClient,
  useEERC,
} from "@avalabs/eerc-sdk";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { avalancheFuji } from "wagmi/chains";

import {
  circuitUrlsWithAppOrigin,
  resolveConverterToken,
  resolveEercContract,
} from "@/lib/eerc-config";
import { getPublicEnv } from "@/lib/env";
import {
  loadDecryptionKey,
  saveDecryptionKey,
} from "@/lib/decryption-key-storage";

type EercSdk = ReturnType<typeof useEERC>;

type EercContextValue = {
  contractAddress: `0x${string}`;
  env: ReturnType<typeof getPublicEnv>;
  sdk: EercSdk;
  walletConnected: boolean;
  hasDecryptionKey: boolean;
  /** false hasta hidratar sessionStorage (evita mismatch React #418). */
  sessionReady: boolean;
  persistDecryptionKey: (key: string) => void;
  refreshDecryptionKey: () => void;
};

const EercContext = createContext<EercContextValue | null>(null);

type SdkRuntimeProps = {
  appOrigin: string;
  circuitOrigin: string;
  decryptionKey: string | undefined;
  sessionReady: boolean;
  contractAddress: `0x${string}`;
  env: ReturnType<typeof getPublicEnv>;
  isConnected: boolean;
  persistDecryptionKey: (key: string) => void;
  refreshDecryptionKey: () => void;
  children: ReactNode;
};

function EercSdkRuntime({
  appOrigin,
  circuitOrigin,
  decryptionKey,
  sessionReady,
  contractAddress,
  env,
  isConnected,
  persistDecryptionKey,
  refreshDecryptionKey,
  children,
}: SdkRuntimeProps) {
  const publicClient = usePublicClient({ chainId: avalancheFuji.id });
  const { data: walletClient } = useWalletClient();

  const circuitUrls = useMemo(
    () => circuitUrlsWithAppOrigin(circuitOrigin),
    [circuitOrigin],
  );

  const sdk = useEERC(
    publicClient as CompatiblePublicClient,
    (walletClient ?? publicClient) as CompatibleWalletClient,
    contractAddress,
    circuitUrls,
    decryptionKey,
  );

  const value = useMemo<EercContextValue>(
    () => ({
      contractAddress,
      env,
      sdk,
      walletConnected: isConnected,
      hasDecryptionKey: Boolean(decryptionKey),
      sessionReady,
      persistDecryptionKey,
      refreshDecryptionKey,
    }),
    [
      contractAddress,
      env,
      sdk,
      isConnected,
      decryptionKey,
      sessionReady,
      persistDecryptionKey,
      refreshDecryptionKey,
    ],
  );

  return <EercContext.Provider value={value}>{children}</EercContext.Provider>;
}

export function EercProvider({
  children,
  appOrigin,
}: {
  children: ReactNode;
  appOrigin: string;
}) {
  const env = useMemo(() => getPublicEnv(), []);
  const contractAddress = useMemo(() => resolveEercContract(env), [env]);
  const { isConnected, address } = useAccount();

  const [circuitOrigin, setCircuitOrigin] = useState(appOrigin);
  useLayoutEffect(() => {
    const live = window.location.origin;
    setCircuitOrigin(live !== appOrigin ? live : appOrigin);
  }, [appOrigin]);

  const [decryptionKey, setDecryptionKey] = useState<string | undefined>(
    undefined,
  );
  const [sessionReady, setSessionReady] = useState(false);

  useLayoutEffect(() => {
    if (!address) {
      setDecryptionKey(undefined);
      setSessionReady(true);
      return;
    }
    setDecryptionKey(loadDecryptionKey(address, contractAddress));
    setSessionReady(true);
  }, [address, contractAddress]);

  useEffect(() => {
    const sync = () => {
      if (!address) return;
      const stored = loadDecryptionKey(address, contractAddress);
      setDecryptionKey(stored);
    };
    window.addEventListener("focus", sync);
    window.addEventListener("cello-session-updated", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("cello-session-updated", sync);
    };
  }, [address, contractAddress]);

  const persistDecryptionKey = useCallback(
    (key: string) => {
      if (address) {
        saveDecryptionKey(key, address, contractAddress);
      } else {
        saveDecryptionKey(key);
      }
      setDecryptionKey(key);
    },
    [address, contractAddress],
  );

  const refreshDecryptionKey = useCallback(() => {
    if (!address) {
      setDecryptionKey(undefined);
      return;
    }
    setDecryptionKey(loadDecryptionKey(address, contractAddress));
  }, [address, contractAddress]);

  return (
    <EercSdkRuntime
      key={decryptionKey ?? "__no-key__"}
      appOrigin={appOrigin}
      circuitOrigin={circuitOrigin}
      decryptionKey={decryptionKey}
      sessionReady={sessionReady}
      contractAddress={contractAddress}
      env={env}
      isConnected={isConnected}
      persistDecryptionKey={persistDecryptionKey}
      refreshDecryptionKey={refreshDecryptionKey}
    >
      {children}
    </EercSdkRuntime>
  );
}

export function useCelloEerc(): EercContextValue {
  const ctx = useContext(EercContext);
  if (!ctx) {
    throw new Error("useCelloEerc debe usarse dentro de <EercProvider>");
  }
  return ctx;
}

export function useEncryptedBalanceHook() {
  const { sdk, env } = useCelloEerc();
  const token = resolveConverterToken(env);
  return sdk.useEncryptedBalance(token);
}
