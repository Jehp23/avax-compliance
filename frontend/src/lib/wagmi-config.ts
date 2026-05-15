import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const fujiRpc =
  process.env.NEXT_PUBLIC_AVALANCHE_FUJI_RPC ??
  "https://api.avax-test.network/ext/bc/C/rpc";

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
