"use client";

import { useDisconnect, useEnsName } from "wagmi";

export function Connection({ address }: { address?: `0x${string}` }) {
	const { disconnect } = useDisconnect();
	const { data: ensName } = useEnsName({ address });

	return (
		<div>
			{address && <div>{ensName ? `${ensName} (${address})` : address}</div>}
			<button onClick={() => disconnect()} type="button">
				Disconnect
			</button>
		</div>
	);
}
