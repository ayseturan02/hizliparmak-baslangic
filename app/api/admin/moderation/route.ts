import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSameOriginJson } from "@/lib/request-security";
const input = z.object({ reportId: z.string().min(1), action: z.enum(["DISMISS", "REMOVE", "SUSPEND"]) });
export async function POST(request: Request) {
 if (!isSameOriginJson(request)) return NextResponse.json({ error: "Geçersiz kaynak." }, { status: 403 });
 const admin = await getSessionUser(); if (!admin || admin.role !== "ADMIN" || admin.isSuspended) return NextResponse.json({ error: "Yönetici yetkisi gerekir." }, { status: 403 });
 const parsed = input.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
 try {
  const result = await prisma.$transaction(async tx => {
   const report = await tx.contentReport.findUnique({ where: { id: parsed.data.reportId } });
   if (!report || report.status !== "OPEN") return false;
   const claimed = await tx.contentReport.updateMany({ where: { id: report.id, status: "OPEN" }, data: { status: "RESOLVED", resolution: parsed.data.action, resolvedBy: admin.id, resolvedAt: new Date() } });
   if (claimed.count !== 1) return false;
   if (parsed.data.action === "REMOVE") {
    if(report.targetType === "CHAT") await tx.chatMessage.deleteMany({where:{id:report.targetId}});
    if(report.targetType === "QUESTION") await tx.question.deleteMany({where:{id:report.targetId}});
    if(report.targetType === "ANSWER") await tx.answer.deleteMany({where:{id:report.targetId}});
   }
   if (parsed.data.action === "SUSPEND") {
    const updated = await tx.user.updateMany({ where: { id: report.targetUserId, role: "USER", isSuspended: false }, data: { isSuspended: true, sessionVersion: { increment: 1 } } });
    if (!updated.count) throw new Error("CANNOT_SUSPEND");
   }
   return true;
  });
  return NextResponse.json(result ? { message: "İnceleme kaydedildi." } : { error: "Şikâyet bulunamadı veya daha önce incelendi." }, { status: result ? 200 : 409 });
 } catch { return NextResponse.json({ error: "İşlem uygulanamadı. Yönetici hesapları askıya alınamaz; zaten askıdaki hesap için içerik kaldırma kullanılabilir." }, { status: 409 }); }
}
