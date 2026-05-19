import { env } from "@ramoz/env/finance";
import { HTTPFacilitatorClient, x402ResourceServer } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import type { SupportedChainCAIP2 } from "@/api/chains";
import { ARC_USDC_ADDRESS } from "@/lib/constants";

const PROD_X402_FACILITATOR_BASE_URL = "https://x402.ramoz.dev/v2";
const DEV_X402_FACILITATOR_BASE_URL = "https://x402.localhost/v2";

export const X402_FACILITATOR_BASE_URL =
	env.NODE_ENV === "production"
		? PROD_X402_FACILITATOR_BASE_URL
		: DEV_X402_FACILITATOR_BASE_URL;

export const facilitatorClient = new HTTPFacilitatorClient({
	url: X402_FACILITATOR_BASE_URL,
	createAuthHeaders: async () => ({
		verify: { Authorization: `Bearer ${env.FACILITATOR_API_KEY}` },
		settle: { Authorization: `Bearer ${env.FACILITATOR_API_KEY}` },
		supported: {},
	}),
});

// Create x402 resource server
export const x402Server = new x402ResourceServer(facilitatorClient);

// Register schemes
x402Server.register(
	"eip155:5042002" satisfies SupportedChainCAIP2,
	new ExactEvmScheme().registerMoneyParser(async (amount) => ({
		amount: BigInt(Math.round(amount * 1e18)).toString(),
		// FIXES (Error: No default asset configured for network eip155:5042002)
		asset: ARC_USDC_ADDRESS,
		extra: { token: "USDC" },
	}))
);
x402Server.register(
	"eip155:8453" satisfies SupportedChainCAIP2,
	new ExactEvmScheme()
);
x402Server.register(
	"eip155:84532" satisfies SupportedChainCAIP2,
	new ExactEvmScheme()
);
