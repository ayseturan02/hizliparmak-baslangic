"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const links = [["Akademi", "/ogren"], ["Hız testi", "/test"], ["Yarışlar", "/yarislar"], ["Metinler", "/genel-metinler"], ["Soru Cevap", "/soru-cevap"], ["Sohbet", "/sohbet"], ["Sıralama", "/liderlik"], ["Duyurular", "/duyurular"]];
export default function PrimaryNav() { const pathname = usePathname(); return <nav className="nav-links" aria-label="Ana gezinme">{links.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}</nav>; }
