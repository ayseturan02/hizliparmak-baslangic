import { PrismaClient } from "@prisma/client";
import { buildSeedLessons } from "../lib/lessons.ts";
const prisma = new PrismaClient();
try {
 const existing = await prisma.lesson.findMany({ select: { levelNumber: true, slug: true } });
 const known = new Map(existing.map(row => [row.levelNumber, row.slug]));
 const lessons = buildSeedLessons().filter(row => !known.has(row.levelNumber) || known.get(row.levelNumber) === row.slug);
 await prisma.$transaction(lessons.map(({ focusKeys, instruction, keyboardLayout, ...lesson }) => {
  const { title, description, content, section, difficulty, passAccuracy, minWpm } = lesson;
  return prisma.lesson.upsert({ where: { levelNumber: lesson.levelNumber }, create: lesson, update: { title, description, content, section, difficulty, passAccuracy, minWpm } });
 }));
 console.log(lessons.length + " lessons updated. Existing lesson IDs, progress, publication and access settings preserved.");
} finally { await prisma.$disconnect(); }
