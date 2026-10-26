import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Redis } from "@upstash/redis";
export const dynamic = "force-dynamic";
export async function GET() {
 const headers = { "Cache-Control": "no-store" };
 try {
  await Promise.all([prisma.$queryRaw`SELECT 1`, Redis.fromEnv().ping()]);
  return NextResponse.json({ status: "ok" }, { headers });
 } catch { return NextResponse.json({ status: "unavailable" }, { status: 503, headers }); }
}
