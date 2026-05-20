import { declareDiscoveryExtension } from "@x402/extensions/bazaar";
import { withX402 } from "@x402/next";
import { createPaywall } from "@x402/paywall";
import { evmPaywall } from "@x402/paywall/evm";
import { type NextRequest, NextResponse } from "next/server";
import type { SupportedChainCAIP2 } from "@/api/chains";
import { x402Server } from "@/api/facilitator";
import { CLIENT_ADDRESS } from "@/lib/constants";

// Build paywall
export const paywall = createPaywall()
	.withNetwork(evmPaywall)
	.withConfig({
		appName: "Next x402 Demo",
		appLogo: "/x402-icon-blue.png",
		testnet: true,
	})
	.build();

/**
 * Weather API endpoint handler
 *
 * This handler returns weather data after payment verification.
 * Payment is only settled after a successful response (status < 400).
 *
 * @param _ - Incoming Next.js request
 * @returns JSON response with weather data
 */
const handler = async (_: NextRequest) =>
	NextResponse.json(
		{
			report: {
				weather: "sunny",
				temperature: 72,
			},
		},
		{ status: 200 }
	);

/**
 * Protected weather API endpoint using withX402 wrapper
 *
 * This demonstrates the v2 withX402 wrapper for individual API routes.
 * Unlike middleware, withX402 guarantees payment settlement only after
 * the handler returns a successful response (status < 400).
 */
export const GET = withX402(
	handler,
	{
		accepts: [
			{
				scheme: "exact",
				price: "$0.001",
				network: "eip155:5042002" satisfies SupportedChainCAIP2,
				payTo: CLIENT_ADDRESS,
			},
		],
		description: "Access to weather API",
		mimeType: "application/json",
		extensions: {
			...declareDiscoveryExtension({
				output: {
					example: {
						report: {
							weather: "sunny",
							temperature: 72,
						},
					},
				},
			}),
		},
	},
	x402Server,
	undefined, // paywallConfig (using custom paywall from proxy.ts)
	paywall
);
