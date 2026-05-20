import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

const MOCK_ASSET = "0x3600000000000000000000000000000000000000";
const MOCK_PAY_TO = "0xD844ba11F64d23a7481E24474D2f184e350B9B3d";
const DEFAULT_NETWORK = "eip155:5042002";
const EIP155_NETWORK_REGEX = /^eip155:\d+$/;
const INTEGER_REGEX = /^\d+$/;

type MockPaymentRequirements = {
	scheme: "exact";
	network: `eip155:${number}`;
	asset: `0x${string}`;
	amount: string;
	payTo: `0x${string}`;
	maxTimeoutSeconds: number;
};

type MockChallengeBody = {
	error: "x402_payment_required";
	message: string;
	paymentRequirements: MockPaymentRequirements;
};

type MockPaidBody = {
	ok: true;
	source: "mock-402-simulator";
	data: {
		city: string;
		temperatureC: number;
		condition: string;
	};
};

function toNetwork(value: string | null): `eip155:${number}` {
	if (!value) {
		return DEFAULT_NETWORK;
	}

	if (EIP155_NETWORK_REGEX.test(value)) {
		return value as `eip155:${number}`;
	}

	if (INTEGER_REGEX.test(value)) {
		const numericChainId = Number.parseInt(value, 10);
		return `eip155:${numericChainId}`;
	}

	return DEFAULT_NETWORK;
}

function getPaymentProof(request: Request): string | null {
	const candidateHeaders = [
		"x-payment-response",
		"payment-response",
		"x-payment",
		"payment",
		"authorization",
	];

	for (const name of candidateHeaders) {
		const value = request.headers.get(name);
		if (value) {
			return value;
		}
	}

	return null;
}

function buildMockChallenge(network: `eip155:${number}`): MockChallengeBody {
	return {
		error: "x402_payment_required",
		message: "Payment required for GET /pay-here",
		paymentRequirements: {
			scheme: "exact",
			network,
			asset: MOCK_ASSET,
			amount: "1000000",
			payTo: MOCK_PAY_TO,
			maxTimeoutSeconds: 60,
		},
	};
}

function txHashFromPaymentProof(paymentProof: string): `0x${string}` {
	const digest = createHash("sha256").update(paymentProof).digest("hex");
	return `0x${digest}`;
}

function buildMockPaidResponse(): MockPaidBody {
	return {
		ok: true,
		source: "mock-402-simulator",
		data: {
			city: "San Francisco",
			temperatureC: 17,
			condition: "Foggy",
		},
	};
}

export function GET(request: Request) {
	const network = toNetwork(request.headers.get("x-chain-id"));
	const paymentProof = getPaymentProof(request);

	if (!paymentProof) {
		return NextResponse.json(buildMockChallenge(network), {
			status: 402,
			headers: {
				"x-mock-flow": "challenge",
				"x-mock-step": "1",
				"cache-control": "no-store",
			},
		});
	}

	const txHash = txHashFromPaymentProof(paymentProof);

	return NextResponse.json(buildMockPaidResponse(), {
		status: 200,
		headers: {
			"x-mock-flow": "settled",
			"x-mock-step": "3",
			"x-payment-transaction": txHash,
			"cache-control": "no-store",
		},
	});
}
