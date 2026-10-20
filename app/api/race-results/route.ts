import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sonucu kaydetmek için giriş yapmalısın." }, { status: 401 });
  try {
    const body = await request.json();
    const duration = Number(body.durationSeconds);
    const elapsed = Number(body.elapsedSeconds);
    const correctChars = Number(body.correctChars);
    const incorrectChars = Number(body.incorrectChars);
    const typedChars = correctChars + incorrectChars;
    if (![180, 300].includes(duration) || !Number.isInteger(elapsed) || elapsed < 1 || elapsed > duration || !Number.isInteger(correctChars) || !Number.isInteger(incorrectChars) || correctChars < 0 || incorrectChars < 0 || !Number.isFinite(typedChars) || typedChars < 1 || typedChars > 10000) return NextResponse.json({ error: "Geçersiz yarışma sonucu." }, { status: 400 });
    const wpm = Number((correctChars / 5 / (elapsed / 60)).toFixed(2));
    const accuracy = Number((correctChars / typedChars * 100).toFixed(2));
    const result = await prisma.typingResult.create({ data: { userId: user.id, textId: `race-${duration}`, keyboardLayout: user.keyboardLayout, wpm, accuracy, correctChars, incorrectChars, durationSeconds: duration, verified: false } });
    return NextResponse.json({ resultId: result.id, wpm, accuracy, message: "Sonuç kaydedildi. Güvenilir sıralama için sunucu doğrulaması gerekir." }, { status: 201 });
  } catch { return NextResponse.json({ error: "Sonuç kaydedilemedi." }, { status: 503 }); }
}
