import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { iyzicoConfigured, iyzicoRequest } from "@/lib/iyzico";

const PATH = "/payment/iyzipos/checkoutform/auth/ecom/detail";
type PaymentResult = { status?: string; paymentStatus?: string; fraudStatus?: number; token?: string; basketId?: string; paidPrice?: string | number; currency?: string; paymentId?: string; errorMessage?: string };

export async function POST(request: Request) {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  if (!iyzicoConfigured()) return NextResponse.redirect(`${baseUrl}/odeme/basarili?durum=bekleniyor`, 303);
  let token = "";
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) token = String((await request.json()).token || "");
    else token = String((await request.formData()).get("token") || "");
  } catch { /* malformed callback */ }
  if (!token || token.length > 200) return NextResponse.redirect(`${baseUrl}/odeme/basarili?durum=basarisiz`, 303);
  try {
    const result = await iyzicoRequest<PaymentResult>(PATH, { locale: "tr", token });
    const order = await prisma.order.findFirst({ where: { provider: "iyzico", providerReference: token }, include: { user: true } });
    if (!order || order.status === "CANCELLED" || order.status === "REFUNDED") return NextResponse.redirect(`${baseUrl}/odeme/basarili?durum=basarisiz`, 303);
    const expected = (order.amountMinor / 100).toFixed(2);
    const paid = Number(result.paidPrice);
    const success = result.status === "success" && result.paymentStatus === "SUCCESS" && result.fraudStatus === 1 && result.basketId === order.id && result.currency === order.currency && Number.isFinite(paid) && paid === Number(expected);
    if (!success) {
      await prisma.order.updateMany({ where: { id: order.id, status: "PENDING" }, data: { status: "FAILED" } });
      return NextResponse.redirect(`${baseUrl}/odeme/basarili?durum=basarisiz`, 303);
    }
    await prisma.$transaction(async (tx) => {
      const updated = await tx.order.updateMany({ where: { id: order.id, status: "PENDING" }, data: { status: "PAID", provider: "iyzico" } });
      if (updated.count === 0) return;
      const planCode = order.idempotencyKey.startsWith("premium-monthly:") ? "premium-monthly" : order.idempotencyKey.startsWith("premium-yearly:") ? "premium-yearly" : "";
      const plan = planCode ? await tx.plan.findFirst({ where: { code: planCode, active: true } }) : null;
      if (!plan || plan.amountMinor !== order.amountMinor) throw new Error("Ödeme planı eşleşmedi.");
      const now = new Date();
      const current = await tx.subscription.findFirst({ where: { userId: order.userId, status: "ACTIVE", currentPeriodEnd: { gt: now } }, orderBy: { currentPeriodEnd: "desc" } });
      const start = current?.currentPeriodEnd && current.currentPeriodEnd > now ? current.currentPeriodEnd : now;
      const end = new Date(start);
      if (plan.interval === "MONTH") end.setDate(end.getDate() + 30); else end.setDate(end.getDate() + 365);
      await tx.subscription.create({ data: { userId: order.userId, planId: plan.id, status: "ACTIVE", provider: "iyzico", providerReference: result.paymentId ? `payment-${result.paymentId}` : `order-${order.id}`, currentPeriodStart: start, currentPeriodEnd: end } });
    });
    return NextResponse.redirect(`${baseUrl}/odeme/basarili?durum=basarili`, 303);
  } catch (error) {
    console.error("iyzico callback verification failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.redirect(`${baseUrl}/odeme/basarili?durum=dogrulanamadi`, 303);
  }
}
