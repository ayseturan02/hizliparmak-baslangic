import { isSameOriginJson } from "@/lib/request-security";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { practiceTexts } from "@/lib/practice-texts";

const resultSchema = z.object({
  attemptId: z.string().min(1),
  typed: z.string().min(1).max(10000),
});

export async function POST(request: Request) {
  if (!isSameOriginJson(request)) return NextResponse.json({ error: "Geçersiz kaynak." }, { status: 403 });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sonucu kaydetmek için giriş yapmalısın." }, { status: 401 });
  try {
    const parsed = resultSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Geçersiz yarışma sonucu." }, { status: 400 });

    const attempt = await prisma.raceAttempt.findFirst({
      where: { id: parsed.data.attemptId, userId: user.id },
    });
    if (!attempt || attempt.submittedAt) return NextResponse.json({ error: "Yarış denemesi geçersiz veya daha önce gönderilmiş." }, { status: 400 });

    const source = practiceTexts.find((item) => item.id === attempt.textId);
    if (!source) return NextResponse.json({ error: "Yarış metni bulunamadı." }, { status: 400 });
    const expected = (source.text + " ").repeat(8).trim();
    if (parsed.data.typed.length > expected.length) return NextResponse.json({ error: "Yazılan metin yarış metninden uzun." }, { status: 400 });

    const submittedAt = new Date();
    const wallSeconds = (submittedAt.getTime() - attempt.startedAt.getTime()) / 1000;
    if (wallSeconds > attempt.durationSeconds + 30) return NextResponse.json({ error: "Denemenin gönderim süresi doldu. Yeni yarış başlat." }, { status: 400 });
    const fullDuration = wallSeconds >= attempt.durationSeconds;
    const elapsedSeconds = Math.min(
      attempt.durationSeconds,
      Math.max(1, (submittedAt.getTime() - attempt.startedAt.getTime()) / 1000),
    );
    if (parsed.data.typed.length > elapsedSeconds * 25) {
      return NextResponse.json({ error: "Gönderilen metin, geçen süreye göre gerçekçi değil." }, { status: 400 });
    }
    let correctChars = 0;
    for (let index = 0; index < parsed.data.typed.length; index += 1) {
      if (parsed.data.typed[index] === expected[index]) correctChars += 1;
    }
    const incorrectChars = parsed.data.typed.length - correctChars;
    const wpm = Number((correctChars / 5 / (elapsedSeconds / 60)).toFixed(2));
    const accuracy = Number((correctChars / parsed.data.typed.length * 100).toFixed(2));

    const result = await prisma.$transaction(async (tx) => {
      const consumed = await tx.raceAttempt.updateMany({
        where: { id: attempt.id, userId: user.id, submittedAt: null },
        data: { submittedAt },
      });
      if (consumed.count !== 1) return null;
      return tx.typingResult.create({
        data: {
          userId: user.id,
          textId: `race-${attempt.durationSeconds}`,
          keyboardLayout: user.keyboardLayout,
          wpm,
          accuracy,
          correctChars,
          incorrectChars,
          durationSeconds: Math.ceil(elapsedSeconds),
          verified: fullDuration,
        },
      });
    });
    if (!result) return NextResponse.json({ error: "Yarış sonucu daha önce gönderilmiş." }, { status: 409 });
    return NextResponse.json({ resultId: result.id, wpm, accuracy, message: fullDuration ? "Tam süreli sonuç sunucuda hesaplanarak sıralamaya kaydedildi." : "Erken bitirilen çalışma kaydedildi; tam süreli yarış sıralamasına eklenmedi." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Sonuç kaydedilemedi." }, { status: 503 });
  }
}
