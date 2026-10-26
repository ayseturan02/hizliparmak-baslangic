import { PrismaClient } from "@prisma/client";
import { buildSeedLessons } from "../lib/lessons";
import { currentContestWindow } from "../lib/contest-calendar";
const prisma = new PrismaClient();
async function main() {
  for (const { focusKeys, instruction, keyboardLayout, ...lesson } of buildSeedLessons()) {
    await prisma.lesson.upsert({ where: { levelNumber: lesson.levelNumber }, update: lesson as any, create: lesson as any });
  }
  const plans = [
    { code: "premium-monthly", name: "Premium Aylık", description: "100 aşama ve gelişmiş raporlar", amountMinor: 9900, currency: "TRY", interval: "MONTH" as const, active: true },
    { code: "premium-yearly", name: "Premium Yıllık", description: "Yıllık Premium üyelik", amountMinor: 69900, currency: "TRY", interval: "YEAR" as const, active: true }
  ];
  for (const plan of plans) await prisma.plan.upsert({ where: { code: plan.code }, update: plan, create: plan });
  const achievements = [
    { code: "first-test", title: "İlk Test", description: "İlk yazma testini tamamla.", icon: "keyboard" },
    { code: "first-lesson", title: "İlk Adım", description: "İlk dersini tamamla.", icon: "flag" },
    { code: "streak-7", title: "7 Günlük Seri", description: "Yedi gün boyunca çalış.", icon: "flame" }
  ];
  for (const achievement of achievements) await prisma.achievement.upsert({ where: { code: achievement.code }, update: achievement, create: achievement });
  const announcements = [
    { title: "HızlıParmak topluluğuna hoş geldin", summary: "Platformun ilk sürümünü birlikte geliştiriyoruz. Eğitim içerikleri ve topluluk özellikleri düzenli olarak iyileştirilecek.", category: "PLATFORM", published: true, pinned: true },
    { title: "Haftalık toplu sınav alanı açıldı", summary: "Haftalık sınavda ortak metin üzerinden hız ve doğruluk ölçümüne katılabilirsin. İlk sürümde skorlar geliştirme amaçlıdır; resmi ödüllü yarışmalar için ek doğrulama gerekir.", category: "SINAV", published: true, pinned: true },
    { title: "İl eşleşmesi isteğe bağlıdır", summary: "Başvurmayı düşündüğün ili ve sınav türünü kaydedebilirsin. Diğer kullanıcıların seni görebilmesi için ayrıca görünürlük seçeneğini açman gerekir.", category: "TOPLULUK", published: true, pinned: false },
  ];
  for (const item of announcements) {
    const existing = await prisma.announcement.findFirst({ where: { title: item.title } });
    if (existing) await prisma.announcement.update({ where: { id: existing.id }, data: item });
    else await prisma.announcement.create({ data: item });
  }
  const now = new Date();
  const { startsAt, endsAt: end, titleDate } = currentContestWindow(now);
  const contestTitle = "Haftalık Hız Sınavı · " + titleDate;
  const contest = await prisma.weeklyContest.findFirst({ where: { startsAt } });
  const contestData = { title: contestTitle, description: "Bu haftanın ortak metnini yaz, hız ve doğruluğunu ölç. Sonuçlar geliştirme aşamasındadır ve ilk sürümde istemci zamanına dayalıdır.", textContent: "Düzenli pratik, doğru parmak tekniği ve dikkatli tekrar yazma performansını geliştirir. Hız kadar doğruluk da önemlidir. Her gün kısa süre çalışmak uzun aralar vermekten daha verimlidir.", startsAt, endsAt: end, status: now >= startsAt && now <= end ? "ACTIVE" : "UPCOMING" };
  if (contest) await prisma.weeklyContest.update({ where: { id: contest.id }, data: contestData });
  else await prisma.weeklyContest.create({ data: contestData });
  console.log("Seed complete: 100 lessons, plans, achievements, announcements, weekly contest.");
}
main().finally(async () => prisma.$disconnect());
