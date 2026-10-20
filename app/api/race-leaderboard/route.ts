import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(request: Request) {
  const duration = new URL(request.url).searchParams.get("duration");
  if (!["180", "300"].includes(duration || ""))
    return NextResponse.json(
      { error: "Süre 180 veya 300 olmalı." },
      { status: 400 },
    );
  try {
    const results = await prisma.typingResult.findMany({
      where: {
        textId: `race-${duration}`,
        user: { showOnLeaderboard: true, profilePublic: true },
      },
      orderBy: [{ wpm: "desc" }, { accuracy: "desc" }, { createdAt: "asc" }],
      take: 200,
      select: {
        id: true,
        wpm: true,
        accuracy: true,
        createdAt: true,
        user: { select: { username: true } },
      },
    });
    const bestByUser = new Map<string, (typeof results)[number]>();
    for (const result of results) {
      if (!result.user) continue;

      const username = result.user.username;

      if (!bestByUser.has(username)) {
        bestByUser.set(username, result);
      }
    }
    const rows = Array.from(bestByUser.values()).slice(0, 20);
    return NextResponse.json({ rows });
  } catch {
    return NextResponse.json(
      { rows: [], error: "Sıralama şu anda yüklenemedi." },
      { status: 503 },
    );
  }
}
