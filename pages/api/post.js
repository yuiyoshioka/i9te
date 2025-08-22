import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Upload failed" });

    const caption = fields.caption;
    const filePath = files.media.filepath;

    try {
      // 1. Upload ke IPFS (via Zora API)
      const buffer = fs.readFileSync(filePath);
      const ipfsRes = await fetch("https://api.zora.co/ipfs/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.ZORA_API_KEY}` },
        body: buffer,
      });
      const { cid } = await ipfsRes.json();

      // 2. Post ke Zora Feed
      const zoraRes = await fetch("https://api.zora.co/content/post", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.ZORA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caption,
          media: [`ipfs://${cid}`],
        }),
      });
      const zoraData = await zoraRes.json();

      // 3. Auto-cast ke Farcaster
      const farcasterRes = await fetch("https://api.neynar.com/v2/farcaster/cast", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEYNAR_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signer_uuid: process.env.FARCASTER_SIGNER_UUID,
          text: `${caption}\n\n👉 Cek di Zora: ${zoraData.url}`,
        }),
      });
      const farcasterData = await farcasterRes.json();

      res.status(200).json({ success: true, zora: zoraData, farcaster: farcasterData });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
}
