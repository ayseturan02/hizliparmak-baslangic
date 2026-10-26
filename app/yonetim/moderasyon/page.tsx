import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { contentTarget } from "@/lib/moderation";
import PageShell from "@/components/PageShell";
import ModerationControls from "@/components/ModerationControls";
export default async function Page() {
 const user = await getSessionUser(); if(!user || user.role!=="ADMIN" || user.isSuspended) redirect("/giris");
 const reports = await prisma.contentReport.findMany({where:{status:"OPEN"},orderBy:{createdAt:"asc"},take:100,include:{reporter:{select:{username:true}}}});
 const items = await Promise.all(reports.map(async report=>({report, target:await contentTarget(report.targetType,report.targetId)})));
 return <PageShell title="Topluluk incelemeleri" description="İlk 100 açık şikâyet, en eskiden başlayarak gösterilir."><div className="moderation-list">{items.length===0&&<p>Açık şikâyet yok.</p>}{items.map(({report,target})=><article className="panel" key={report.id}><h2>{report.targetType} · @{report.reporter.username}</h2><p>Şikâyet nedeni: {report.reason}</p><pre>{target?.content || "İçerik artık mevcut değil."}</pre><ModerationControls reportId={report.id}/></article>)}</div></PageShell>;
}
