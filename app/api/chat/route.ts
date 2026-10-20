import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) } },
      orderBy: { createdAt: "desc" }, take: 100,
      select: { id: true, content: true, createdAt: true, user: { select: { username: true } } }
    });
    return NextResponse.json({ messages: messages.reverse() });
  } catch { return NextResponse.json({ error: "Sohbet şu anda kullanılamıyor." }, { status: 503 }); }
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Mesaj göndermek için giriş yapmalısın." }, { status: 401 });
  try {
    const body = await request.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!content || content.length > 350) return NextResponse.json({ error: "Mesaj 1–350 karakter arasında olmalı." }, { status: 400 });
    const replyToId = typeof body.replyToId === "string" ? body.replyToId : null;
    const quoted = replyToId ? await prisma.chatMessage.findUnique({ where: { id: replyToId }, select: { content: true, user: { select: { username: true } } } }) : null;
    const finalContent = quoted ? `↳ @${quoted.user.username}: ${quoted.content.replace(/\s+/g," ").slice(0,70)}\n${content}` : content;
    if (finalContent.length > 500) return NextResponse.json({error:"Alıntıyla birlikte mesaj çok uzun."},{status:400});
    const recent = await prisma.chatMessage.count({ where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 5000) } } });
    if (recent) return NextResponse.json({ error: "Yeni mesaj göndermeden önce birkaç saniye bekle." }, { status: 429 });
    const message = await prisma.chatMessage.create({ data: { userId: user.id, content: finalContent }, select: { id: true, content: true, createdAt: true, user: { select: { username: true } } } });
    return NextResponse.json({ message }, { status: 201 });
  } catch { return NextResponse.json({ error: "Mesaj gönderilemedi. Veritabanı güncellemesini kontrol et." }, { status: 503 }); }
}
