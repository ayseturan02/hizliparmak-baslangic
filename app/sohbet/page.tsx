import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import ChatRoom from "@/components/ChatRoom";
import { getSessionUser } from "@/lib/auth";
export const metadata: Metadata = { title: "Aday sohbeti" };
export default async function ChatPage(){const user=await getSessionUser();return <PageShell title="Aday sohbeti" description="Kâtiplik ve klavye çalışmaları hakkında diğer adaylarla iletişim kur."><ChatRoom signedIn={!!user}/></PageShell>}
