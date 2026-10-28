import Link from "next/link";
import { redirect } from "next/navigation";
import PageShell from "@/components/PageShell";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { istanbulDay, summarizeDailyGoals } from "@/lib/daily-goals";

export default async function DailyTasks() {
  const user = await getSessionUser();
  if (!user) redirect("/giris?next=/gunluk-gorevler");
  const { start, end } = istanbulDay();
  const [results, completedLessons] = await Promise.all([
    prisma.typingResult.findMany({ where: { userId: user.id, createdAt: { gte: start, lt: end }, OR: [{ lessonId: { not: null } }, { verified: true }] }, select: { durationSeconds: true, accuracy: true, lessonId: true } }),
    prisma.lessonProgress.count({ where: { userId: user.id, completed: true, completedAt: { gte: start, lt: end } } }),
  ]);
  const goals = summarizeDailyGoals(results, completedLessons);
  return <PageShell title="Günlük görevler" description="Hedefler her gün İstanbul saatine göre 00.00'da yenilenir. Kaydedilen çalışmaların otomatik sayılır.">
    <p>{goals.filter(goal => goal.value >= goal.target).length}/3 görev tamamlandı.</p>
    <div className="grid-3">{goals.map(goal => <div className="card" key={goal.title}>
      <h2>{goal.title}</h2><p>{goal.description}</p>
      <progress value={goal.value} max={goal.target} aria-label={goal.title} style={{ width: "100%" }}/>
      <p>{goal.value}/{goal.target} {goal.unit}</p>
      {goal.value >= goal.target ? <span className="badge">Tamamlandı ✓</span> : <Link className="button button-ghost" href={goal.href}>Çalışmaya başla</Link>}
    </div>)}</div>
  </PageShell>;
}
