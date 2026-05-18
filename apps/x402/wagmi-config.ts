import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { arcTestnet, base, baseSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const chains = [base, baseSepolia, arcTestnet] as const;

const config = createConfig({
	chains,
	connectors: [injected()],
	storage: createStorage({
		storage: cookieStorage,
	}),
	ssr: true,
	transports: {
		[base.id]: http(),
		[baseSepolia.id]: http(),
		[arcTestnet.id]: http(),
	},
});

export function getConfig() {
	return config;
}
