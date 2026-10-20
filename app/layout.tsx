import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CursorGlow from "@/components/CursorGlow";

export const metadata: Metadata = {
  title: {
    default: "HızlıParmak | On Parmak Klavye Eğitimi",
    template: "%s | HızlıParmak",
  },
  description: "On parmak yazmayı öğren, hızını ölç ve gelişimini takip et.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <Script
        id="google-adsense"
        strategy="beforeInteractive"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6823236945712938"
        crossOrigin="anonymous"
      />
      <body>
        <div className="ambient-light ambient-light-one" aria-hidden="true" />
        <div className="ambient-light ambient-light-two" aria-hidden="true" />
        <CursorGlow />
        <SiteHeader />
        <main className="site-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
