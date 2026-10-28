import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { isSameOriginJson } from "@/lib/request-security";
import { allowResultRequest } from "@/lib/result-security";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
  if (!isSameOriginJson(request)) return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403, headers });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Önce giriş yap." }, { status: 401, headers });
  const parsed = z.object({ password: z.string().min(1).max(128) }).strict().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Mevcut parolanı gir." }, { status: 400, headers });
  try {
    if (!(await allowResultRequest(user.id, "export"))) return NextResponse.json({ error: "Çok fazla indirme denemesi yaptın. 10 dakika sonra tekrar dene." }, { status: 429, headers });
    const account = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { passwordHash: true } });
    if (!(await bcrypt.compare(parsed.data.password, account.passwordHash))) return NextResponse.json({ error: "Parola hatalı." }, { status: 400, headers });
    // Explicit selections prevent passwords, session versions, reset tokens and payment credentials from being exported.
    const [profile, progress, results, orders, subscriptions, chatMessages, questions, answers, contestEntries, achievements, blocks, reports, friendships] = await prisma.$transaction([
      prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { id: true, email: true, username: true, name: true, province: true, targetProvince: true, examType: true, examScore: true, provinceMatchVisible: true, keyboardLayout: true, profilePublic: true, showOnLeaderboard: true, emailVerifiedAt: true, createdAt: true } }),
      prisma.lessonProgress.findMany({ where: { userId: user.id }, select: { lessonId: true, completed: true, attempts: true, bestWpm: true, bestAccuracy: true, completedAt: true, lastAttemptAt: true } }),
      prisma.typingResult.findMany({ where: { userId: user.id }, select: { id: true, lessonId: true, textId: true, keyboardLayout: true, wpm: true, accuracy: true, correctChars: true, incorrectChars: true, durationSeconds: true, verified: true, createdAt: true } }),
      prisma.order.findMany({ where: { userId: user.id }, select: { id: true, amountMinor: true, currency: true, status: true, createdAt: true } }),
      prisma.subscription.findMany({ where: { userId: user.id }, select: { planId: true, status: true, currentPeriodStart: true, currentPeriodEnd: true, cancelAtPeriodEnd: true, createdAt: true } }),
      prisma.chatMessage.findMany({ where: { userId: user.id }, select: { id: true, content: true, createdAt: true } }),
      prisma.question.findMany({ where: { userId: user.id }, select: { id: true, title: true, content: true, createdAt: true } }),
      prisma.answer.findMany({ where: { userId: user.id }, select: { id: true, questionId: true, content: true, createdAt: true } }),
      prisma.weeklyContestEntry.findMany({ where: { userId: user.id }, select: { contestId: true, wpm: true, accuracy: true, startedAt: true, submittedAt: true, createdAt: true } }),
      prisma.userAchievement.findMany({ where: { userId: user.id }, select: { achievementId: true, earnedAt: true } }),
      prisma.userBlock.findMany({ where: { blockerId: user.id }, select: { blocked: { select: { username: true } }, createdAt: true } }),
      prisma.contentReport.findMany({ where: { reporterId: user.id }, select: { targetType: true, targetId: true, reason: true, status: true, createdAt: true } }),
      prisma.friendship.findMany({ where: { OR: [{ requesterId: user.id }, { addresseeId: user.id }] }, select: { status: true, createdAt: true, requester: { select: { username: true } }, addressee: { select: { username: true } } } }),
    ], { isolationLevel: "RepeatableRead" });
    return new NextResponse(JSON.stringify({ formatVersion: 1, exportedAt: new Date().toISOString(), profile, progress, results, orders, subscriptions, chatMessages, questions, answers, contestEntries, achievements, blocks, reports, friendships }, null, 2), {
      headers: { ...headers, "Content-Type": "application/json; charset=utf-8", "Content-Disposition": 'attachment; filename="hizliparmak-verilerim.json"' },
    });
  } catch {
    return NextResponse.json({ error: "Verilerin hazırlanamadı. Biraz sonra tekrar dene." }, { status: 503, headers });
  }
}
