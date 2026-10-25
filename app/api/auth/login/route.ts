import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createHmac } from "node:crypto";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
});

// Upstash Redis bağlantısı
const redis = Redis.fromEnv();

// Aynı hesap için 15 dakikada 5 deneme
const accountLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix: "hizliparmak:login:account",
});

// Aynı IP için 15 dakikada 30 deneme
const ipLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "15 m"),
  prefix: "hizliparmak:login:ip",
});

function secureKey(value: string) {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET eksik veya gecersiz.");
  }

  return createHmac("sha256", secret).update(value).digest("hex");
}

function sendError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(req: Request) {
  try {
    // Gelen verileri kontrol et
    const parsed = schema.safeParse(await req.json());

    if (!parsed.success) {
      return sendError("Geçerli e-posta ve parola gerekli.", 400);
    }

    const email = parsed.data.email.toLowerCase();
    const password = parsed.data.password;

    // Vercel tarafından sağlanan istemci IP bilgisi.
    // Yerel geliştirmede ortak bir anahtar kullanılır.
    const ip =
      req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
      "local";

    const accountKey = secureKey(email);
    const ipKey = secureKey(ip);

    // Redis üzerinden giriş sınırlarını kontrol et
    const [accountResult, ipResult] = await Promise.all([
      accountLimiter.limit(accountKey),
      ipLimiter.limit(ipKey),
    ]);

    if (!accountResult.success || !ipResult.success) {
      return sendError(
        "Çok fazla giriş denemesi yapıldı. Lütfen biraz sonra tekrar deneyin.",
        429,
      );
    }

    // Kullanıcıyı veritabanında bul
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    // Şifreyi kontrol et
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return sendError("E-posta veya parola hatalı.", 401);
    }

    // Giriş başarılı: güvenli oturum oluştur
    await createSession(user.id);

    return NextResponse.json(
      { ok: true },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Login security error:", error);

    return sendError("Giriş işlemi şu anda gerçekleştirilemiyor.", 503);
  }
}
