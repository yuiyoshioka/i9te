import { useState } from "react";

export default function Home() {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleLogin = async () => {
    const res = await fetch("/api/login");
    const data = await res.json();
    alert("Login Farcaster sukses! Signer: " + data.signer_uuid);
  };

  const handleUpload = async () => {
    if (!file) return alert("Pilih file dulu");
    setStatus("Uploading...");

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("media", file);

    const res = await fetch("/api/post", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setStatus("✅ Berhasil! Lihat Zora: " + data.zora.url);
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      <button onClick={handleLogin} className="p-2 bg-blue-500 text-white rounded">
        Login Farcaster
      </button>

      <input
        type="text"
        placeholder="Tulis caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="border p-2"
      />

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <button onClick={handleUpload} className="p-2 bg-green-500 text-white rounded">
        Upload ke Zora + Share Farcaster
      </button>

      <p>{status}</p>
    </div>
  );
}
