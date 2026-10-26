"use client";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
export default function EmailActions({ mode }: { mode: "request" | "reset" | "verify" | "resend" }) {
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [token, setToken] = useState(""), [busy, setBusy] = useState(false), [message, setMessage] = useState(""), [error, setError] = useState("");
  useEffect(() => { if (mode === "reset" || mode === "verify") { setToken(window.location.hash.slice(1)); window.history.replaceState(null, "", window.location.pathname); } }, [mode]);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const confirm = mode === "reset" || mode === "verify";
      const body = confirm ? { purpose: mode === "reset" ? "RESET" : "VERIFY", token, ...(mode === "reset" ? { password } : {}) } : mode === "request" ? { purpose: "RESET", email } : { purpose: "VERIFY" };
      const response = await fetch("/api/auth/email/" + (confirm ? "confirm" : "request"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "İşlem tamamlanamadı.");
      setMessage(data.message); setPassword(""); if (confirm) setToken("");
    } catch (e) { setError(e instanceof Error ? e.message : "Bağlantı kurulamadı."); } finally { setBusy(false); }
  }
  return <div><form onSubmit={submit}>{mode === "request" && <><label htmlFor="recovery-email">Hesabının e-posta adresi</label><input id="recovery-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)}/></>}{mode === "reset" && <><label htmlFor="new-password">Yeni parola</label><input id="new-password" type="password" autoComplete="new-password" required minLength={10} maxLength={72} value={password} onChange={e => setPassword(e.target.value)}/><p className="muted">En az 10 karakter; harf ve rakam içermeli.</p></>}<button className="button button-primary" disabled={busy || ((mode === "reset" || mode === "verify") && !token)}>{busy ? "İşleniyor…" : mode === "request" ? "Sıfırlama bağlantısı gönder" : mode === "reset" ? "Parolayı değiştir" : mode === "verify" ? "E-posta adresimi doğrula" : "Doğrulama e-postası gönder"}</button></form>{message && <p role="status">{message}</p>}{error && <p role="alert" className="notice notice-error">{error}</p>}{mode === "reset" && <p><Link href="/parolami-unuttum">Yeni sıfırlama bağlantısı iste</Link> · <Link href="/giris">Giriş yap</Link></p>}</div>;
}
