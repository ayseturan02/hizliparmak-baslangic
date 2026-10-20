import { redirect } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import CheckoutForm from "@/components/CheckoutForm";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PaymentPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/giris?next=/odeme");
  const params = await searchParams;
  const planCode = params.plan === "premium-yearly" ? "premium-yearly" : "premium-monthly";
  const plan = await prisma.plan.findFirst({ where: { code: planCode, active: true } }).catch(() => null);
  if (!plan) return <PageShell title="Ödeme" description="Plan bilgisi bulunamadı."><div className="panel"><p>Veritabanı planları hazır değil. Yönetici seed komutunu çalıştırmalı.</p><Link className="button button-ghost" href="/premium">Planlara dön</Link></div></PageShell>;
  return <PageShell title="Güvenli ödeme" description="Ödeme sağlayıcısının güvenli ödeme ekranına geçmeden önce fatura bilgilerini tamamla."><div className="panel"><span className="pill">Seçilen plan</span><h2>{plan.name}</h2><h3>{(plan.amountMinor / 100).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</h3><p className="muted">Bu plan otomatik yenilenmez. Süre bittiğinde yeniden satın alman gerekir.</p></div><CheckoutForm planCode={plan.code}/><p className="muted">Hesap: {user.email} · <Link href="/premium">Planı değiştir</Link></p></PageShell>;
}
