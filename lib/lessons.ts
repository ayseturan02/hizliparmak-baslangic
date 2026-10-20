export const SECTION_NAMES = ["Temel parmak yerleşimi", "Tüm tuşlar", "Hız ve doğruluk", "Gerçek metinler", "Ustalık ve sınav"];
const exercises = [
  "asdf jklş", "f j d k s l a ş", "el ele kalem al", "masa sandalye kalem", "sade sesler akşam", "kitap defter okul", "bir adım daha ileri", "dikkatli ve düzenli yaz", "bugün yeni bir hedef belirle", "doğru yazmak hızdan önce gelir",
  "Çalışmaya başlamadan önce ellerini rahat tut.", "Her tekrar kas hafızasını biraz daha güçlendirir.", "Düzenli çalışmak zamanla daha akıcı yazmayı sağlar.", "Doğru tuşa ulaşmak için ekrana değil metne odaklan.", "Zor kelimelerde yavaşla ve yazım hatalarını kontrol et.",
  "Kamu hizmetinde tarafsızlık ve sorumluluk önemlidir.", "Başvuru evrakları dikkatle incelenerek kayıt altına alınır.", "Resmî belgelerde tarih ve sayı bilgileri kontrol edilmelidir.", "Dijital arşivler bilgiye güvenli ve hızlı erişim sağlar.", "Yargı süreçlerinde tutanakların eksiksiz tutulması gerekir."
];
function levelText(level: number, section: number) {
  const start = (level * 7 + section * 3) % exercises.length;
  const count = section === 1 ? 2 + Math.floor((level - 1) / 7) : 3 + section;
  return Array.from({ length: count }, (_, i) => exercises[(start + i * 3 + Math.floor(i / 2)) % exercises.length]).join(" ");
}
export function buildSeedLessons() {
  return Array.from({ length: 100 }, (_, i) => {
    const levelNumber = i + 1;
    const section = Math.floor(i / 20) + 1;
    const sample = levelText(levelNumber, section);
    return {
      levelNumber,
      slug: `asama-${String(levelNumber).padStart(3, "0")}`,
      title: `Aşama ${levelNumber}: ${SECTION_NAMES[section - 1]}`,
      description: `${levelNumber}. seviyeye özel ${section === 1 ? "temel tuş ve ritim" : section === 2 ? "kelime ve cümle" : section === 3 ? "hız ve doğruluk" : section === 4 ? "uzun metin" : "sınav simülasyonu"} çalışması.`,
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
