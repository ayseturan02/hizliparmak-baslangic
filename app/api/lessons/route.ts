import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyCurriculum, buildSeedLessons } from "@/lib/lessons";
export async function GET(request: Request) {
 const layout = new URL(request.url).searchParams.get("layout") === "F" ? "F" : "TR";
 const rows = await prisma.lesson.findMany({ where: { isPublished: true }, orderBy: { levelNumber: "asc" }, select: { id: true, levelNumber: true, slug: true, title: true, description: true, section: true, difficulty: true, isPremium: true, passAccuracy: true, minWpm: true } }).catch(() => []);
 const source = rows.length ? rows.map(row => applyCurriculum(row, layout)) : buildSeedLessons(layout).map(row => ({ ...row, id: row.slug }));
 const lessons = source.map(({ id, levelNumber, slug, title, description, section, difficulty, isPremium, passAccuracy, minWpm }) => ({ id, levelNumber, slug, title, description, section, difficulty, isPremium, passAccuracy, minWpm }));
 return NextResponse.json({ lessons });
}
