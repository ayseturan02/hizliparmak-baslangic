import { redirect } from "next/navigation";
import PageShell from "@/components/PageShell";
import AccountPreferences from "@/components/AccountPreferences";
import { getSessionUser } from "@/lib/auth";
export default async function KeyboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/giris?next=/klavye");
  return <PageShell title="Klavye düzeni" description="Tercihini hesabına kaydet; her girişinde aynı düzenle çalış."><AccountPreferences initial={{ keyboardLayout: user.keyboardLayout, profilePublic: user.profilePublic, showOnLeaderboard: user.showOnLeaderboard }} section="keyboard"/></PageShell>;
}
