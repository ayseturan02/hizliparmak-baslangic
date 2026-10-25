
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createHmac } from "node:crypto";
import { Prisma } from "@prisma/client";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export const runtime = "nodejs";

// Kayıt verilerini doğrula
const schema = z.object({
  email: z.string().trim().email().max(254),

  username: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_]{3,20}$/),

  password: z
    .string()
    .min(10)
    .max(128)
    .regex(/[A-Za-z]/, "Parola harf içermelidir.")
    .regex(/[0-9]/, "Parola rakam içermelidir."),
});

// Redis bağlantısı
const redis = Redis.fromEnv();

// Saatlik kayıt sınırı
const hourlyLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix: "hp:register:hourly",
});

// Günlük kayıt sınırı
const dailyLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "24 h"),
  prefix: "hp:register:daily",
});

// IP bilgisini doğrudan Redis'e yazma
function secureKey(value: string) {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET geçersiz.");
  }

  return createHmac("sha256", secret)
    .update(value)
    .digest("hex");
}

// JSON hata yanıtı
function sendError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(req: Request) {
  try {
    // İsteğin boyutunu sınırla
    const bodyText = await req.text();

    if (bodyText.length > 4096) {
      return sendError("İstek çok büyük.", 413);
    }

    let body: unknown;

    try {
      body = JSON.parse(bodyText);
    } catch {
      return sendError("Geçersiz istek.", 400);
    }

    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return sendError(
        "E-posta, kullanıcı adı veya parola kurallara uygun değil. Parola en az 10 karakter olmalı, harf ve rakam içermelidir.",
        400
      );
    }

    const {
      email,
      username,
      password,
    } = parsed.data;

    const normalizedEmail = email.toLowerCase();
    const normalizedUsername = username;

    // Vercel tarafından sağlanan istemci IP'si.
    // Yerel geliştirmede ortak anahtar kullanılır.
    const ip =
      req.headers
        .get("x-vercel-forwarded-for")
        ?.split(",")[0]
        ?.trim() || "local";

    const ipKey = secureKey(ip);

    // Redis kayıt sınırları
    const [hourly, daily] = await Promise.all([
      hourlyLimit.limit(ipKey),
      dailyLimit.limit(ipKey),
    ]);

    if (!hourly.success || !daily.success) {
      return sendError(
        "Çok fazla kayıt denemesi yapıldı. Lütfen daha sonra tekrar deneyin.",
        429
      );
    }

    // Mevcut kullanıcı kontrolü
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          {
            username: {
              equals: normalizedUsername,
              mode: "insensitive",
            },
          },
        ],
      },
      select: { id: true },
    });

    if (existing) {
      return sendError(
        "Bu bilgilerle kayıt oluşturulamıyor. Farklı bilgiler deneyin veya giriş yapın.",
        409
      );
    }

    // Şifreyi güvenli şekilde hashle
    const passwordHash = await bcrypt.hash(password, 12);

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        username: normalizedUsername,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
      },
    });

    // Yeni kullanıcı için oturum oluştur
    await createSession(user.id);

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: user.id,
          username: user.username,
        },
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    // Aynı anda gelen kayıt isteklerinde
    // benzersiz alan çakışmalarını yönet
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return sendError(
        "Bu bilgilerle kayıt oluşturulamıyor.",
        409
      );
    }

    console.error("Register security error:", error);

    return sendError(
      "Kayıt işlemi şu anda gerçekleştirilemiyor.",
      503
    );
  }
}
