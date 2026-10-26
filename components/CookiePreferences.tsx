"use client";
import { useSyncExternalStore, useState } from "react";
import Link from "next/link";
const KEY = "hp-cookie-consent-v1";
const EVENT = "hp-cookie-preferences";
let memory = "";
const subscribe = (callback: () => void) => {
 const storage = (event: StorageEvent) => {
  callback();
  if (event.key === null || (event.key === KEY && parse(event.oldValue || "") === true && parse(event.newValue || "") !== true)) window.location.reload();
 };
 window.addEventListener("storage", storage); window.addEventListener(EVENT, callback);
 return () => { window.removeEventListener("storage", storage); window.removeEventListener(EVENT, callback); };
};
function snapshot() { try { return window.localStorage.getItem(KEY) || memory; } catch { return memory; } }
function parse(value: string): boolean | null {
  try { const data = JSON.parse(value); if (typeof data.ads === "boolean" && typeof data.at === "number" && data.at <= Date.now() && Date.now() - data.at < 365 * 86400000) return data.ads; } catch {}
  return null;
}
export function useAdConsent() { return parse(useSyncExternalStore(subscribe, snapshot, () => "")) === true; }
export default function CookiePreferences() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  const [open, setOpen] = useState(false);
  const choice = parse(raw);
  function choose(ads: boolean) {
    const previous = choice;
    memory = JSON.stringify({ ads, at: Date.now() });
    try { window.localStorage.setItem(KEY, memory); } catch {}
    window.dispatchEvent(new Event(EVENT)); setOpen(false);
    // A loaded third-party script cannot be unloaded safely. Reload after revocation.
    if (previous === true && !ads) window.location.reload();
  }
  return <><button type="button" className="chat-action" onClick={() => setOpen(true)}>Çerez tercihleri</button>{(choice === null || open) && <section aria-label="Çerez tercihleri" className="cookie-preferences"><h2>Çerez tercihlerin</h2><p>Oturum çerezi giriş için gereklidir. Reklam hizmetini yalnızca izin verirsen yükleriz. Tercihini bu cihazda saklarız; dilediğinde değiştirebilirsin. <Link href="/cerez-politikasi">Ayrıntılar</Link></p><div className="cookie-buttons"><button type="button" className="button button-ghost" onClick={() => choose(false)}>Yalnızca gerekli</button><button type="button" className="button button-primary" onClick={() => choose(true)}>Reklamlara izin ver</button>{choice !== null && <button type="button" className="button button-ghost" onClick={() => setOpen(false)}>Kapat</button>}</div></section>}</>;
}
