import Link from "next/link";
import PageShell from "@/components/PageShell";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
export const metadata={title:"Premium Üyelik"};
export default async function PremiumPage(){
  const user=await getSessionUser();
  let plans:any[]=[];try{plans=await prisma.plan.findMany({where:{active:true},orderBy:{amountMinor:"asc"}})}catch{}
  let active=false;if(user){try{active=!!(await prisma.subscription.findFirst({where:{userId:user.id,status:"ACTIVE",currentPeriodEnd:{gt:new Date()}},select:{id:true}}))}catch{}}
  const monthly=plans.find(p=>p.code==="premium-monthly"), yearly=plans.find(p=>p.code==="premium-yearly");
  return <PageShell title="Daha planlı çalış, daha fazlasını öğren" description="Ücretsiz öğrenme ve genel sıralama açık kalır. Premium ile tüm eğitim aşamalarına ve gelişmiş çalışma araçlarına eriş.">
    {active&&<div className="notice notice-success">Premium üyeliğin aktif. Reklamlar gösterilmez.</div>}
    <div className="grid-3"><article className="card"><span className="pill">Başlangıç</span><h2>Ücretsiz</h2><h3>0 TL</h3><p>İlk 20 aşama, temel hız testi ve genel sıralama.</p><Link className="button button-ghost" href={user?"/ogren":"/kayit"}>{user?"Derslere başla":"Ücretsiz başla"}</Link></article>
    <article className="card" style={{borderColor:"#55f2d0"}}><span className="pill">Aylık erişim</span><h2>Premium Aylık</h2><h3>{monthly?(monthly.amountMinor/100).toLocaleString("tr-TR"):"99"} TL <small>/ 30 gün</small></h3><p>100 aşama, gelişmiş raporlar ve tüm Premium eğitim araçları. Otomatik yenileme yoktur.</p><Link className="button button-primary" href={user?"/odeme?plan=premium-monthly":"/giris?next=/premium"}>{active?"Üyeliğin aktif":"Aylık planı seç"}</Link></article>
    <article className="card"><span className="pill">Yıllık erişim</span><h2>Premium Yıllık</h2><h3>{yearly?(yearly.amountMinor/100).toLocaleString("tr-TR"):"699"} TL <small>/ 365 gün</small></h3><p>Yıllık erişim ve tüm Premium eğitim araçları. Otomatik yenileme yoktur.</p><Link className="button button-ghost" href={user?"/odeme?plan=premium-yearly":"/giris?next=/premium"}>{active?"Üyeliğin aktif":"Yıllık planı seç"}</Link></article></div>
    <div className="panel"><h2>Ödeme güvenliği</h2><p className="muted">Kart bilgileri HızlıParmak sunucusunda tutulmaz. Premium erişimi yalnızca ödeme sağlayıcısından doğrulanan başarılı işlemden sonra açılır. Ücretler yayına almadan önce iyzico hesabında test edilmelidir.</p></div>
  </PageShell>;
}
