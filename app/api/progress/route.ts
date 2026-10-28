import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyCurriculum } from "@/lib/lessons";
import { calculateTypingStats } from "@/lib/typing";
import { isSameOriginJson } from "@/lib/request-security";
import { allowResultRequest, lessonAttemptKey } from "@/lib/result-security";

const schema = z.object({ attemptId: z.string().min(1).max(100), slug: z.string().min(1).max(160), typed: z.string().min(1).max(10000), keyboardLayout: z.enum(["TR", "F"]) });
export async function POST(request: Request) {
  if (!isSameOriginJson(request)) return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Ders ilerlemesini kaydetmek için giriş yap." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ders sonucu geçersiz. Dersi yeniden başlat." }, { status: 400 });
  try {
    if (!(await allowResultRequest(user.id, "submit"))) return NextResponse.json({ error: "Çok fazla sonuç gönderdin. Biraz sonra tekrar dene." }, { status: 429 });
    const lesson = await prisma.lesson.findUnique({ where: { slug: parsed.data.slug } });
    if (!lesson?.isPublished) return NextResponse.json({ error: "Ders bulunamadı." }, { status: 404 });
    if (lesson.isPremium && !(await prisma.subscription.findFirst({ where: { userId: user.id, status: "ACTIVE", currentPeriodEnd: { gt: new Date() } } }))) {
      return NextResponse.json({ error: "Bu ders için Premium üyelik gerekiyor." }, { status: 403 });
    }
    const layout = parsed.data.keyboardLayout;
    const effective = applyCurriculum(lesson, layout);
    const attempt = await prisma.raceAttempt.findFirst({ where: {
      id: parsed.data.attemptId, userId: user.id,
      textId: lessonAttemptKey(lesson.slug, layout, effective.content), submittedAt: null,
    } });
    if (!attempt) return NextResponse.json({ error: "Deneme geçersiz, ders değişmiş veya sonuç daha önce kaydedilmiş. Dersi yeniden başlat." }, { status: 409 });
    const submittedAt = new Date();
    const elapsedSeconds = (submittedAt.getTime() - attempt.startedAt.getTime()) / 1000;
    if (elapsedSeconds < 1 || elapsedSeconds > attempt.durationSeconds || parsed.data.typed.length > effective.content.length || parsed.data.typed.length > elapsedSeconds * 25) {
      return NextResponse.json({ error: "Ders süresi veya yazılan metin geçersiz. Dersi yeniden başlat." }, { status: 400 });
    }
    const stats = calculateTypingStats(effective.content, parsed.data.typed, elapsedSeconds);
    const passed = parsed.data.typed.length === effective.content.length && stats.accuracy >= effective.passAccuracy && stats.wpm >= effective.minWpm;
    const saved = await prisma.$transaction(async tx => {
      const consumed = await tx.raceAttempt.updateMany({ where: { id: attempt.id, userId: user.id, submittedAt: null }, data: { submittedAt } });
      if (consumed.count !== 1) return false;
      await tx.typingResult.create({ data: { userId: user.id, lessonId: lesson.id, textId: lesson.slug, keyboardLayout: layout, wpm: stats.wpm, accuracy: stats.accuracy, correctChars: stats.correctChars, incorrectChars: stats.incorrectChars, durationSeconds: Math.ceil(elapsedSeconds), verified: false } });
      const where = { userId_lessonId: { userId: user.id, lessonId: lesson.id } };
      await tx.lessonProgress.upsert({ where, create: { userId: user.id, lessonId: lesson.id }, update: {} });
      const scope = { userId: user.id, lessonId: lesson.id };
      await tx.lessonProgress.updateMany({ where: { ...scope, bestWpm: { lt: stats.wpm } }, data: { bestWpm: stats.wpm } });
      await tx.lessonProgress.updateMany({ where: { ...scope, bestAccuracy: { lt: stats.accuracy } }, data: { bestAccuracy: stats.accuracy } });
      await tx.lessonProgress.update({ where, data: { attempts: { increment: 1 }, lastAttemptAt: submittedAt, ...(passed ? { completed: true, completedAt: submittedAt } : {}) } });
      return true;
    });
    if (!saved) return NextResponse.json({ error: "Bu deneme daha önce kaydedildi." }, { status: 409 });
    return NextResponse.json({ ok: true, passed, wpm: stats.wpm, accuracy: stats.accuracy, message: passed ? "Aşama tamamlandı ve ilerlemen kaydedildi." : "Deneme kaydedildi. Başarı koşullarını sağlayınca aşama tamamlanacak." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ders sonucu kaydedilemedi. Lütfen yeniden dene." }, { status: 503 });
  }
}
