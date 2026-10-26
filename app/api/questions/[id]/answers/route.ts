import { blockedUserIds } from "@/lib/moderation";
import { isSameOriginJson } from "@/lib/request-security";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { answerInput, authorSelect } from "@/lib/questions";
type Context = { params: Promise<{ id: string }> };
export const dynamic = "force-dynamic";
export async function GET(request: Request, context: Context) {
 const { id } = await context.params;
 const viewer = await getSessionUser();
 const excluded = await blockedUserIds(viewer?.id);
 const cursor = new URL(request.url).searchParams.get("cursor");
 try {
  if (!await prisma.question.findFirst({ where: { id, userId: { notIn: excluded }, user: { isSuspended: false } }, select: { id: true } })) return NextResponse.json({ error: "Soru bulunamadı." }, { status: 404 });
  const rows = await prisma.answer.findMany({ where: { questionId: id, userId: { notIn: excluded }, user: { isSuspended: false } }, orderBy: [{ createdAt: "asc" }, { id: "asc" }], take: 21, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}), select: { id: true, content: true, createdAt: true, user: { select: authorSelect } } });
  return NextResponse.json({ answers: rows.slice(0, 20), nextCursor: rows.length > 20 ? rows[19].id : null });
 } catch { return NextResponse.json({ error: "Cevaplar yüklenemedi." }, { status: 503 }); }
}
export async function POST(request: Request, context: Context) {
  if (!isSameOriginJson(request)) return NextResponse.json({ error: "Geçersiz kaynak." }, { status: 403 });
 const user = await getSessionUser();
 if (!user) return NextResponse.json({ error: "Cevap yazmak için giriş yapmalısın." }, { status: 401 });
  if (user.isSuspended) return NextResponse.json({ error: "Topluluk erişimin askıya alınmış." }, { status: 403 });
 let body; try { body = await request.json(); } catch { return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 }); }
 const parsed = answerInput.safeParse(body);
 if (!parsed.success) return NextResponse.json({ error: "Cevap 2–3000 karakter arasında olmalı." }, { status: 400 });
 const { id } = await context.params;
 const viewer = await getSessionUser();
 const excluded = await blockedUserIds(viewer?.id);
 try {
  if (!await prisma.question.findFirst({ where: { id, userId: { notIn: excluded }, user: { isSuspended: false } }, select: { id: true } })) return NextResponse.json({ error: "Soru bulunamadı." }, { status: 404 });
  const recent = await prisma.answer.count({ where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 5000) } } });
  if (recent) return NextResponse.json({ error: "Yeni cevap yazmadan önce 5 saniye bekle." }, { status: 429 });
  const answer = await prisma.answer.create({ data: { ...parsed.data, questionId: id, userId: user.id }, select: { id: true, content: true, createdAt: true, user: { select: authorSelect } } });
  return NextResponse.json({ answer }, { status: 201 });
 } catch { return NextResponse.json({ error: "Cevap kaydedilemedi. Lütfen tekrar dene." }, { status: 503 }); }
}
