import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { iyzicoConfigured, iyzicoRequest } from "@/lib/iyzico";

const PATH = "/payment/iyzipos/checkoutform/initialize/auth/ecom";
type InitResponse = { status?: string; token?: string; paymentPageUrl?: string; errorMessage?: string; errorCode?: string };
const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Ödeme için önce giriş yapmalısın." }, { status: 401 });
  if (!iyzicoConfigured()) return NextResponse.json({ error: "Ödeme sistemi henüz yapılandırılmadı. iyzico test anahtarları eklenmeli." }, { status: 503 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 }); }
  const planCode = clean(body.planCode, 40);
  const name = clean(body.name, 50), surname = clean(body.surname, 50), phone = clean(body.phone, 20);
  const identityNumber = clean(body.identityNumber, 11), address = clean(body.address, 200), city = clean(body.city, 50);
  if (!name || !surname || !address || !city || !/^\+?[0-9 ()-]{10,20}$/.test(phone) || !/^\d{11}$/.test(identityNumber)) return NextResponse.json({ error: "Lütfen tüm alanları doğru doldur." }, { status: 400 });
  const plan = await prisma.plan.findFirst({ where: { code: planCode, active: true } });
  if (!plan || !["premium-monthly", "premium-yearly"].includes(plan.code)) return NextResponse.json({ error: "Geçerli bir üyelik planı seç." }, { status: 400 });
  const active = await prisma.subscription.findFirst({ where: { userId: user.id, status: "ACTIVE", currentPeriodEnd: { gt: new Date() } }, select: { id: true } });
  if (active) return NextResponse.json({ error: "Zaten aktif Premium üyeliğin var." }, { status: 409 });
  const order = await prisma.order.create({ data: { userId: user.id, amountMinor: plan.amountMinor, currency: plan.currency, idempotencyKey: `${plan.code}:${randomUUID()}`, provider: "iyzico" } });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!.replace(/\/$/, "");
  const amount = (plan.amountMinor / 100).toFixed(2);
  try {
    const result = await iyzicoRequest<InitResponse>(PATH, {
      locale: "tr", conversationId: order.id, price: amount, paidPrice: amount, currency: "TRY", basketId: order.id,
      paymentGroup: "PRODUCT", callbackUrl: `${baseUrl}/api/payments/iyzico/callback`, enabledInstallments: [1],
      buyer: { id: user.id, name, surname, identityNumber, email: user.email, gsmNumber: phone, registrationAddress: address, city, country: "Türkiye", zipCode: "00000", ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1" },
      billingAddress: { address, contactName: `${name} ${surname}`, city, country: "Türkiye", zipCode: "00000" },
      shippingAddress: { address, contactName: `${name} ${surname}`, city, country: "Türkiye", zipCode: "00000" },
      basketItems: [{ id: plan.code, price: amount, name: plan.name, category1: "Dijital Üyelik", category2: "Premium", itemType: "VIRTUAL" }],
    });
    if (result.status !== "success" || !result.token || !result.paymentPageUrl) throw new Error(result.errorMessage || "iyzico ödeme formu oluşturulamadı.");
    await prisma.order.update({ where: { id: order.id }, data: { providerReference: result.token } });
    return NextResponse.json({ paymentPageUrl: result.paymentPageUrl });
  } catch (error) {
    await prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } }).catch(() => undefined);
    console.error("iyzico initialize error", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Ödeme başlatılamadı. Ayarları kontrol edip yeniden dene." }, { status: 502 });
  }
}
