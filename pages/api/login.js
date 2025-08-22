export default async function handler(req, res) {
  try {
    // bikin signer Farcaster via Neynar
    const resp = await fetch("https://api.neynar.com/v2/farcaster/signer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEYNAR_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        app_name: "ZoraFarcasterApp",
      }),
    });

    const data = await resp.json();
    process.env.FARCASTER_SIGNER_UUID = data.signer_uuid; // simpen sementara

    res.status(200).json({ signer_uuid: data.signer_uuid });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
