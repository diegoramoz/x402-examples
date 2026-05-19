import Link from "next/link";
import Pay from "./pay";

export default function PayPage() {
	return (
		<div className="space-y-4">
			<div className="mx-auto w-full max-w-xl px-4 pt-4">
				<Link
					className="text-blue-600 text-sm underline"
					href="/pay/attestation"
				>
					Open Browser E2E Receipt Attestation
				</Link>
			</div>
			<Pay />
		</div>
	);
}
