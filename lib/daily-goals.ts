// Turkey uses UTC+03:00 year round. All daily goals use the same calendar day.
export function istanbulDay(now = new Date()) {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  const start = new Date(`${date}T00:00:00+03:00`);
  return { start, end: new Date(start.getTime() + 86400000) };
}
export function summarizeDailyGoals(results: { durationSeconds: number; accuracy: number; lessonId: string | null }[], completedLessons: number) {
  return [
    { title: "5 dakika çalış", description: "Kaydedilen ders ve tam süreli yarışlarda toplam 5 dakika çalış.", value: Math.min(300, results.reduce((total, result) => total + result.durationSeconds, 0)), target: 300, unit: "saniye", href: "/ogren" },
    { title: "Doğruluğunu koru", description: "En az 30 saniyelik bir çalışmada %95 doğruluğa ulaş.", value: results.some(result => result.durationSeconds >= 30 && result.accuracy >= 95) ? 1 : 0, target: 1, unit: "çalışma", href: "/yaris" },
    { title: "Bir ders tamamla", description: "Bugün bir dersin başarı koşullarını sağla.", value: Math.min(1, completedLessons), target: 1, unit: "ders", href: "/ogren" },
  ];
}
