"use client";
import { useEffect, useState } from "react";
type Theme = "dark" | "light" | "midnight";
const themes: { id: Theme; label: string; path: string }[] = [
 { id: "light", label: "Açık", path: "M12 3v2m0 14v2M3 12h2m14 0h2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42M5.64 18.36l1.42-1.42m9.88-9.88 1.42-1.42M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" },
 { id: "dark", label: "Koyu", path: "M20.9 13.2A9 9 0 0 1 10.8 3.1 9 9 0 1 0 20.9 13.2Z" },
 { id: "midnight", label: "Gece mavisi", path: "m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6L12 3Z" },
];
export default function ThemeSwitcher() {
 const [theme, setTheme] = useState<Theme | null>(null);
 useEffect(() => {
  function sync() { const value = document.documentElement.dataset.theme; setTheme(value === "light" || value === "midnight" ? value : "dark"); }
  sync();
  const onStorage = (e: StorageEvent) => { if (e.key === "hp-theme") { const value = e.newValue; document.documentElement.dataset.theme = value === "light" || value === "midnight" || value === "dark" ? value : window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"; sync(); } };
  window.addEventListener("storage", onStorage); return () => window.removeEventListener("storage", onStorage);
 }, []);
 function select(value: Theme) { document.documentElement.dataset.theme = value; setTheme(value); try { localStorage.setItem("hp-theme", value); } catch {} }
 return <div className="theme-switcher" role="group" aria-label="Görünüm teması">{themes.map(item => <button key={item.id} type="button" title={item.label + " tema"} aria-label={item.label + " tema"} aria-pressed={theme === item.id} onClick={() => select(item.id)}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={item.path}/></svg><span>{item.label === "Gece mavisi" ? "Gece" : item.label}</span></button>)}</div>;
}
