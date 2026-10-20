import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CursorGlow from "@/components/CursorGlow";
import AdSlot from "@/components/AdSlot";
export const metadata: Metadata = { title: { default: "HızlıParmak | On Parmak Klavye Eğitimi", template: "%s | HızlıParmak" }, description: "On parmak yazmayı öğren, hızını ölç ve gelişimini takip et." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="tr"><body><div className="ambient-light ambient-light-one" aria-hidden="true"/><div className="ambient-light ambient-light-two" aria-hidden="true"/><CursorGlow/><SiteHeader/><div className="container global-ad-wrap"><AdSlot placement="top"/></div><div className="site-ad-grid"><aside className="site-ad-side"><AdSlot placement="side"/></aside><main className="site-ad-main">{children}</main><aside className="site-ad-side"><AdSlot placement="side"/></aside></div><div className="container global-ad-wrap"><AdSlot placement="bottom"/><AdSlot placement="footer"/></div><SiteFooter/></body></html>; }
