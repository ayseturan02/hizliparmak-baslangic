import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "hp_session";
function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET must be set to a random value of at least 32 characters.");
  return new TextEncoder().encode(value);
}
export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret());
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
}
export async function clearSession() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
}
export async function getSessionUser() {
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.sub !== "string") return null;
    return await prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, email: true, username: true, name: true, role: true, keyboardLayout: true, profilePublic: true, showOnLeaderboard: true, province: true, targetProvince: true, examType: true, examScore: true, provinceMatchVisible: true, createdAt: true } });
  } catch { return null; }
}
