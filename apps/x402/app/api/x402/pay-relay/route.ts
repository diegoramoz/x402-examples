import { NextResponse } from "next/server";
import { X402_FACILITATOR_BASE_URL } from "@/api/facilitator";

type RelayRequestBody = {
	url?: string;
	headers?: Record<string, string>;
};

const ALLOWED_HOSTS = new Set([
	"localhost",
	"examples.localhost",
	"x402.localhost",
]);

export async function POST(request: Request) {
	let body: RelayRequestBody;

	try {
		body = (await request.json()) as RelayRequestBody;
	} catch {
		return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
	}
	let parsedUrl: URL;
	try {
		parsedUrl = new URL(X402_FACILITATOR_BASE_URL);
	} catch {
		return NextResponse.json({ error: "Invalid url." }, { status: 400 });
	}

	if (!ALLOWED_HOSTS.has(parsedUrl.hostname)) {
		return NextResponse.json(
			{ error: `Host not allowed: ${parsedUrl.hostname}` },
			{ status: 400 }
		);
	}

	let upstreamResponse: Response;
	try {
		upstreamResponse = await fetch(X402_FACILITATOR_BASE_URL, {
			method: "GET",
			headers: body.headers ?? {},
		});
	} catch (error) {
		return NextResponse.json(
			{
				error: "Relay request failed.",
				detail: error instanceof Error ? error.message : String(error),
			},
			{ status: 502 }
		);
	}

	const responseBody = await upstreamResponse.text();
	const response = new NextResponse(responseBody, {
		status: upstreamResponse.status,
		headers: {
			"Content-Type":
				upstreamResponse.headers.get("Content-Type") ?? "text/plain",
		},
	});

	const passthroughHeaders = [
		"PAYMENT-RESPONSE",
		"X-PAYMENT-RESPONSE",
		"PAYMENT-REQUIRED",
		"X-PAYMENT-REQUIRED",
		"X402-RECEIPT",
		"X-X402-RECEIPT",
	];

	for (const headerName of passthroughHeaders) {
		const value = upstreamResponse.headers.get(headerName);
		if (value) {
			response.headers.set(headerName, value);
		}
	}

	return response;
}
