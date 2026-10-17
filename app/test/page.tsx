import PageShell from "@/components/PageShell"; import TypingTest from "@/components/TypingTest";
export const metadata={title:"Yazma Hızı Testi"};
export default function TestPage(){return <PageShell title="Yazma hızı testi" description="Metni yaz, dakikadaki kelime sayını ve doğruluk oranını gör. Bu ilk sürümde sonuçlar otomatik kaydedilmez."><TypingTest/></PageShell>}
