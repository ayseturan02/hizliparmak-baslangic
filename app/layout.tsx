import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "./studio.css";
import "./advertising.css";
import AdvertisingFrame from "@/components/AdvertisingFrame";
import { adConfig, adsAllowed } from "@/lib/advertising";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CursorGlow from "@/components/CursorGlow";
import SessionManager from "@/components/SessionManager";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    default: "HızlıParmak | On Parmak Klavye Eğitimi",
    template: "%s | HızlıParmak",
  },
  description: "On parmak yazmayı öğren, hızını ölç ve gelişimini takip et.",

  other: {
    "google-adsense-account": "ca-pub-6823236945712938",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Giriş yapmış kullanıcıyı kontrol et
  const user = await getSessionUser();
  const showAds = await adsAllowed();
  const configuredAd = (["top", "side", "content", "bottom"] as const).map(adConfig).find(config => config.client && config.slot);

  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script id="hp-theme-init" dangerouslySetInnerHTML={{ __html: `(function(){var t;try{t=localStorage.getItem("hp-theme")}catch(e){}document.documentElement.dataset.theme=["dark","light","midnight"].indexOf(t)>=0?t:window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"})()` }} />
      </head>

      <body>
        {/* Arka plan efektleri */}
        <div className="ambient-light ambient-light-one" aria-hidden="true" />
        <div className="ambient-light ambient-light-two" aria-hidden="true" />

        <CursorGlow />

        {/* Otomatik oturum yönetimi */}
        {user && <SessionManager />}

        {/* Üst menü */}
        <SiteHeader />

        {/* Sayfa içerikleri */}
        <main className="site-content">{showAds ? <AdvertisingFrame configs={{ top: adConfig("top"), side: adConfig("side"), bottom: adConfig("bottom") }}>{children}</AdvertisingFrame> : children}</main>

        {/* Alt bölüm */}
        <SiteFooter />
        {showAds && configuredAd && <Script id="hp-adsense" strategy="afterInteractive" src={"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + configuredAd.client} crossOrigin="anonymous" />}
      </body>
    </html>
  );
}
