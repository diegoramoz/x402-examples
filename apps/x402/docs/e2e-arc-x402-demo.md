# x402 End-to-End Demo (Protocol v2 + Arc Testnet EVM)

This guide walks you through a complete end-to-end x402 demo in this repo using:

- Latest x402 protocol line used here: **v2**
- Arc testnet EVM network: **eip155:5042002**
- Exact payment scheme over EVM (`scheme: exact`)

It is based on the official x402 examples/docs in `.idea/x402`, adapted to your app layout and scripts.

## What this demo proves

1. Your server returns HTTP `402 Payment Required` for a protected endpoint.
2. A client creates a valid x402 payment payload (v2).
3. The server verifies and settles via facilitator.
4. The paid request succeeds and returns content with settlement metadata.

## 0) Current repo wiring (already in place)

You already have the core wiring for Arc:

- Protected endpoint: `apps/x402/app/weather/route.ts`
- Arc network registration and facilitator client: `apps/x402/api/facilitator.ts`
- Arc chain support in app/client config: `apps/x402/wagmi-config.ts` and `apps/x402/api/chains.ts`
- Arc USDC asset constant: `apps/x402/lib/constants.ts`

Important Arc detail in this repo:

- For Arc (`eip155:5042002`), set `asset` explicitly to Arc USDC (`0x3600000000000000000000000000000000000000`) when parsing money. This avoids the facilitator error:
  - `No default asset configured for network eip155:5042002`

## 1) Prerequisites

- Bun installed
- Wallet with Arc testnet USDC and gas (or funding path via your Circle scripts)
- Facilitator API key for your configured facilitator (`https://x402.localhost/v2` in dev, `https://x402.ramoz.dev/v2` in prod)

## 3) Optional: fund wallets on Arc via existing scripts

If you need to provision/fund wallets for the demo, use existing scripts in `apps/x402/scripts`.

From repo root:

```bash
# Create wallet set (one-time)
bun run apps/x402/scripts/create-wallet-set.ts

# Create dev-controlled Arc wallets / register ERC-8004 metadata flow
bun run apps/x402/scripts/create-dev-controlled-wallet.ts

# Transfer Arc USDC (after replacing placeholders in the script)
bun run apps/x402/scripts/send-dev-controlled.ts

# AppKit-based token send on Arc
bun run apps/x402/scripts/send-tokens.ts
```

## 4) Start the app

From repo root:

```bash
bun install
bun run dev:x402
```

Assume local URL:

- `https://examples.localhost`

## 5) Confirm seller side (402 challenge)

Call protected endpoint without payment header:

```bash
curl -i https://examples.localhost/weather
```

Expected:

- Status `402 Payment Required`
- x402 payment challenge in headers/body
- `x402Version` should be `2`
- `accepts` entry should include Arc option:
  - `scheme: exact`
  - `network: eip155:5042002`
  - `payTo`: your configured seller address in `apps/x402/app/weather/route.ts`

## 6) Run buyer side paid request (automatic v2 client flow)

Use this one-file TypeScript client (in-memory) from `apps/x402` so local package resolution is consistent. It follows the official v2 buyer flow from x402 docs, adapted to Arc.

```bash
cd apps/x402

bun -e '
import { x402Client, x402HTTPClient, wrapFetchWithPayment } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

const key = process.env.PRIVATE_KEY;
if (!key) throw new Error("Missing PRIVATE_KEY in env");

const signer = privateKeyToAccount(key);
const client = new x402Client();
registerExactEvmScheme(client, { signer });

const fetchWithPayment = wrapFetchWithPayment(fetch, client);
const response = await fetchWithPayment("https://examples.localhost/weather", { method: "GET" });

console.log("status:", response.status);
console.log("body:", await response.text());

const httpClient = new x402HTTPClient(client);
const settle = httpClient.getPaymentSettleResponse((name) => response.headers.get(name));
console.log("settlement:", settle);
'
```

Expected:

- Status `200`
- Weather JSON body
- Decodable settlement data in `PAYMENT-RESPONSE`

## 7) Manual browser E2E (wallet-connect app flow)

This repo now includes a browser-first manual E2E page that uses your connected
wallet and walks through the full protocol flow in-app:

- connect wallet
- request `/weather` and confirm `402`
- decode and verify signed offers
- generate payment payload from wallet signature
- retry with payment headers
- extract and verify signed receipt

Open:

- `https://examples.localhost/pay/attestation`

Tips:

- switch to Arc testnet in the page before running
- fund the connected wallet with Arc USDC + gas first
- keep the endpoint as `/weather` unless you added another protected route

## 8) Deep verification (optional, but great for learning)

Your repo already includes logic that validates offer/receipt attestations and runs a full two-step payment flow:

- `apps/x402/api/routers/index.ts` in `receiptAttestationRouter.run`

Use that path when you want to inspect:

- signed offers extracted from `PAYMENT-REQUIRED`
- signature checks (EIP-712/JWS depending on offer format)
- receipt extraction + signature verification
- receipt-to-offer matching

## 9) Protocol-v2 checklist

Use this checklist to ensure you are truly on latest protocol in this repo:

- `@x402/*` packages are from major v2 line in `apps/x402/package.json`
- 402 challenge includes `x402Version: 2`
- verification request body uses `x402Version: 2`
- Arc CAIP network ID is `eip155:5042002`
- Arc USDC asset is explicitly set where needed (`0x3600000000000000000000000000000000000000`)

## 10) Common failure modes and fixes

1. `No default asset configured for network eip155:5042002`
- Fix: ensure Arc registration in `apps/x402/api/facilitator.ts` sets `asset: ARC_USDC_ADDRESS` in the money parser.

2. `401/403` from facilitator verify/settle
- Fix: set a valid `FACILITATOR_API_KEY` in `.env`.

3. Payment retries but still returns 402
- Fix: ensure buyer wallet has Arc USDC balance and chain is supported by your facilitator.

4. Env validation fails at startup
- Fix: populate all keys required by `packages/env/finance.ts`.

## 11) Official x402 references used

From your local official checkout at `.idea/x402`:

- `docs/getting-started/quickstart-for-sellers.mdx` (server patterns, `withX402` guidance)
- `docs/getting-started/quickstart-for-buyers.mdx` (buyer payment flow)
- `specs/x402-specification-v2.md` (v2 payloads and fields)
- `examples/typescript/clients/custom/README.md` (manual header/payment flow)

This repo already follows the recommended API-route pattern (`withX402`) for seller endpoints and can be exercised end-to-end on Arc with the steps above.
