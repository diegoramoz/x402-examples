export default function ProtectedPage() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="mx-auto max-w-2xl p-8">
				<h1 className="mb-4 font-bold text-4xl">Protected Content</h1>
				<p className="text-lg">
					Your payment was successful! Enjoy this banger song.
				</p>
				<iframe
					allow="autoplay"
					height="300"
					src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2044190296&color=%23ff5500&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
					title="x402 SoundCloud player"
					width="100%"
				/>
				<div
					style={{
						fontSize: "10px",
						color: "#cccccc",
						lineBreak: "anywhere",
						wordBreak: "normal",
						overflow: "hidden",
						whiteSpace: "nowrap",
						textOverflow: "ellipsis",
						fontFamily:
							"Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif",
						fontWeight: "100",
					}}
				>
					<a
						href="https://soundcloud.com/dan-kim-675678711"
						rel="noopener"
						style={{ color: "#cccccc", textDecoration: "none" }}
						target="_blank"
						title="danXkim"
					>
						danXkim
					</a>{" "}
					·{" "}
					<a
						href="https://soundcloud.com/dan-kim-675678711/x402"
						rel="noopener"
						style={{ color: "#cccccc", textDecoration: "none" }}
						target="_blank"
						title="x402 (DJ Reppel Remix)"
					>
						x402 (DJ Reppel Remix)
					</a>
				</div>
			</div>
		</div>
	);
}
