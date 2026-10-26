import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PageShell from "@/components/PageShell";
import TypingTest from "@/components/TypingTest";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { applyCurriculum, getCurriculumLesson } from "@/lib/lessons";
export default async function LessonPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ layout?: string }> }) {
 const { slug } = await params, query = await searchParams;
 const user = await getSessionUser();
 const layout = query.layout === "F" ? "F" : query.layout === "TR" ? "TR" : user?.keyboardLayout || "TR";
 const stored = await prisma.lesson.findUnique({ where: { slug } }).catch(() => null);
 const lesson = stored ? applyCurriculum(stored, layout) : getCurriculumLesson(slug, layout);
 if (!lesson || !lesson.isPublished) notFound();
 if (lesson.isPremium) {
  if (!user) redirect("/giris?next=" + encodeURIComponent("/ders/" + slug + "?layout=" + layout));
  const active = await prisma.subscription.findFirst({ where: { userId: user.id, status: "ACTIVE", currentPeriodEnd: { gt: new Date() } }, select: { id: true } }).catch(() => null);
  if (!active) redirect("/premium");
 }
 const teaching = getCurriculumLesson(slug, layout);
 const next = Math.min(100, lesson.levelNumber + 1);
 return <PageShell title={lesson.title} description={teaching?.instruction || lesson.description}><div className="panel lesson-workspace"><div className="lesson-meta"><span className="pill">Aşama {lesson.levelNumber} / 100</span><span className="pill">Türkçe {layout === "F" ? "F" : "Q"}</span><span className="pill">Doğruluk hedefi %{lesson.passAccuracy}</span>{lesson.minWpm === 0 && <span className="pill">Hız sınırı yok · doğru tekniğe odaklan</span>}</div><p className="muted">{user ? "Denemen tamamlandığında sonucun ve ilerlemen hesabına kaydedilir." : "Giriş yapmadan pratik yapabilirsin. İlerlemeni kaydetmek için hesabına giriş yap."}</p><TypingTest key={lesson.slug + layout} text={lesson.content} lessonSlug={lesson.slug} focusKeys={teaching?.focusKeys} keyboardLayout={layout} saveProgress={!!user && !!stored}/><div className="test-actions"><Link className="button button-ghost" href={"/ogren?layout=" + layout}>← Tüm aşamalar</Link>{lesson.levelNumber < 100 && <Link className="button button-primary" href={"/ders/asama-" + String(next).padStart(3, "0") + "?layout=" + layout}>Sonraki aşama →</Link>}</div></div></PageShell>;
}
