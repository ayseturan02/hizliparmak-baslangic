import { randomUUID } from "node:crypto";
export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM && process.env.NEXT_PUBLIC_APP_URL);
}
export async function sendEmail(to: string, subject: string, text: string, key: string = randomUUID()) {
  if (!emailConfigured()) throw new Error("EMAIL_NOT_CONFIGURED");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": key },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [to], subject, text }),
    signal: AbortSignal.timeout(10000),
  });
  // Provider response may contain personal data. Do not log it.
  if (!response.ok) throw new Error("EMAIL_DELIVERY_FAILED");
}
