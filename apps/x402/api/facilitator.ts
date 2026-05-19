import { env } from "@ramoz/env/finance";
import { HTTPFacilitatorClient } from "@x402/core/server";

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
