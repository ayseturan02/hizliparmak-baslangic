"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function LessonAccessEditor({ id, isPublished, isPremium }: { id: string; isPublished: boolean; isPremium: boolean }) {
  const router = useRouter();
  const [published, setPublished] = useState(isPublished);
  const [premium, setPremium] = useState(isPremium);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return <form onSubmit={async event => {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/lessons", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isPublished: published, isPremium: premium }) });
      if (!response.ok) throw new Error((await response.json()).error || "Ders kaydedilemedi.");
      setMessage("Kaydedildi."); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Ders kaydedilemedi."); }
    finally { setBusy(false); }
  }}>
    <label><input type="checkbox" checked={published} onChange={event => setPublished(event.target.checked)} style={{ width: "auto" }}/> Yayında</label>{" "}
    <label><input type="checkbox" checked={premium} onChange={event => setPremium(event.target.checked)} style={{ width: "auto" }}/> Premium</label>{" "}
    <button className="button button-ghost" disabled={busy || (published === isPublished && premium === isPremium)}>{busy ? "Kaydediliyor…" : "Kaydet"}</button>
    {message && <span role="status">{message}</span>}
  </form>;
}
