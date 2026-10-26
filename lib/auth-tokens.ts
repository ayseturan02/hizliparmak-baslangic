import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
export type TokenPurpose = "RESET" | "VERIFY";
export const tokenHash = (value: string) => createHash("sha256").update(value).digest("hex");
export async function issueAuthEmail(user: { id: string; email: string }, purpose: TokenPurpose) {
  await prisma.authToken.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date(Date.now() - 7 * 86400000) } } });
  const value = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + (purpose === "RESET" ? 30 : 1440) * 60000);
  const record = await prisma.authToken.create({ data: { userId: user.id, purpose, tokenHash: tokenHash(value), expiresAt } });
  // Fragment keeps the secret out of web access logs and Referer headers.
  const link = new URL(purpose === "RESET" ? "/parola-sifirla" : "/eposta-dogrula", process.env.NEXT_PUBLIC_APP_URL);
  if (process.env.NODE_ENV === "production" && link.protocol !== "https:") throw new Error("HTTPS_REQUIRED");
  link.hash = value;
  try {
    await sendEmail(user.email, purpose === "RESET" ? "HızlıParmak parola sıfırlama" : "HızlıParmak e-posta doğrulama",
      `${purpose === "RESET" ? "Parolanı sıfırlamak" : "E-posta adresini doğrulamak"} için bağlantıyı aç:\n${link.toString()}\n\nBağlantı ${purpose === "RESET" ? "30 dakika" : "24 saat"} geçerlidir ve tek kullanımlıktır. Bu isteği sen yapmadıysan bu e-postayı yok say.`, record.id);
  } catch (error) {
    await prisma.authToken.delete({ where: { id: record.id } });
    throw error;
  }
}
