"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  ["Akademi", "/ogren"],
  ["Hız testi", "/test"],
  ["3 ve 5 dk yarışlar", "/yarislar"],
  ["Genel metinler", "/genel-metinler"],
  ["Geçmiş sınav metinleri", "/gecmis-sinavlar"],
  ["Aday sohbeti", "/sohbet"],
  ["Haftalık sınav", "/haftalik-yaris"],
  ["Sıralama", "/liderlik"],
  ["Duyurular", "/duyurular"],
  ["İl eşleşmesi", "/il-eslesme"],
] as const;

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  return <div className="mobile-nav">
    <button className={`mobile-menu-toggle${open ? " is-open" : ""}`} type="button" aria-label={open ? "Menüyü kapat" : "Menüyü aç"} aria-expanded={open} onClick={() => setOpen(!open)}>
      <span /><span /><span />
    </button>
    {open && <nav className="mobile-menu-panel" aria-label="Mobil gezinme">
      {links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}<span>↗</span></Link>)}
    </nav>}
  </div>;
}
