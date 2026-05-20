import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { BatchHandlerPlugin } from "@orpc/server/plugins";
import type { NextRequest } from "next/server";
import { createContext } from "@/api/context";
import { appRouter } from "@/api/routers";

const rpcHandler = new RPCHandler(appRouter, {
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
	plugins: [new BatchHandlerPlugin()],
});

async function handleRequest(req: NextRequest) {
	const context = await createContext(req);

	const rpcResult = await rpcHandler.handle(req, {
		prefix: "/rpc",
		context,
	});

	if (rpcResult.response) {
		return rpcResult.response;
	}

	return new Response("Not found", { status: 404 });
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
