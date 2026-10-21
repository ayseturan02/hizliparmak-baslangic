import type { Metadata } from "next";
import "./globals.css";

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

  return (
    <html lang="tr">
      <head>
        {/* Google AdSense doğrulama ve reklam kodu */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6823236945712938"
          crossOrigin="anonymous"
        />
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
        <main className="site-content">{children}</main>

        {/* Alt bölüm */}
        <SiteFooter />
      </body>
    </html>
  );
}
