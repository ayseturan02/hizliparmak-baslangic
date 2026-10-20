import { createHmac, randomBytes } from "node:crypto";

const API_BASE = process.env.IYZICO_BASE_URL || (process.env.IYZICO_SANDBOX === "true" ? "https://sandbox-api.iyzipay.com" : "https://api.iyzipay.com");

export function iyzicoConfigured() {
  return Boolean(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY && process.env.NEXT_PUBLIC_APP_URL);
}

export async function iyzicoRequest<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  if (!apiKey || !secretKey) throw new Error("iyzico API anahtarları yapılandırılmamış.");
  const randomKey = `${Date.now()}${randomBytes(8).toString("hex")}`;
  const bodyText = JSON.stringify(body);
  const signature = createHmac("sha256", secretKey).update(randomKey + path + bodyText).digest("hex");
  const authText = `apiKey:${apiKey}&randomKey:${randomKey}&signature:${signature}`;
  const authorization = `IYZWSv2 ${Buffer.from(authText, "utf8").toString("base64")}`;
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Authorization": authorization, "x-iyzi-rnd": randomKey, "Content-Type": "application/json" },
    body: bodyText,
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw new Error("iyzico isteği başarısız oldu.");
  return data as T;
}
