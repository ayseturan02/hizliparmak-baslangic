import { redirect } from "next/navigation";
import PageShell from "@/components/PageShell";
import AccountPreferences from "@/components/AccountPreferences";
import { getSessionUser } from "@/lib/auth";
export default async function PrivacySettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/giris?next=/gizlilik");
  return <PageShell title="Gizlilik ayarları" description="Profilinin ve sonuçlarının görünürlüğünü yönet."><AccountPreferences initial={{ keyboardLayout: user.keyboardLayout, profilePublic: user.profilePublic, showOnLeaderboard: user.showOnLeaderboard }} section="privacy"/></PageShell>;
}
