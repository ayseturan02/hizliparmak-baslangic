import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { questionInput, authorSelect } from "@/lib/questions";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const cursor = new URL(request.url).searchParams.get("cursor");
  try {
    const rows = await prisma.question.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 21,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: { id: true, title: true, content: true, createdAt: true, user: { select: authorSelect }, _count: { select: { answers: true } } }
    });
    return NextResponse.json({ questions: rows.slice(0, 20), nextCursor: rows.length > 20 ? rows[19].id : null });
  } catch { return NextResponse.json({ error: "Sorular yüklenemedi. Lütfen tekrar dene." }, { status: 503 }); }
}
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Soru sormak için giriş yapmalısın." }, { status: 401 });
  let body; try { body = await request.json(); } catch { return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 }); }
  const parsed = questionInput.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Başlık 5–160, soru 10–5000 karakter arasında olmalı." }, { status: 400 });
  try {
    const recent = await prisma.question.count({ where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 15000) } } });
    if (recent) return NextResponse.json({ error: "Yeni soru sormadan önce 15 saniye bekle." }, { status: 429 });
    const question = await prisma.question.create({ data: { ...parsed.data, userId: user.id }, select: { id: true } });
    return NextResponse.json({ question }, { status: 201 });
  } catch { return NextResponse.json({ error: "Soru kaydedilemedi. Lütfen tekrar dene." }, { status: 503 }); }
}
