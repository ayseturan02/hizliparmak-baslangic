import { blockedUserIds } from "@/lib/moderation";
import { isSameOriginJson } from "@/lib/request-security";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const viewer = await getSessionUser();
  const excluded = await blockedUserIds(viewer?.id);
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { userId: { notIn: excluded }, user: { isSuspended: false }, createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) } },
      orderBy: { createdAt: "desc" }, take: 100,
      select: { id: true, content: true, createdAt: true, user: { select: { username: true } } }
    });
    return NextResponse.json({ messages: messages.reverse() });
  } catch { return NextResponse.json({ error: "Sohbet şu anda kullanılamıyor." }, { status: 503 }); }
}

export async function POST(request: Request) {
  if (!isSameOriginJson(request)) return NextResponse.json({ error: "Geçersiz kaynak." }, { status: 403 });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Mesaj göndermek için giriş yapmalısın." }, { status: 401 });
  if (user.isSuspended) return NextResponse.json({ error: "Topluluk erişimin askıya alınmış." }, { status: 403 });
  try {
    const body = await request.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!content || content.length > 350) return NextResponse.json({ error: "Mesaj 1–350 karakter arasında olmalı." }, { status: 400 });
    const replyToId = typeof body.replyToId === "string" ? body.replyToId : null;
    const excluded = await blockedUserIds(user.id);
    const quoted = replyToId ? await prisma.chatMessage.findFirst({ where: { id: replyToId, userId: { notIn: excluded }, user: { isSuspended: false } }, select: { content: true, user: { select: { username: true } } } }) : null;
    const finalContent = quoted ? `↳ @${quoted.user.username}: ${quoted.content.replace(/\s+/g," ").slice(0,70)}\n${content}` : content;
    if (finalContent.length > 500) return NextResponse.json({error:"Alıntıyla birlikte mesaj çok uzun."},{status:400});
    const recent = await prisma.chatMessage.count({ where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 5000) } } });
    if (recent) return NextResponse.json({ error: "Yeni mesaj göndermeden önce birkaç saniye bekle." }, { status: 429 });
    const message = await prisma.chatMessage.create({ data: { userId: user.id, content: finalContent }, select: { id: true, content: true, createdAt: true, user: { select: { username: true } } } });
    return NextResponse.json({ message }, { status: 201 });
  } catch { return NextResponse.json({ error: "Mesaj gönderilemedi. Veritabanı güncellemesini kontrol et." }, { status: 503 }); }
}
