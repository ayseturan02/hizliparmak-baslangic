import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyCurriculum } from "@/lib/lessons";
import { calculateTypingStats } from "@/lib/typing";

const schema = z.object({ slug: z.string().min(1), typed: z.string().max(10000), elapsedSeconds: z.number().min(1).max(3600), keyboardLayout: z.enum(["TR", "F"]).optional() });

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Ders ilerlemesini kaydetmek için giriş yap." }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Ders sonucu geçersiz." }, { status: 400 });
  const lesson = await prisma.lesson.findUnique({ where: { slug: parsed.data.slug } });
  if (!lesson || !lesson.isPublished) return NextResponse.json({ error: "Ders bulunamadı." }, { status: 404 });
  if (lesson.isPremium) {
    const subscription = await prisma.subscription.findFirst({ where: { userId: user.id, status: "ACTIVE", currentPeriodEnd: { gt: new Date() } }, select: { id: true } });
    if (!subscription) return NextResponse.json({ error: "Bu ders için Premium üyelik gerekiyor." }, { status: 403 });
  }
  const layout = parsed.data.keyboardLayout || user.keyboardLayout;
  const effective = applyCurriculum(lesson, layout);
  const stats = calculateTypingStats(effective.content, parsed.data.typed, parsed.data.elapsedSeconds);
  const passed = parsed.data.typed.length === effective.content.length && stats.accuracy >= effective.passAccuracy && stats.wpm >= effective.minWpm;
  await prisma.$transaction(async tx => {
    await tx.typingResult.create({ data: { userId: user.id, lessonId: lesson.id, textId: lesson.slug, keyboardLayout: layout, wpm: stats.wpm, accuracy: stats.accuracy, correctChars: stats.correctChars, incorrectChars: stats.incorrectChars, durationSeconds: Math.round(parsed.data.elapsedSeconds), verified: false } });
    await tx.lessonProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
      create: { userId: user.id, lessonId: lesson.id, completed: passed, attempts: 1, bestWpm: stats.wpm, bestAccuracy: stats.accuracy, completedAt: passed ? new Date() : null, lastAttemptAt: new Date() },
      update: { completed: passed ? true : undefined, attempts: { increment: 1 }, bestWpm: Math.max(stats.wpm, (await tx.lessonProgress.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } }, select: { bestWpm: true } }))?.bestWpm ?? 0), bestAccuracy: Math.max(stats.accuracy, (await tx.lessonProgress.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } }, select: { bestAccuracy: true } }))?.bestAccuracy ?? 0), completedAt: passed ? new Date() : undefined, lastAttemptAt: new Date() }
    });
  });
  return NextResponse.json({ ok: true, passed, wpm: stats.wpm, accuracy: stats.accuracy, message: passed ? "Aşama tamamlandı ve ilerlemen kaydedildi." : "Deneme kaydedildi. Başarı koşullarını sağlayınca aşama tamamlanacak." }, { status: 201 });
}
