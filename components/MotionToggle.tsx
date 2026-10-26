"use client";
import { useEffect, useState } from "react";
const KEY = "hp-motion";
export default function MotionToggle() {
 const [enabled, setEnabled] = useState(false);
 useEffect(() => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sync = () => { const mode = document.documentElement.dataset.motion; setEnabled(mode === "on" || mode !== "off" && !media.matches); };
  const storage = (event: StorageEvent) => { if (event.key === KEY) { document.documentElement.dataset.motion = event.newValue === "on" || event.newValue === "off" ? event.newValue : "auto"; sync(); } };
  sync(); media.addEventListener("change", sync); window.addEventListener("storage", storage);
  return () => { media.removeEventListener("change", sync); window.removeEventListener("storage", storage); };
 }, []);
 function toggle() { const value = enabled ? "off" : "on"; document.documentElement.dataset.motion = value; setEnabled(!enabled); try { localStorage.setItem(KEY, value); } catch {} }
 return <button className="motion-toggle" type="button" aria-label={enabled ? "Hareketli kart ışıklarını kapat" : "Hareketli kart ışıklarını aç"} title={enabled ? "Kart ışıkları açık · kapat" : "Kart ışıkları kapalı · aç"} aria-pressed={enabled} onClick={toggle}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m13 2-3 8H5l6 12 3-8h5L13 2Z"/></svg><span>Işık</span></button>;
}
