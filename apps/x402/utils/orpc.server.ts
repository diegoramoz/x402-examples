import "server-only";

import { createRouterClient } from "@orpc/server";
import { auth } from "@ramoz/auth";
import { headers } from "next/headers";
import { appRouter } from "@/api/routers";

export const orpc = createRouterClient(appRouter, {
	context: async () => {
		const headers_ = await headers();
		return {
			auth: null,
			session: await auth.api.getSession({ headers: headers_ }),
		};
	},
});

globalThis.$client = orpc;
