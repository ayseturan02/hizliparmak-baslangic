import { NextResponse } from "next/server";
import { createSession, getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const origin = req.headers.get("origin");
    const expectedOrigin = new URL(req.url).origin;

    // Farklı sitelerden gelen yenileme isteklerini reddet.
    if (!origin || origin !== expectedOrigin) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 403 });
    }

    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Oturum süresi doldu." },
        { status: 401 },
      );
    }

    await createSession(user.id);

    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Oturum yenilenemedi." },
      { status: 500 },
    );
  }
}
