import type { RouterClient } from "@orpc/server";
import { db } from "@ramoz/db";
import {
	insertUserSchema,
	user as userTable,
	wallet as walletTable,
} from "@ramoz/db/schema";
import { env } from "@ramoz/env/finance";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { protectedProcedure } from "@/api";
import {
	facilitatorClient,
	X402_FACILITATOR_BASE_URL,
} from "@/api/facilitator";
import {
	x402VerifyRequestBodySchema,
	x402VerifyResponseSchema,
} from "@/api/schemas";

// export const appRouter = {
// 	healthCheck: publicProcedure.handler(() => {
// 		return "OK";
// 	}),
// 	privateData: protectedProcedure.handler(({ context }) => {
// 		return {
// 			message: "This is private",
// 			user: context.session?.user,
// 		};
// 	}),
// };

export const facilitatorRouter = {
	// supportedWithClient: protectedProcedure.handler(async () => {
	// 	const supported = (await facilitatorClient.getSupported()) as unknown;
	// 	return { supported };
	// }),

	supportedWithFetch: protectedProcedure.handler(async () => {
		const response = await fetch(`${X402_FACILITATOR_BASE_URL}/supported`, {
			method: "GET",
			headers: { Accept: "application/json" },
		});

		if (!response.ok) {
			throw new Error(
				`Facilitator fetch failed with status ${response.status}`
			);
		}

		const supported = (await response.json()) as unknown;
		return { supported };
	}),

	verifyWithClient: protectedProcedure
		.input(x402VerifyRequestBodySchema)
		.handler(async ({ input }) => {
			const response = (await facilitatorClient.verify(
				input.paymentPayload,
				input.paymentRequirements
			)) as unknown;

			const parsed = x402VerifyResponseSchema.safeParse(response);

			if (parsed.success === false) {
				throw new Error(
					`Invalid response body: ${JSON.stringify(parsed.error.format())}`
				);
			}
			return parsed.data;
		}),

	verifyWithFetch: protectedProcedure
		.input(x402VerifyRequestBodySchema)
		.handler(async ({ input }) => {
			const response = await fetch(`${X402_FACILITATOR_BASE_URL}/verify`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Authorization: `Bearer ${env.FACILITATOR_API_KEY}`,
				},
				body: JSON.stringify({
					x402Version: 2,
					paymentPayload: input.paymentPayload,
					paymentRequirements: input.paymentRequirements,
				}),
			});

			const parsed = x402VerifyResponseSchema.safeParse(response);

			if (parsed.success === false) {
				throw new Error(
					`Invalid request body: ${JSON.stringify(parsed.error.format())}`
				);
			}

			return parsed.data;
		}),
};

const userRouter = {
	create: protectedProcedure
		.input(
			insertUserSchema.omit({ updatedAt: true, createdAt: true, nanoId: true })
		)
		.handler(async ({ input }) => {
			const [user] = await db.insert(userTable).values(input).returning();
			if (!user) {
				throw new Error("Failed to create user");
			}
			return { user };
		}),

	list: protectedProcedure.handler(
		async () => await db.select().from(userTable).orderBy(userTable.createdAt)
	),

	get: protectedProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const [user] = await db
				.select()
				.from(userTable)
				.where(eq(userTable.nanoId, input.id));
			if (!user) {
				throw new Error("User not found");
			}
			// Fetch associated wallet if exists
			const [userWallet] = await db
				.select()
				.from(walletTable)
				.where(eq(walletTable.userId, user.id));

			return { user, wallet: userWallet || null };
		}),

	updateEmail: protectedProcedure
		.input(z.object({ email: z.email() }))
		.handler(async ({ input }) => {
			const [firstUser] = await db.select().from(userTable).limit(1);
			if (!firstUser) {
				throw new Error("No user found");
			}
			const [updated] = await db
				.update(userTable)
				.set({ email: input.email })
				.where(eq(userTable.id, firstUser.id))
				.returning();
			if (!updated) {
				throw new Error("Failed to update email");
			}
			return { user: updated };
		}),
};

const walletRouter = {
	// Get current user's wallet
	get: protectedProcedure.handler(async ({ context }) => {
		if (!context.session?.user) {
			throw new Error("No session");
		}
		const [wallet] = await db
			.select()
			.from(walletTable)
			.where(eq(walletTable.userId, BigInt(context.session.user.id)));
		return { wallet: wallet || null };
	}),

	// Get wallet by user ID (admin use case)
	getByUserId: protectedProcedure
		.input(z.object({ userId: z.bigint() }))
		.handler(async ({ input }) => {
			const [wallet] = await db
				.select()
				.from(walletTable)
				.where(eq(walletTable.userId, input.userId));
			return { wallet: wallet || null };
		}),
};

type AppRouterShape = {
	user: typeof userRouter;
	wallet: typeof walletRouter;
	facilitator: typeof facilitatorRouter;
};

export const appRouter: AppRouterShape = {
	user: userRouter,
	wallet: walletRouter,
	facilitator: facilitatorRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
