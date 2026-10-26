import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { contentTarget } from "@/lib/moderation";
import { isSameOriginJson } from "@/lib/request-security";
const input = z.object({ targetType: z.enum(["CHAT", "QUESTION", "ANSWER"]), targetId: z.string().min(1).max(100), reason: z.string().trim().min(5).max(500) });
export async function POST(request: Request) {
 if (!isSameOriginJson(request)) return NextResponse.json({ error: "Geçersiz kaynak." }, { status: 403 });
 const user = await getSessionUser();
 if (!user) return NextResponse.json({ error: "Önce giriş yap." }, { status: 401 });
 if (user.isSuspended) return NextResponse.json({ error: "Topluluk erişimin askıya alınmış." }, { status: 403 });
 const parsed = input.safeParse(await request.json().catch(() => null));
 if (!parsed.success) return NextResponse.json({ error: "5–500 karakterlik bir şikâyet nedeni gir." }, { status: 400 });
 try {
  const target = await contentTarget(parsed.data.targetType, parsed.data.targetId);
  if (!target) return NextResponse.json({ error: "İçerik bulunamadı." }, { status: 404 });
  const recent = await prisma.contentReport.count({ where: { reporterId: user.id, createdAt: { gt: new Date(Date.now() - 3600000) } } });
  if (recent >= 10) return NextResponse.json({ error: "Saatlik şikâyet sınırına ulaştın." }, { status: 429 });
  await prisma.contentReport.upsert({ where: { reporterId_targetType_targetId: { reporterId: user.id, targetType: parsed.data.targetType, targetId: parsed.data.targetId } }, create: { ...parsed.data, reporterId: user.id, targetUserId: target.userId }, update: {} });
  return NextResponse.json({ message: "Şikâyetin yönetici incelemesine iletildi." });
 } catch { return NextResponse.json({ error: "Şikâyet kaydedilemedi." }, { status: 503 }); }
}
