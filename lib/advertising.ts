import { cache } from "react";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export type AdPlacement = "content" | "footer" | "top" | "side" | "bottom";
export const adsAllowed = cache(async () => {
 const user = await getSessionUser();
 if (!user) return true;
 const subscription = await prisma.subscription.findFirst({ where: { userId: user.id, status: "ACTIVE", currentPeriodEnd: { gt: new Date() } }, select: { id: true } }).catch(() => null);
 return !subscription;
});
export function adConfig(placement: AdPlacement) {
 const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";
 const slots: Record<AdPlacement, string | undefined> = { top: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP, side: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDE, content: process.env.NEXT_PUBLIC_ADSENSE_SLOT_CONTENT, bottom: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM, footer: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM };
 const slot = slots[placement] || process.env.NEXT_PUBLIC_ADSENSE_SLOT || "";
 const configured = /^ca-pub-[0-9]{16}$/.test(client) && /^[0-9]{10}$/.test(slot) && !/^(0+|1+|1234567890|0123456789)$/.test(slot);
 return { client: configured ? client : "", slot: configured ? slot : "" };
}
