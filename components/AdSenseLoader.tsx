"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
export default function AdSenseLoader({ client }: { client: string }) {
 const pathname = usePathname();
 if (!/^ca-pub-[0-9]{16}$/.test(client) || /^\/(yonetim|odeme|giris|kayit|hesap-sil)(\/|$)/.test(pathname)) return null;
 return <Script id="hp-adsense" strategy="afterInteractive" src={"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + client} crossOrigin="anonymous"/>;
}
