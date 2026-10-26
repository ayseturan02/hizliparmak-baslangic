import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSameOriginJson } from "@/lib/request-security";
const input = z.object({ username: z.string().min(3).max(20), blocked: z.boolean() });
export async function GET() {
 const user = await getSessionUser(); if (!user) return NextResponse.json({ error: "Önce giriş yap." }, { status: 401 });
 try { const blocks = await prisma.userBlock.findMany({ where: { blockerId: user.id }, select: { blocked: { select: { username: true } } } }); return NextResponse.json({ blocks }, { headers: { "Cache-Control": "no-store" } }); }
 catch { return NextResponse.json({ error: "Engeller yüklenemedi." }, { status: 503 }); }
}
export async function POST(request: Request) {
 if (!isSameOriginJson(request)) return NextResponse.json({ error: "Geçersiz kaynak." }, { status: 403 });
 const user = await getSessionUser(); if (!user) return NextResponse.json({ error: "Önce giriş yap." }, { status: 401 });
 const parsed = input.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Geçersiz kullanıcı." }, { status: 400 });
 try {
  const target = await prisma.user.findFirst({ where: { username: { equals: parsed.data.username, mode: "insensitive" } }, select: { id: true } });
  if (!target || target.id === user.id) return NextResponse.json({ error: "Bu kullanıcı engellenemez." }, { status: 400 });
  if (parsed.data.blocked) await prisma.userBlock.upsert({ where: { blockerId_blockedId: { blockerId: user.id, blockedId: target.id } }, create: { blockerId: user.id, blockedId: target.id }, update: {} });
  else await prisma.userBlock.deleteMany({ where: { blockerId: user.id, blockedId: target.id } });
  return NextResponse.json({ message: parsed.data.blocked ? "Kullanıcı engellendi. İçerik listeleri yenilendiğinde uygulanır." : "Engel kaldırıldı." });
 } catch { return NextResponse.json({ error: "Engel tercihi kaydedilemedi." }, { status: 503 }); }
}
