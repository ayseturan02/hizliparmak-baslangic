import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import QuestionBoard from "@/components/QuestionBoard";
import { getSessionUser } from "@/lib/auth";
export const metadata: Metadata = { title: "Soru Cevap" };
export default async function QuestionsPage() {
 const user = await getSessionUser();
 return <PageShell title="Soru Cevap" description="Aklına takılanı sor, deneyimini paylaş. Klavye çalışmaları ve sınav hazırlığı hakkında birlikte öğrenelim."><QuestionBoard signedIn={!!user} /></PageShell>;
}
