import { createConfig, createStorage, http, cookieStorage } from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export function createWagmiConfig(fujiRpcHttpUrl: string) {
  return createConfig({
    chains: [avalancheFuji],
    connectors: [
      injected({
        shimDisconnect: true,
      }),
    ],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [avalancheFuji.id]: http(fujiRpcHttpUrl),
    },
  });
}
