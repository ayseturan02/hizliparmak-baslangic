import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSameOriginJson } from "@/lib/request-security";
const schema = z.object({ title: z.string().trim().min(5).max(140), summary: z.string().trim().min(10).max(2000), category: z.string().trim().min(2).max(40), pinned: z.boolean().default(false) });
async function authorize(request: Request) {
  if (!isSameOriginJson(request)) return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN" || user.isSuspended) return NextResponse.json({ error: "Yönetici yetkisi gerekir." }, { status: 403 });
}
export async function POST(request: Request) {
  const denied = await authorize(request); if (denied) return denied;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Başlık veya açıklama kurallara uygun değil." }, { status: 400 });
  try {
    const item = await prisma.announcement.create({ data: { ...parsed.data, published: true } });
    return NextResponse.json({ ok: true, id: item.id }, { status: 201 });
  } catch { return NextResponse.json({ error: "Duyuru kaydedilemedi." }, { status: 503 }); }
}
export async function PATCH(request: Request) {
  const denied = await authorize(request); if (denied) return denied;
  const parsed = z.object({ id: z.string().min(1).max(100), published: z.boolean() }).strict().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz duyuru işlemi." }, { status: 400 });
  try {
    const updated = await prisma.announcement.updateMany({ where: { id: parsed.data.id }, data: { published: parsed.data.published } });
    return NextResponse.json(updated.count ? { ok: true } : { error: "Duyuru bulunamadı." }, { status: updated.count ? 200 : 404 });
  } catch { return NextResponse.json({ error: "Duyuru güncellenemedi." }, { status: 503 }); }
}
