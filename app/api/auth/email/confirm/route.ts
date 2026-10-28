export const runtime = "nodejs";
export const maxDuration = 60;
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { clearSession } from "@/lib/auth";
import { tokenHash } from "@/lib/auth-tokens";
import { isSameOriginJson } from "@/lib/request-security";
const password = z.string().min(10).max(72).regex(/[A-Za-z]/).regex(/[0-9]/).refine(v => Buffer.byteLength(v, "utf8") <= 72);
const input = z.discriminatedUnion("purpose", [z.object({ purpose: z.literal("RESET"), token: z.string().regex(/^[a-f0-9]{64}$/), password }), z.object({ purpose: z.literal("VERIFY"), token: z.string().regex(/^[a-f0-9]{64}$/) })]);
const headers = { "Cache-Control": "no-store" };
export async function POST(request: Request) {
  if (!isSameOriginJson(request)) return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403, headers });
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bağlantı veya parola geçersiz. Parola 10–72 karakter olmalı, harf ve rakam içermelidir (en çok 72 UTF-8 bayt)." }, { status: 400, headers });
  try {
    const token = await prisma.authToken.findUnique({ where: { tokenHash: tokenHash(parsed.data.token) } });
    if (!token || token.purpose !== parsed.data.purpose || token.consumedAt || token.expiresAt <= new Date()) return NextResponse.json({ error: "Bağlantı geçersiz, kullanılmış veya süresi dolmuş. Yeni bağlantı iste." }, { status: 400, headers });
    const passwordHash = parsed.data.purpose === "RESET" ? await bcrypt.hash(parsed.data.password, 12) : undefined;
    const saved = await prisma.$transaction(async tx => {
      // Serialize operations for this user; a token cannot race a reset or verification.
      await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${token.userId} FOR UPDATE`;
      const now = new Date();
      const consumed = await tx.authToken.updateMany({ where: { id: token.id, consumedAt: null, expiresAt: { gt: now } }, data: { consumedAt: now } });
      if (consumed.count !== 1) return false;
      if (passwordHash) {
        await tx.user.update({ where: { id: token.userId }, data: { passwordHash, sessionVersion: { increment: 1 } } });
        await tx.authToken.updateMany({ where: { userId: token.userId, purpose: "RESET", consumedAt: null }, data: { consumedAt: now } });
      } else await tx.user.update({ where: { id: token.userId }, data: { emailVerifiedAt: now } });
      return true;
    });
    if (!saved) return NextResponse.json({ error: "Bağlantı daha önce kullanılmış." }, { status: 409, headers });
    if (passwordHash) await clearSession();
    return NextResponse.json({ message: passwordHash ? "Parolan değiştirildi. Tüm eski oturumlar kapatıldı. Yeni parolanla giriş yapabilirsin." : "E-posta adresin doğrulandı." }, { headers });
  } catch { return NextResponse.json({ error: "İşlem tamamlanamadı. Lütfen yeniden dene." }, { status: 503, headers }); }
}
