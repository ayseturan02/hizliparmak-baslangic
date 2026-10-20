import Link from "next/link";
import { redirect } from "next/navigation";
import PageShell from "@/components/PageShell";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export default async function PaymentSuccessPage({ searchParams }: { searchParams: Promise<{ durum?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/giris");
  const params = await searchParams;
  const sub = await prisma.subscription.findFirst({ where: { userId: user.id, status: "ACTIVE", currentPeriodEnd: { gt: new Date() } }, include: { plan: true }, orderBy: { currentPeriodEnd: "desc" } }).catch(() => null);
  const verified = Boolean(sub);
  const title = verified ? "Premium üyeliğin aktif" : params.durum === "basarisiz" ? "Ödeme tamamlanmadı" : "Ödeme doğrulanıyor";
  return <PageShell title={title} description="Üyelik yalnızca iyzico üzerinden doğrulanmış başarılı ödeme sonrasında etkinleştirilir."><div className="panel">{verified ? <><p className="notice notice-success">{sub?.plan.name} üyeliğin aktif.</p><p>Bitiş tarihi: {sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString("tr-TR") : "—"}</p><Link className="button button-primary" href="/ogren">Derslere dön</Link></> : params.durum === "basarisiz" ? <><p className="notice notice-error">Ödeme doğrulanamadı veya işlem başarısız oldu. Kartından tahsilat olup olmadığını sağlayıcı hesabından kontrol etmeden tekrar ödeme yapma.</p><Link className="button button-primary" href="/premium">Tekrar dene</Link></> : <><p className="muted">Bu sayfayı görmek tek başına üyelik açmaz. Ödeme sağlayıcısından gelen sonuç doğrulanınca üyelik burada görünür.</p><Link className="button button-ghost" href="/abonelik">Üyeliğimi kontrol et</Link></>}</div></PageShell>;
}
