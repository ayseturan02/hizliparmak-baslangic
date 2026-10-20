import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdSlot({ placement = "content" }: { placement?: "content" | "footer" | "top" | "side" | "bottom" }) {
  const user = await getSessionUser();
  if (user) {
    const active = await prisma.subscription.findFirst({ where: { userId: user.id, status: "ACTIVE", currentPeriodEnd: { gt: new Date() } }, select: { id: true } }).catch(() => null);
    if (active) return null;
  }
  return <aside className={`ad-slot ad-slot-${placement} ad-placeholder`} aria-label="Reklam için ayrılmış alan">
    <span className="ad-label">REKLAM ALANI</span><div className="ad-placeholder-inner">Reklam yerleşimi hazır <small>AdSense bağlantısı daha sonra etkinleştirilecek</small></div>
  </aside>;
}
