"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
type Settings = { keyboardLayout: "TR" | "F"; profilePublic: boolean; showOnLeaderboard: boolean };
export default function AccountPreferences({ initial, section }: { initial: Settings; section: "keyboard" | "privacy" }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage(""); setError(false);
    try {
      const payload = section === "keyboard" ? { keyboardLayout: value.keyboardLayout } : { profilePublic: value.profilePublic, showOnLeaderboard: value.showOnLeaderboard };
      const response = await fetch("/api/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Kaydedilemedi.");
      setValue(data.settings); setMessage("Tercihlerin hesabına kaydedildi."); router.refresh();
    } catch (reason) { setError(true); setMessage(reason instanceof Error ? reason.message : "Kaydedilemedi."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={save} className="panel account-preferences">
    {section === "keyboard" ? <fieldset disabled={busy}><legend>Klavye düzenin</legend>{[{ id: "TR", title: "Türkçe Q", description: "Q klavye tuşlarıyla adım adım çalış." }, { id: "F", title: "Türkçe F", description: "F klavye tuşlarıyla adım adım çalış." }].map(option => <label className="link-row preference-option" key={option.id}><input type="radio" name="keyboardLayout" value={option.id} checked={value.keyboardLayout === option.id} onChange={() => { setValue({ ...value, keyboardLayout: option.id as "TR" | "F" }); setMessage(""); }}/><span><strong>{option.title}</strong><small>{option.description}</small></span></label>)}<p className="muted">Öğrenme merkezi ve dersler kaydettiğin düzenle açılır. Bir derste geçici olarak başka bir düzen de seçebilirsin.</p></fieldset> : <fieldset disabled={busy}><legend>Görünürlük tercihlerin</legend><label className="link-row preference-option"><input type="checkbox" checked={value.profilePublic} onChange={event => { setValue({ ...value, profilePublic: event.target.checked }); setMessage(""); }}/><span><strong>Profilimi herkese göster</strong><small>Kapattığında herkese açık profil sayfan görüntülenemez.</small></span></label><label className="link-row preference-option"><input type="checkbox" checked={value.showOnLeaderboard} onChange={event => { setValue({ ...value, showOnLeaderboard: event.target.checked }); setMessage(""); }}/><span><strong>Sonuçlarımı sıralamalarda göster</strong><small>Kapattığında sonuçların genel, süreli ve haftalık sıralamalardan gizlenir. Kendi gelişim kayıtların korunur.</small></span></label><p className="muted">Toplulukta paylaştığın soru, cevap ve sohbet mesajları bu ayarlardan bağımsız olarak görünür.</p></fieldset>}
    <button className="button button-primary" disabled={busy} type="submit">{busy ? "Kaydediliyor…" : "Tercihleri kaydet"}</button>
    {message && <p className={"notice " + (error ? "notice-error" : "notice-success")} role={error ? "alert" : "status"}>{message}</p>}
  </form>;
}
