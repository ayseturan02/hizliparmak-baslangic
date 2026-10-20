import AdSlot from "@/components/AdSlot";
import PageShell from "@/components/PageShell";
import TypingTest from "@/components/TypingTest";
import { practiceTexts } from "@/lib/practice-texts";
export const metadata={title:"Yazma Hızı Testi"};
export default async function TestPage({searchParams}:{searchParams:Promise<{text?:string}>}){const params=await searchParams;const selected=practiceTexts.find(t=>t.id===params.text);return <PageShell title={selected?selected.title:"Yazma hızı testi"} description="Metni yaz, dakikadaki kelime sayını ve doğruluk oranını gör. Önce doğru yazmaya, ardından ritmini korumaya odaklan."><AdSlot placement="content"/><TypingTest text={selected?.text}/></PageShell>}
