import { isSameOriginJson } from "@/lib/request-security";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ contestId: z.string().min(1) });

export async function POST(request: Request) {
  if (!isSameOriginJson(request)) return NextResponse.json({ error: "Geçersiz kaynak." }, { status: 403 });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sınava katılmak için giriş yapmalısın." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Sınav bilgisi geçersiz." }, { status: 400 });

  const now = new Date();
  const contest = await prisma.weeklyContest.findUnique({
    where: { id: parsed.data.contestId },
    select: { startsAt: true, endsAt: true, status: true },
  });
  if (!contest || now < contest.startsAt || now > contest.endsAt || contest.status === "CANCELLED") {
    return NextResponse.json({ error: "Sınav şu anda açık değil." }, { status: 400 });
  }

  const entry = await prisma.weeklyContestEntry.updateMany({
    where: {
      contestId: parsed.data.contestId,
      userId: user.id,
      startedAt: null,
      submittedAt: null,
    },
    data: { startedAt: now },
  });
  if (entry.count !== 1) return NextResponse.json({ error: "Sınav denemesi başlatılamadı veya zaten kullanılmış." }, { status: 409 });

  return NextResponse.json({ startedAt: now.toISOString() }, { status: 201 });
}
