"use client";
import { useState } from "react";

export default function ExportAccountData() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return <form className="panel" onSubmit={async event => {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/me/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      if (!response.ok) throw new Error((await response.json()).error || "Veriler indirilemedi.");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a"); link.href = url; link.download = "hizliparmak-verilerim.json";
      document.body.appendChild(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setPassword(""); setMessage("Veri dosyan hazırlandı.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Veriler indirilemedi."); }
    finally { setBusy(false); }
  }}>
    <h2>Verilerimi indir</h2>
    <p>Hesap bilgilerini, çalışmalarını ve kendi topluluk içeriklerini JSON dosyası olarak indirebilirsin. Dosya kişisel bilgilerin içerir.</p>
    <label htmlFor="export-password">Mevcut parolan</label>
    <input id="export-password" type="password" autoComplete="current-password" required maxLength={128} value={password} onChange={event => setPassword(event.target.value)}/>
    <button className="button button-ghost" disabled={busy}>{busy ? "Hazırlanıyor…" : "Verilerimi indir"}</button>
    {message && <p role="status">{message}</p>}
  </form>;
}
