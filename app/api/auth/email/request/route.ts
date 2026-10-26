import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { issueAuthEmail } from "@/lib/auth-tokens";
import { emailConfigured } from "@/lib/email";
import { isSameOriginJson } from "@/lib/request-security";
const input = z.discriminatedUnion("purpose", [z.object({ purpose: z.literal("RESET"), email: z.string().trim().email().max(254) }), z.object({ purpose: z.literal("VERIFY") })]);
const headers = { "Cache-Control": "no-store" };
export async function POST(request: Request) {
  if (!isSameOriginJson(request)) return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403, headers });
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz e-posta isteği." }, { status: 400, headers });
  if (!emailConfigured()) return NextResponse.json({ error: "E-posta gönderimi henüz etkin değil. Lütfen daha sonra tekrar dene." }, { status: 503, headers });
  try {
    const session = parsed.data.purpose === "VERIFY" ? await getSessionUser() : null;
    if (parsed.data.purpose === "VERIFY" && !session) return NextResponse.json({ error: "Önce giriş yap." }, { status: 401, headers });
    const email = parsed.data.purpose === "RESET" ? parsed.data.email.toLowerCase() : session!.email;
    const limiter = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(3, "1 h"), prefix: "hp:auth-email" });
    const key = (s: string) => createHmac("sha256", process.env.AUTH_SECRET!).update(s).digest("hex");
    const ip = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || "local";
    const limits = await Promise.all([limiter.limit(key("ip:" + ip)), limiter.limit(key("email:" + email))]);
    if (limits.some(l => !l.success)) return NextResponse.json({ error: "Çok fazla istek. Lütfen daha sonra tekrar dene." }, { status: 429, headers });
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, emailVerifiedAt: true } });
    if (user && !(parsed.data.purpose === "VERIFY" && user.emailVerifiedAt)) {
      try { await issueAuthEmail(user, parsed.data.purpose); }
      catch {
        // Delivery failures must not reveal whether a password-reset account exists.
        console.error("Auth email delivery failed.");
        if (parsed.data.purpose === "VERIFY") return NextResponse.json({ error: "Doğrulama e-postası gönderilemedi. Lütfen daha sonra tekrar dene." }, { status: 503, headers });
      }
    }
    return NextResponse.json({ message: parsed.data.purpose === "RESET" ? "Bu adresle bir hesap varsa parola sıfırlama bağlantısı gönderildi." : "Doğrulama bağlantısı gönderildi. Adresin zaten doğrulanmışsa tekrar işlem yapman gerekmez." }, { headers });
  } catch {
    return NextResponse.json({ error: "E-posta isteği tamamlanamadı. Lütfen daha sonra tekrar dene." }, { status: 503, headers });
  }
}
