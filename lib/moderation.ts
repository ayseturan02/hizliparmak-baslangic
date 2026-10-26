import { prisma } from "@/lib/prisma";
export async function blockedUserIds(userId?: string) {
  if (!userId) return [];
  const blocks = await prisma.userBlock.findMany({ where: { OR: [{ blockerId: userId }, { blockedId: userId }] }, select: { blockerId: true, blockedId: true } });
  return blocks.map(b => b.blockerId === userId ? b.blockedId : b.blockerId);
}
export async function contentTarget(type: string, id: string) {
  const select = { id: true, userId: true, content: true };
  if (type === "CHAT") return prisma.chatMessage.findUnique({ where: { id }, select });
  if (type === "QUESTION") return prisma.question.findUnique({ where: { id }, select });
  if (type === "ANSWER") return prisma.answer.findUnique({ where: { id }, select });
  return null;
}
