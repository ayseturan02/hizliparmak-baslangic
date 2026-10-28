"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function AnnouncementVisibility({ id, published }: { id: string; published: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <div><button className="button button-ghost" disabled={busy} onClick={async () => {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/announcements", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, published: !published }) });
      if (!response.ok) throw new Error((await response.json()).error || "Duyuru güncellenemedi.");
      router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Duyuru güncellenemedi."); }
    finally { setBusy(false); }
  }}>{busy ? "Kaydediliyor…" : published ? "Yayından kaldır" : "Yayınla"}</button>{error && <p role="alert">{error}</p>}</div>;
}
