import Link from "next/link";
import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import AdSlot from "@/components/AdSlot";
import { practiceTexts } from "@/lib/practice-texts";
export const metadata: Metadata = { title: "Geçmiş sınavlar ve sınav tarzı metinler" };
export default function PastExamsPage(){const texts=practiceTexts.filter(t=>t.id.startsWith("gecmis-"));return <PageShell title="Geçmiş sınavlar" description="Kâtiplik sınavına hazırlanırken süreli yazma pratiği yapabileceğin metin arşivi."><div className="notice-box">Şeffaflık notu: Bu sürümdeki metinler sınav tarzında hazırlanmış özgün alıştırmalardır; resmî geçmiş sınavdan alındıkları doğrulanmadığı için “resmî çıkmış soru/metin” olarak etiketlenmez. Doğrulanmış sınav metinleri, sınav yılı ve resmî kaynak bilgisiyle ayrıca işaretlenmelidir.</div><AdSlot placement="content"/><div className="text-library-grid">{texts.map((t,i)=><article className="card text-library-card" key={t.id}><div className="text-card-top"><span className="pill">Sınav tarzı alıştırma</span><span className="difficulty">{t.difficulty}</span></div><h2>{t.title}</h2><p>{t.text}</p><div className="text-card-bottom"><span>3 ve 5 dk yarışta kullanılabilir</span><Link className="text-link" href="/yarislar">Süreli yaz ↗</Link></div></article>)}</div></PageShell>}
