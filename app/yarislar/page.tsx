import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import TimedRace from "@/components/TimedRace";
import { getSessionUser } from "@/lib/auth";
import AdSlot from "@/components/AdSlot";
export const metadata: Metadata = { title: "3 ve 5 dakikalık klavye yarışları" };
export default async function RacesPage(){const user=await getSessionUser();return <PageShell title="Süreli klavye yarışları" description="3 veya 5 dakikayı seç, metni yaz ve hızını doğruluk oranıyla birlikte ölç."><div className="race-explainer"><div className="race-explainer-item"><b>01</b><span><strong>Süreyi seç</strong><small>3 dakika veya 5 dakika</small></span></div><div className="race-explainer-item"><b>02</b><span><strong>Metni yaz</strong><small>Geri sayım başlayınca yazmaya başla</small></span></div><div className="race-explainer-item"><b>03</b><span><strong>Sonucunu gör</strong><small>KDM, doğruluk ve sıralama</small></span></div></div><TimedRace signedIn={!!user}/><AdSlot placement="content"/></PageShell>}
