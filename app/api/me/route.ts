import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSameOriginJson } from "@/lib/request-security";
const settings = z.object({
  keyboardLayout: z.enum(["TR", "F"]).optional(),
  profilePublic: z.boolean().optional(),
  showOnLeaderboard: z.boolean().optional(),
}).strict().refine(value => Object.keys(value).length > 0);
const headers = { "Cache-Control": "no-store" };
export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user }, { status: user ? 200 : 401, headers });
}
export async function PATCH(request: Request) {
  if (!isSameOriginJson(request)) return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403, headers });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Tercihlerini kaydetmek için giriş yap." }, { status: 401, headers });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Geçersiz istek." }, { status: 400, headers }); }
  const parsed = settings.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçerli bir klavye veya gizlilik tercihi seç." }, { status: 400, headers });
  try {
    const updated = await prisma.user.update({ where: { id: user.id }, data: parsed.data, select: { keyboardLayout: true, profilePublic: true, showOnLeaderboard: true } });
    return NextResponse.json({ ok: true, settings: updated }, { headers });
  } catch { return NextResponse.json({ error: "Tercihlerin kaydedilemedi. Lütfen yeniden dene." }, { status: 503, headers }); }
}
