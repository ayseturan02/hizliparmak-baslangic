import { isSameOriginJson } from "@/lib/request-security";
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { practiceTexts } from "@/lib/practice-texts";
import { prisma } from "@/lib/prisma";

const startSchema = z.object({
  durationSeconds: z.union([z.literal(180), z.literal(300)]),
  textId: z.string().min(1),
});

export async function POST(request: Request) {
  if (!isSameOriginJson(request)) return NextResponse.json({ error: "Geçersiz kaynak." }, { status: 403 });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Yarışa katılmak için giriş yapmalısın." }, { status: 401 });

  const parsed = startSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Yarış bilgisi geçersiz." }, { status: 400 });

  const text = practiceTexts.find((item) => item.id === parsed.data.textId);
  if (!text || !(text.id.startsWith("gecmis-") || text.category === "Kamu ve hukuk" || text.category === "Resmî yazışma")) {
    return NextResponse.json({ error: "Yarış metni geçersiz." }, { status: 400 });
  }

  const limiter = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(10, "10 m"), prefix: "hp:race-start" });
  if (!(await limiter.limit(user.id)).success) return NextResponse.json({ error: "Çok fazla yarış başlatıldı. Daha sonra yeniden dene." }, { status: 429 });
  const attempt = await prisma.raceAttempt.create({
    data: {
      userId: user.id,
      durationSeconds: parsed.data.durationSeconds,
      textId: text.id,
    },
    select: { id: true },
  });

  return NextResponse.json({ attemptId: attempt.id }, { status: 201 });
}
