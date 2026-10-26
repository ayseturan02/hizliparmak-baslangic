import type { Instrumentation } from "next";
export const onRequestError: Instrumentation.onRequestError = async (_error, _request, context) => {
 if (process.env.NEXT_RUNTIME !== "nodejs" || !process.env.ALERT_EMAIL || !process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return;
 try {
  const { Redis } = await import("@upstash/redis");
  const allowed = await Redis.fromEnv().set("hp:error-alert", "1", { nx: true, ex: 900 });
  if (!allowed) return;
  const { sendEmail } = await import("./lib/email");
  await sendEmail(process.env.ALERT_EMAIL, "HızlıParmak sunucu hata bildirimi", `Sunucuda bir hata oluştu. Vercel günlüklerini incele. Rota: ${context.routePath}. Zaman: ${new Date().toISOString()}`);
 } catch { console.error("Operator error notification could not be delivered."); }
};
