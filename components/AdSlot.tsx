import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** AdSense ads remain disabled until publisher and slot IDs are configured. */
export default async function AdSlot({ placement = "content" }: { placement?: "content" | "footer" | "top" | "side" | "bottom" }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT;
  if (!client || !slot || !/^ca-pub-\d+$/.test(client) || !/^\d+$/.test(slot)) return null;
  const user = await getSessionUser();
  if (user) {
    const active = await prisma.subscription.findFirst({ where: { userId: user.id, status: "ACTIVE", currentPeriodEnd: { gt: new Date() } }, select: { id: true } }).catch(() => null);
    if (active) return null;
  }
  // Real ad units are enabled separately once the account and site are approved.
  // No placeholder is rendered, so empty ad boxes never take up space.
  return null;
}
