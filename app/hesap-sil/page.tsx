import { redirect } from "next/navigation";
import PageShell from "@/components/PageShell";
import DeleteAccountForm from "@/components/DeleteAccountForm";
import { getSessionUser } from "@/lib/auth";
export default async function DeleteAccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/giris?next=/hesap-sil");
  return <PageShell title="Hesabını sil" description={"@" + user.username + " hesabını kalıcı olarak sil."}><DeleteAccountForm/></PageShell>;
}
