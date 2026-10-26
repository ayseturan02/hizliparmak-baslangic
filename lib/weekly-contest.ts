import { prisma } from "@/lib/prisma";
import { currentContestWindow } from "@/lib/contest-calendar";
export async function ensureCurrentWeeklyContest() {
  const { startsAt, endsAt, titleDate } = currentContestWindow();
  const existing = await prisma.weeklyContest.findUnique({ where: { startsAt } });
  if (existing) return existing;
  try {
    return await prisma.weeklyContest.create({ data: { title: "Haftalık Hız Sınavı · " + titleDate, description: "Bu haftanın ortak metnini yaz, hız ve doğruluğunu ölç. Sunucu zamanıyla hesaplanan sonuçlar otomatik yazma araçlarına karşı tamamen doğrulanmış değildir.", textContent: "Düzenli pratik, doğru parmak tekniği ve tekrar yazma performansını geliştirir. Hız kadar doğruluk da önemlidir. Her gün kısa süre çalışmak uzun aralar vermekten daha verimlidir.", startsAt, endsAt, status: "ACTIVE" } });
  } catch (error) {
    const existing = await prisma.weeklyContest.findUnique({ where: { startsAt } });
    if (existing) return existing;
    throw error;
  }
}
