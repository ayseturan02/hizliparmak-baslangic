import { Redis } from "@upstash/redis";
import { emailConfigured, sendEmail } from "@/lib/email";
export async function reportServerError(routePath: string) {
 if (!process.env.ALERT_EMAIL || !emailConfigured()) return;
 try {
  const allowed = await Redis.fromEnv().set("hp:error-alert", "1", { nx: true, ex: 900 });
  if (!allowed) return;
  await sendEmail(process.env.ALERT_EMAIL, "HızlıParmak sunucu hata bildirimi", `Sunucuda bir hata oluştu. Vercel günlüklerini incele. Rota: ${routePath}. Zaman: ${new Date().toISOString()}`);
 } catch { console.error("Operator error notification could not be delivered."); }
}
