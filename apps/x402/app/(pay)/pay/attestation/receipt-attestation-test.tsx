"use client";

import { useState } from "react";
import { orpc } from "@/utils/orpc";

type ReceiptAttestationResponse = {
	success: boolean;
	error?: string;
	url?: string;
	steps?: Array<{
		step: string;
		ok: boolean;
		detail: unknown;
	}>;
	offers?: unknown;
	selectedOffer?: unknown;
	paymentSettleResponse?: unknown;
	paidResponse?: unknown;
	receipt?: unknown;
	proofs?: unknown;
	message?: string;
};

export function ReceiptAttestationTest() {
	const [endpointPath, setEndpointPath] = useState("/weather");
	const [isRunning, setIsRunning] = useState(false);
	const [response, setResponse] = useState<ReceiptAttestationResponse | null>(
		null
	);
	const [requestError, setRequestError] = useState<string | null>(null);

	const runTest = async () => {
		setIsRunning(true);
		setRequestError(null);
		setResponse(null);

		try {
			const body = await orpc.receiptAttestation.run();
			setResponse(body);
		} catch (error) {
			setRequestError(
				error instanceof Error
					? error.message
					: "Failed to run attestation test."
			);
		} finally {
			setIsRunning(false);
		}
	};

	return (
		<div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6">
			<h1 className="font-semibold text-2xl">
				x402 Receipt Attestation Test (EVM)
			</h1>
			<p className="text-gray-700 text-sm">
				This example ports the architecture of your receipt attestation client
				flow for facilitator testing in-app: request 402, decode and verify
				signed offers, pay, extract signed receipt, and verify receipt.
			</p>

			<div className="grid gap-3 rounded border border-gray-200 p-4 md:grid-cols-2">
				<label className="flex flex-col gap-1">
					<span className="font-medium text-sm">Endpoint Path</span>
					<input
						className="rounded border border-gray-300 px-3 py-2"
						onChange={(event) => setEndpointPath(event.target.value)}
						value={endpointPath}
					/>
				</label>
			</div>

			<button
				className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
				disabled={isRunning}
				onClick={runTest}
				type="button"
			>
				{isRunning ? "Running test..." : "Run Receipt Attestation Test"}
			</button>

			{requestError && (
				<div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm">
					{requestError}
				</div>
			)}

			{response && (
				<div className="space-y-3 rounded border border-gray-200 p-4">
					<div className="flex flex-wrap items-center gap-2">
						<span className="font-medium text-sm">Result:</span>
						<span
							className={`rounded px-2 py-1 text-xs ${
								response.success
									? "bg-green-100 text-green-800"
									: "bg-red-100 text-red-800"
							}`}
						>
							{response.success ? "SUCCESS" : "FAILED"}
						</span>
						{response.url && (
							<span className="text-gray-600 text-xs">
								Target: {response.url}
							</span>
						)}
					</div>

					{response.error && (
						<div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm">
							{response.error}
						</div>
					)}

					{response.message && (
						<div className="rounded border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
							{response.message}
						</div>
					)}

					{response.steps && response.steps.length > 0 && (
						<div className="space-y-2">
							<h2 className="font-medium text-sm">Flow Steps</h2>
							<ul className="space-y-2">
								{response.steps.map((stepResult) => (
									<li
										className="rounded border border-gray-200 bg-gray-50 p-3"
										key={stepResult.step}
									>
										<div className="flex items-center gap-2">
											<span className="font-medium text-sm">
												{stepResult.step}
											</span>
											<span
												className={`rounded px-2 py-1 text-xs ${
													stepResult.ok
														? "bg-green-100 text-green-800"
														: "bg-red-100 text-red-800"
												}`}
											>
												{stepResult.ok ? "OK" : "FAILED"}
											</span>
										</div>
										<pre className="mt-2 overflow-auto rounded bg-white p-2 text-xs">
											{JSON.stringify(stepResult.detail, null, 2)}
										</pre>
									</li>
								))}
							</ul>
						</div>
					)}

					<details>
						<summary className="cursor-pointer font-medium text-sm">
							Raw response
						</summary>
						<pre className="mt-2 overflow-auto rounded bg-gray-950 p-3 text-green-300 text-xs">
							{JSON.stringify(response, null, 2)}
						</pre>
					</details>
				</div>
			)}
		</div>
	);
}
