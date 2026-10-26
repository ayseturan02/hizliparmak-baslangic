import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { getSessionUser, clearSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSameOriginJson } from "@/lib/request-security";
const input = z.object({ password: z.string().min(1).max(128), confirmation: z.literal("HESABIMI SİL") }).strict();
const headers = { "Cache-Control": "no-store" };
export async function POST(request: Request) {
  if (!isSameOriginJson(request)) return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403, headers });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Önce hesabına giriş yap." }, { status: 401, headers });
  const body = await request.json().catch(() => null);
  const parsed = input.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Mevcut parolanı ve silme onayını gir." }, { status: 400, headers });
  try {
    const limiter = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(5, "15 m"), prefix: "hp:account-delete" });
    if (!(await limiter.limit(user.id)).success) return NextResponse.json({ error: "Çok fazla deneme yaptın. Daha sonra yeniden dene." }, { status: 429, headers });
    const account = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
    if (!account || !(await bcrypt.compare(parsed.data.password, account.passwordHash))) return NextResponse.json({ error: "Parola hatalı." }, { status: 400, headers });
    if (user.role === "ADMIN") return NextResponse.json({ error: "Yönetici hesabını silmeden önce yönetim yetkisini başka bir hesaba devretmelisin." }, { status: 409, headers });
    const deleted = await prisma.$transaction(async tx => {
      const financial = await tx.user.findUnique({ where: { id: user.id }, select: { _count: { select: { orders: true, subscriptions: true } } } });
      if (!financial || financial._count.orders || financial._count.subscriptions) return false;
      await tx.typingResult.deleteMany({ where: { userId: user.id } });
      await tx.user.delete({ where: { id: user.id } });
      return true;
    });
    if (!deleted) return NextResponse.json({ error: "Ödeme veya abonelik kaydı bulunan hesaplar otomatik silinemiyor. Bu kayıtlar için ayrıca hesap silme incelemesi gerekiyor." }, { status: 409, headers });
    await clearSession();
    return NextResponse.json({ ok: true }, { headers });
  } catch { return NextResponse.json({ error: "Hesabın silinemedi. Lütfen yeniden dene." }, { status: 503, headers }); }
}
