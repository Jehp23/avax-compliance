import { createConfig, createStorage, http, cookieStorage } from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import { injected } from "wagmi/connectors";

import { getPublicEnv } from "@/lib/env";

const fujiRpc = getPublicEnv().fujiRpc;

export const wagmiConfig = createConfig({
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
    [avalancheFuji.id]: http(fujiRpc),
  },
});
