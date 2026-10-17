export const SECTION_NAMES = ["Temel parmak yerleşimi", "Tüm tuşlar", "Hız ve doğruluk", "Gerçek metinler", "Ustalık ve sınav"];
const contentSamples = [
  "asdf jklş asdf jklş aaaa ssss dddd ffff jjjj kkkk llll şşşş",
  "fj fj dk dk sl sl a; a; fd jk sa lş asd jkl fds jklş",
  "Bugün düzenli çalışarak yazma hızımı ve doğruluğumu geliştireceğim.",
  "Düzenli tekrar, doğru parmak kullanımı ve sakin çalışma başarıyı artırır.",
  "Bu deneme sınavında amacım yalnızca hızlı yazmak değil, hataları azaltmaktır."
];
export function buildSeedLessons() {
  return Array.from({ length: 100 }, (_, i) => {
    const levelNumber = i + 1;
    const section = Math.floor(i / 20) + 1;
    const sample = contentSamples[Math.min(4, Math.floor(i / 20))];
    return {
      levelNumber,
      slug: `asama-${String(levelNumber).padStart(3, "0")}`,
      title: `Aşama ${levelNumber}: ${SECTION_NAMES[section - 1]}`,
      description: `${SECTION_NAMES[section - 1]} bölümünde ${levelNumber}. aşama alıştırması.`,
      content: sample,
      section,
      difficulty: section === 1 ? "BEGINNER" : section === 2 ? "INTERMEDIATE" : section === 5 ? "EXAM" : "ADVANCED",
      isPremium: levelNumber > 20,
      passAccuracy: section === 1 ? 90 : 95,
      minWpm: section <= 2 ? 0 : section === 3 ? 15 : section === 4 ? 20 : 25,
      isPublished: true
    };
  });
}
