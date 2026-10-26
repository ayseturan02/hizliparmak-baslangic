"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { AdPlacement } from "@/lib/advertising";
function PaidAd({ client, slot, placement, name, pathname }: { client: string; slot: string; placement: AdPlacement; name: string; pathname: string }) {
 const ref = useRef<HTMLModElement>(null);
 const [unavailable, setUnavailable] = useState(false);
 useEffect(() => {
  const node = ref.current; if (!node) return;
  const enqueue = () => {
   if (!node.isConnected || node.getBoundingClientRect().width <= 0 || node.dataset.hpRequested === "true" || node.dataset.adsbygoogleStatus) return;
   node.dataset.hpRequested = "true";
   try { const target = window as Window & { adsbygoogle?: Record<string, never>[] }; (target.adsbygoogle = target.adsbygoogle || []).push({}); } catch { setUnavailable(true); }
  };
  const intersection = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) enqueue(); }, { rootMargin: "150px" });
  const mutation = new MutationObserver(() => { if (node.dataset.adStatus === "unfilled") setUnavailable(true); });
  mutation.observe(node, { attributes: true, attributeFilter: ["data-ad-status"] }); intersection.observe(node);
  return () => { intersection.disconnect(); mutation.disconnect(); };
 }, []);
 if (unavailable) return null;
 return <aside className={"ad-slot ad-slot-" + placement} aria-label="Reklam" data-ad-placement={name} data-ad-source="adsense" data-ad-page={pathname}><span className="ad-label">REKLAM</span><ins ref={ref} className="adsbygoogle" style={{ display: "block" }} data-ad-client={client} data-ad-slot={slot} data-ad-format={placement === "side" ? "vertical" : "horizontal"} data-full-width-responsive="false"/></aside>;
}
export default function AdUnit({ placement = "content", client = "", slot = "", name }: { placement?: AdPlacement; client?: string; slot?: string; variant?: number; name?: string }) {
 const pathname = usePathname();
 if (!client || !slot || /^\/(yonetim|odeme|giris|kayit|hesap-sil)(\/|$)/.test(pathname)) return null;
 return <PaidAd key={pathname + ":" + (name || placement) + ":" + slot} client={client} slot={slot} placement={placement} name={name || placement} pathname={pathname}/>;
}
