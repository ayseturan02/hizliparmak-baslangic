type Environment = Record<string, string | undefined>;
export type EmailConfiguration = { provider: "gmail"; user: string; password: string } | { provider: "resend"; from: string; apiKey: string };
export function getEmailConfiguration(env: Environment = process.env): EmailConfiguration | null {
  if (!env.NEXT_PUBLIC_APP_URL) return null;
  const provider = env.EMAIL_PROVIDER || (env.GMAIL_USER ? "gmail" : "resend");
  if (provider === "gmail") {
    const user = env.GMAIL_USER?.trim().toLowerCase() || "";
    const password = env.GMAIL_APP_PASSWORD?.replace(/\s/g, "") || "";
    if (!/^[a-z0-9._%+-]+@(gmail|googlemail)\.com$/i.test(user) || !/^[a-z0-9]{16}$/i.test(password)) return null;
    return { provider: "gmail", user, password };
  }
  if (provider === "resend" && env.RESEND_API_KEY && env.RESEND_API_KEY !== "[SENSITIVE]" && env.EMAIL_FROM) return { provider: "resend", from: env.EMAIL_FROM, apiKey: env.RESEND_API_KEY };
  return null;
}
export function emailConfigured() { return getEmailConfiguration() !== null; }
export function gmailTransportOptions(config: Extract<EmailConfiguration, { provider: "gmail" }>) {
  return {
    host: "smtp.gmail.com", port: 465, secure: true,
    auth: { user: config.user, pass: config.password },
    tls: { minVersion: "TLSv1.2" as const, servername: "smtp.gmail.com", rejectUnauthorized: true },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
    logger: false, debug: false,
  };
}
export async function sendEmail(to: string, subject: string, text: string, key: string = crypto.randomUUID()) {
  const config = getEmailConfiguration();
  if (!config) throw new Error("EMAIL_NOT_CONFIGURED");
  if (config.provider === "gmail") {
    const { default: nodemailer } = await import("nodemailer");
    const transport = nodemailer.createTransport(gmailTransportOptions(config));
    try {
      const result = await transport.sendMail({ from: { name: "HızlıParmak", address: config.user }, to, subject, text, disableFileAccess: true, disableUrlAccess: true });
      if (!result.accepted.length || result.rejected.length) throw new Error("EMAIL_DELIVERY_FAILED");
    } catch {
      // SMTP diagnostics can contain addresses or authentication details; do not expose them.
      throw new Error("EMAIL_DELIVERY_FAILED");
    } finally { transport.close(); }
    return;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json", "Idempotency-Key": key },
    body: JSON.stringify({ from: config.from, to: [to], subject, text }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("EMAIL_DELIVERY_FAILED");
}
