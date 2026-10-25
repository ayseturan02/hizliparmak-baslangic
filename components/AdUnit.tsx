"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { AdPlacement } from "@/lib/advertising";
import { getPagePromotion, type Promotion } from "@/lib/ad-promotions";
function GoogleUnit({ client, slot, placement, promotion }: { client: string; slot: string; placement: AdPlacement; promotion: Promotion }) {
 const ref = useRef<HTMLModElement>(null);
 const [unfilled, setUnfilled] = useState(false);
 const [failed, setFailed] = useState(false);
 useEffect(() => {
  const node = ref.current; if (!node) return;
  let requested = false;
  const enqueue = () => { if (requested || !node.isConnected || node.getBoundingClientRect().width <= 0) return; requested = true; try { const target = window as Window & { adsbygoogle?: Record<string, never>[] }; (target.adsbygoogle = target.adsbygoogle || []).push({}); } catch { setFailed(true); } };
  const intersection = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) enqueue(); }, { rootMargin: "150px" });
  const mutation = new MutationObserver(() => setUnfilled(node.dataset.adStatus === "unfilled"));
  mutation.observe(node, { attributes: true, attributeFilter: ["data-ad-status"] }); intersection.observe(node);
  return () => { intersection.disconnect(); mutation.disconnect(); };
 }, []);
 if (failed) return <HousePromotion promotion={promotion}/>;
 return <>{!unfilled && <ins ref={ref} className="adsbygoogle" style={{ display: "block" }} data-ad-client={client} data-ad-slot={slot} data-ad-format={placement === "side" ? "vertical" : "horizontal"} data-full-width-responsive="false"/>}{unfilled && <HousePromotion promotion={promotion}/>}</>;
}
function HousePromotion({ promotion }: { promotion: Promotion }) {
 return <div className="house-promotion"><span className="house-ad-icon" aria-hidden="true">{promotion.icon}</span><div className="house-ad-copy"><span className="house-ad-brand">{promotion.section} · HIZLIPARMAK TANITIMI</span><strong>{promotion.title}</strong><p>{promotion.description}</p></div><Link className="house-ad-link" href={promotion.href}>{promotion.action}<span aria-hidden="true">↗</span></Link></div>;
}
export default function AdUnit({ placement = "content", client = "", slot = "", variant = 0, name }: { placement?: AdPlacement; client?: string; slot?: string; variant?: number; name?: string }) {
 const pathname = usePathname();
 if (/^\/(yonetim|odeme|giris|kayit|hesap-sil)(\/|$)/.test(pathname)) return null;
 const configured = !!client && !!slot;
 const promotion = getPagePromotion(pathname, variant);
 return <aside className={"ad-slot ad-slot-" + placement} aria-label="Reklam" data-ad-placement={name || placement} data-ad-source={configured ? "adsense" : "house"} data-ad-page={pathname}><span className="ad-label">REKLAM</span>{configured ? <GoogleUnit key={pathname + ":" + (name || placement) + ":" + slot} client={client} slot={slot} placement={placement} promotion={promotion}/> : <HousePromotion promotion={promotion}/>}</aside>;
}
