import { auth } from "@ramoz/auth";
import { declareDiscoveryExtension } from "@x402/extensions/bazaar";
import { paymentProxy } from "@x402/next";
import { createPaywall, evmPaywall } from "@x402/paywall";
import { type NextRequest, NextResponse } from "next/server";
import type { SupportedChainCAIP2 } from "@/api/chains";
import { x402Server } from "@/api/facilitator";
import { SELLER_ADDRESS } from "@/lib/constants";

const PUBLIC_ROUTES = [
	"/login",
	"/signup",
	"/forgot-password",
	"/reset-password",
	"/verify-email",
	"/weather",
	"/protected", // Allow direct access to /protected for payment proxy to handle
];

const PUBLIC_METADATA_ROUTES = ["/manifest.webmanifest", "/opengraph-image"];

// Build paywall
export const paywall = createPaywall()
	.withNetwork(evmPaywall)
	.withConfig({
		appName: "Next x402 Demo",
		appLogo: "/x402-icon-blue.png",
		testnet: true,
	})
	.build();

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const isV2Route = pathname === "/v2" || pathname.startsWith("/v2/");

	if (pathname.startsWith("/protected")) {
		const payment = paymentProxy(
			{
				"/protected": {
					accepts: [
						{
							scheme: "exact",
							price: "$0.001",
							network: "eip155:5042002" as SupportedChainCAIP2,
							payTo: SELLER_ADDRESS,
						},
					],
					description: "Premium music: x402 Remix",
					mimeType: "text/html",
					extensions: {
						...declareDiscoveryExtension({}),
					},
				},
			},
			x402Server,
			undefined, // paywallConfig (using custom paywall instead)
			paywall // custom paywall provider
		);

		return payment(request);
	}

	const isPublic =
		isV2Route ||
		PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) ||
		PUBLIC_METADATA_ROUTES.some((route) => pathname.endsWith(route));

	if (isPublic) {
		return NextResponse.next();
	}

	const session = await auth.api.getSession({
		headers: request.headers,
	});

	if (!session) {
		const loginUrl = new URL("/login", request.url);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest)$).*)",
	],
};
