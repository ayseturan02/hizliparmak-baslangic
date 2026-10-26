"use client";
import { useState, type FormEvent } from "react";
export default function DeleteAccountForm() {
  const [password, setPassword] = useState(""); const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/me/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, confirmation }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Hesabın silinemedi.");
      window.location.assign("/giris?hesap=silindi");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Hesabın silinemedi."); setBusy(false); }
  }
  return <form onSubmit={submit} className="panel account-preferences"><p>Hesabınla birlikte ders ilerlemen, test sonuçların, sohbet mesajların, soruların ve cevapların silinir. Bu işlem geri alınamaz.</p><p className="muted">Ödeme veya abonelik kaydı olan hesaplar, kayıtların ayrıca incelenmesi gerektiği için buradan otomatik silinmez.</p><label htmlFor="delete-password">Mevcut parolan</label><input className="field" id="delete-password" type="password" autoComplete="current-password" required maxLength={128} value={password} onChange={event=>setPassword(event.target.value)} disabled={busy}/><label htmlFor="delete-confirmation">Onaylamak için HESABIMI SİL yaz</label><input className="field" id="delete-confirmation" autoComplete="off" required value={confirmation} onChange={event=>setConfirmation(event.target.value)} disabled={busy}/>{error && <p className="notice notice-error" role="alert">{error}</p>}<button className="button button-ghost" type="submit" disabled={busy || !password || confirmation !== "HESABIMI SİL"} style={{ color: "var(--red)", borderColor: "var(--red)" }}>{busy ? "Siliniyor…" : "Hesabımı kalıcı olarak sil"}</button></form>;
}
