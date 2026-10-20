import type { Metadata } from "next";
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
  other: {
    "google-adsense-account": "ca-pub-6823236945712938",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6823236945712938"
          crossOrigin="anonymous"
        />
      </head>
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
