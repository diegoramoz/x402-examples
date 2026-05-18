"use client";

import React from "react";
import { type Connector, useConnect, useConnectors } from "wagmi";

export function WalletOptions() {
	const connect = useConnect();
	const connectors = useConnectors();

	return connectors.map((connector) => (
		<WalletOption
			connector={connector}
			key={connector.uid}
			onClick={() => connect.mutate({ connector })}
		/>
	));
}

function WalletOption({
	connector,
	onClick,
}: {
	connector: Connector;
	onClick: () => void;
}) {
	const [ready, setReady] = React.useState(false);

	React.useEffect(() => {
		(async () => {
			const provider = await connector.getProvider();
			setReady(!!provider);
		})();
	}, [connector]);

	return (
		<button disabled={!ready} onClick={onClick} type="button">
			{connector.name}
		</button>
	);
}
