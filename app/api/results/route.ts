import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSameOriginJson } from "@/lib/request-security";
import { allowResultRequest } from "@/lib/result-security";

const schema = z.object({ wpm: z.number().min(0).max(220), accuracy: z.number().min(0).max(100), correctChars: z.number().int().min(0).max(100000), incorrectChars: z.number().int().min(0).max(100000), durationSeconds: z.number().int().min(5).max(3600), keyboardLayout: z.enum(["TR", "F"]) }).strict();
export async function POST(request: Request) {
  if (!isSameOriginJson(request)) return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sonucu kaydetmek için giriş yap." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Test sonucu geçersiz. Ders sonuçları ders ekranından kaydedilmelidir." }, { status: 400 });
  try {
    if (!(await allowResultRequest(user.id, "submit"))) return NextResponse.json({ error: "Çok fazla sonuç gönderdin. Biraz sonra tekrar dene." }, { status: 429 });
    const result = await prisma.typingResult.create({ data: { userId: user.id, ...parsed.data, verified: false } });
    return NextResponse.json({ ok: true, resultId: result.id, message: "Kişisel çalışma sonucu kaydedildi. Bu sonuç genel sıralamaya eklenmez." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Sonuç kaydedilemedi." }, { status: 503 });
  }
}
