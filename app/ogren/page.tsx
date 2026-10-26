import AdSlot from "@/components/AdSlot";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { applyCurriculum, buildSeedLessons, SECTION_NAMES } from "@/lib/lessons";
export const metadata = { title: "Öğrenme Merkezi" };
export default async function LearnPage({ searchParams }: { searchParams: Promise<{ layout?: string }> }) {
 const user = await getSessionUser(), query = await searchParams;
 const layout = query.layout === "F" ? "F" : query.layout === "TR" ? "TR" : user?.keyboardLayout || "TR";
 const stored = await prisma.lesson.findMany({ where: { isPublished: true }, orderBy: { levelNumber: "asc" }, select: { id: true, levelNumber: true, slug: true, title: true, isPremium: true, section: true } }).catch(() => []);
 const lessons = stored.length ? stored.map(lesson => applyCurriculum(lesson, layout)) : buildSeedLessons(layout).map(lesson => ({ ...lesson, id: lesson.slug }));
 let completed = new Set<string>(), premium = false;
 if (user) {
  const [progress, active] = await Promise.all([prisma.lessonProgress.findMany({ where: { userId: user.id, completed: true }, select: { lessonId: true } }).catch(() => []), prisma.subscription.findFirst({ where: { userId: user.id, status: "ACTIVE", currentPeriodEnd: { gt: new Date() } }, select: { id: true } }).catch(() => null)]);
  completed = new Set(progress.map(item => item.lessonId)); premium = !!active;
 }
 return <PageShell title="Öğrenme merkezi" description="Önce tuş çiftleri, sonra heceler ve kelimeler. 100 farklı alıştırmayla adım adım klavyeye hâkim ol. İlk 20 aşama ücretsiz."><AdSlot placement="content"/><div className="panel curriculum-summary"><div><strong>{completed.size}/100</strong><p className="muted">Tamamlanan aşama</p></div><div className="curriculum-progress"><div className="progress-track"><span style={{ width: completed.size + "%" }}/></div></div><div className="lesson-layout-switch" aria-label="Eğitim klavyesi"><Link className="button button-ghost" aria-current={layout === "TR" ? "page" : undefined} href="/ogren?layout=TR">Türkçe Q</Link><Link className="button button-ghost" aria-current={layout === "F" ? "page" : undefined} href="/ogren?layout=F">Türkçe F</Link></div></div>{SECTION_NAMES.map((name, index) => <div key={name} className="panel curriculum-section"><div className="curriculum-section-heading"><span className="eyebrow">BÖLÜM {index + 1} · {index * 20 + 1}–{index * 20 + 20}. AŞAMALAR</span><h2>{name}</h2></div><div className="lesson-grid">{lessons.filter(lesson => lesson.section === index + 1).map(lesson => { const locked = lesson.isPremium && !premium; return <Link key={lesson.id} className={"lesson-tile" + (locked ? " locked" : "")} href={locked ? "/premium" : "/ders/" + lesson.slug + "?layout=" + layout} title={lesson.title}><strong>{lesson.levelNumber}. {locked ? "🔒" : ""}</strong><span className="lesson-tile-title">{lesson.title.replace(/^Aşama [0-9]+: /, "")}</span><span>{completed.has(lesson.id) ? "✓ Tamamlandı" : lesson.isPremium ? "Premium aşama" : "Ücretsiz ders"}</span></Link>; })}</div></div>)}</PageShell>;
}
