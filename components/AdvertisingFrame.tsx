"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import AdUnit from "@/components/AdUnit";
type Config = { client: string; slot: string };
export default function AdvertisingFrame({ children, configs }: { children: ReactNode; configs: { top: Config; side: Config; bottom: Config } }) {
 const pathname = usePathname();
 if (/^\/(yonetim|odeme|giris|kayit|hesap-sil)(\/|$)/.test(pathname)) return <>{children}</>;
 return <div className="advertising-frame"><div className="advertising-rail advertising-rail-left"><AdUnit placement="side" name="left-upper" variant={0} {...configs.side}/><AdUnit placement="side" name="left-lower" variant={1} {...configs.side}/></div><div className="advertising-main">{pathname !== "/" && <div className="advertising-banner"><AdUnit placement="top" name="global-top" variant={4} {...configs.top}/></div>}{children}<div className="advertising-banner"><AdUnit placement="bottom" name="global-bottom" variant={5} {...configs.bottom}/></div></div><div className="advertising-rail advertising-rail-right"><AdUnit placement="side" name="right-upper" variant={2} {...configs.side}/><AdUnit placement="side" name="right-lower" variant={3} {...configs.side}/></div></div>;
}
