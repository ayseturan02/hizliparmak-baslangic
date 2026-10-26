"use client";
import { useEffect, useState } from "react";
import MotionToggle from "@/components/MotionToggle";
import { DEFAULT_THEME, THEME_STORAGE_KEY, isTheme, type Theme } from "@/lib/theme";
const themes: { id: Theme; label: string; path: string }[] = [
 { id: "light", label: "Beyaz", path: "M12 3v2m0 14v2M3 12h2m14 0h2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42M5.64 18.36l1.42-1.42m9.88-9.88 1.42-1.42M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" },
 { id: "dark", label: "Siyah", path: "M20.9 13.2A9 9 0 0 1 10.8 3.1 9 9 0 1 0 20.9 13.2Z" },
 { id: "midnight", label: "Mavi", path: "m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6L12 3Z" },
];
export default function ThemeSwitcher() {
 const [theme, setTheme] = useState<Theme | null>(null);
 useEffect(() => {
  function sync() { const value = document.documentElement.dataset.theme; setTheme(isTheme(value) ? value : DEFAULT_THEME); }
  sync();
  const onStorage = (e: StorageEvent) => { if (e.key === THEME_STORAGE_KEY) { const value = e.newValue; document.documentElement.dataset.theme = isTheme(value) ? value : DEFAULT_THEME; sync(); } };
  window.addEventListener("storage", onStorage); return () => window.removeEventListener("storage", onStorage);
 }, []);
 function select(value: Theme) { document.documentElement.dataset.theme = value; setTheme(value); try { localStorage.setItem(THEME_STORAGE_KEY, value); } catch {} }
 return <div className="theme-switcher" role="group" aria-label="Görünüm teması">{themes.map(item => <button key={item.id} type="button" title={item.label + " tema"} aria-label={item.label + " tema"} aria-pressed={theme === item.id} onClick={() => select(item.id)}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={item.path}/></svg><span>{item.label}</span></button>)}<MotionToggle/></div>;
}
