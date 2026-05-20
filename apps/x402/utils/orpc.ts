import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { BatchLinkPlugin } from "@orpc/client/plugins";
import type { RouterClient } from "@orpc/server";
import type { appRouter } from "@/api/routers";

declare global {
	var $client: RouterClient<typeof appRouter> | undefined;
}

const link = new RPCLink({
	url: `${typeof window === "undefined" ? "https://x402.localhost" : window.location.origin}/rpc`,
	plugins: [
		new BatchLinkPlugin({
			exclude: ({ path }) => path[0] === "sse",
			groups: [
				{
					condition: () => true,
					context: {},
				},
			],
		}),
	],
});

/**
 * Fallback to client-side client if server-side client is not available.
 */
export const orpc: RouterClient<typeof appRouter> =
	globalThis.$client ?? createORPCClient(link);
