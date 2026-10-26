import { isSameOriginJson } from "@/lib/request-security";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ contestId: z.string().min(1), typed: z.string().max(5000) });

export async function POST(request: Request) {
  if (!isSameOriginJson(request)) return NextResponse.json({ error: "Geçersiz kaynak." }, { status: 403 });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sonuç kaydetmek için giriş yapmalısın." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Sınav sonucu geçersiz." }, { status: 400 });

  const { contestId, typed } = parsed.data;
  const contest = await prisma.weeklyContest.findUnique({
    where: { id: contestId },
    select: { id: true, textContent: true, startsAt: true, endsAt: true, status: true },
  });
  const now = new Date();
  if (!contest || now < contest.startsAt || now > contest.endsAt || contest.status === "CANCELLED") {
    return NextResponse.json({ error: "Sınav şu anda açık değil." }, { status: 400 });
  }
  if (typed.length !== contest.textContent.length) {
    return NextResponse.json({ error: "Metnin tamamını yazmadan sonuç gönderemezsin." }, { status: 400 });
  }

  const entry = await prisma.weeklyContestEntry.findUnique({
    where: { contestId_userId: { contestId, userId: user.id } },
    select: { id: true, startedAt: true, submittedAt: true },
  });
  if (!entry?.startedAt || entry.submittedAt) {
    return NextResponse.json({ error: "Sınav denemesi geçersiz veya daha önce gönderilmiş." }, { status: 409 });
  }

  const elapsedSeconds = Math.max(1, (now.getTime() - entry.startedAt.getTime()) / 1000);
  if (typed.length > elapsedSeconds * 25) {
    return NextResponse.json({ error: "Gönderilen metin, geçen süreye göre gerçekçi değil." }, { status: 400 });
  }
  let correct = 0;
  for (let index = 0; index < typed.length; index += 1) {
    if (typed[index] === contest.textContent[index]) correct += 1;
  }
  const accuracy = typed.length ? correct / typed.length * 100 : 0;
  const wpm = Math.min(correct / 5 / (elapsedSeconds / 60), 300);
  const score = Number(wpm.toFixed(2));
  const roundedAccuracy = Number(accuracy.toFixed(2));

  const saved = await prisma.$transaction(async (tx) => {
    const consumed = await tx.weeklyContestEntry.updateMany({
      where: { id: entry.id, startedAt: entry.startedAt, submittedAt: null },
      data: { wpm: score, accuracy: roundedAccuracy, submittedAt: now },
    });
    return consumed.count === 1;
  });
  if (!saved) return NextResponse.json({ error: "Sınav sonucu daha önce gönderilmiş." }, { status: 409 });

  return NextResponse.json({
    ok: true,
    message: `Sunucuda ölçülen sonuç kaydedildi: ${score.toFixed(1)} KDM, doğruluk %${roundedAccuracy.toFixed(1)}.`,
    wpm: score,
    accuracy: roundedAccuracy,
  });
}
