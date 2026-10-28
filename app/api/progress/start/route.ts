import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyCurriculum } from "@/lib/lessons";
import { isSameOriginJson } from "@/lib/request-security";
import { allowResultRequest, lessonAttemptKey } from "@/lib/result-security";

const input = z.object({ slug: z.string().min(1).max(160), keyboardLayout: z.enum(["TR", "F"]) });
export async function POST(request: Request) {
  if (!isSameOriginJson(request)) return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "İlerlemeni kaydetmek için giriş yap." }, { status: 401 });
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ders bilgileri geçersiz." }, { status: 400 });
  try {
    if (!(await allowResultRequest(user.id, "start"))) return NextResponse.json({ error: "Çok fazla deneme başlattın. Biraz sonra tekrar dene." }, { status: 429 });
    const lesson = await prisma.lesson.findUnique({ where: { slug: parsed.data.slug } });
    if (!lesson?.isPublished) return NextResponse.json({ error: "Ders bulunamadı." }, { status: 404 });
    if (lesson.isPremium && !(await prisma.subscription.findFirst({ where: { userId: user.id, status: "ACTIVE", currentPeriodEnd: { gt: new Date() } } }))) {
      return NextResponse.json({ error: "Bu ders için Premium üyelik gerekiyor." }, { status: 403 });
    }
    const effective = applyCurriculum(lesson, parsed.data.keyboardLayout);
    const attempt = await prisma.raceAttempt.create({ data: {
      userId: user.id, durationSeconds: 3600,
      textId: lessonAttemptKey(lesson.slug, parsed.data.keyboardLayout, effective.content),
    }, select: { id: true } });
    return NextResponse.json({ attemptId: attempt.id }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Ders başlatılamadı. Lütfen yeniden dene." }, { status: 503 });
  }
}
