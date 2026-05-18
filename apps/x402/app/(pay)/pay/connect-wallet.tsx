"use client";

import { Connection } from "@/app/(pay)/pay/connection";
import { WalletOptions } from "@/app/(pay)/pay/wallet-options";

export function ConnectWallet({
	address,
	isConnected,
}: {
	address?: `0x${string}`;
	isConnected: boolean;
}) {
	if (isConnected) {
		return <Connection address={address} />;
	}
	return <WalletOptions />;
}
