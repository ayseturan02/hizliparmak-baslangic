export function validateRuntimeEnv(env: Record<string, string | undefined>, production: boolean) {
  const errors: string[] = [];
  const local = (host: string) => host === "localhost" || host.endsWith(".localhost") || host === "[::1]" || host === "0.0.0.0" || /^127\./.test(host);
  try {
    const url = new URL(env.DATABASE_URL || "");
    if (!["postgres:", "postgresql:"].includes(url.protocol)) errors.push("DATABASE_URL must use PostgreSQL.");
    if (production && local(url.hostname)) errors.push("Production DATABASE_URL must not point to localhost.");
  } catch { errors.push("DATABASE_URL is missing or invalid."); }
  if (!env.AUTH_SECRET || env.AUTH_SECRET.length < 32 || /replace-this|change-me|your-secret|\[SENSITIVE\]/i.test(env.AUTH_SECRET)) errors.push("AUTH_SECRET must be a real random secret of at least 32 characters.");
  try {
    const url = new URL(env.UPSTASH_REDIS_REST_URL || "");
    if (url.protocol !== "https:" || local(url.hostname)) errors.push("UPSTASH_REDIS_REST_URL must use public HTTPS.");
  } catch { errors.push("UPSTASH_REDIS_REST_URL is missing or invalid."); }
  if (!env.UPSTASH_REDIS_REST_TOKEN?.trim() || env.UPSTASH_REDIS_REST_TOKEN === "[SENSITIVE]") errors.push("UPSTASH_REDIS_REST_TOKEN is missing.");
  try {
    const url = new URL(env.NEXT_PUBLIC_APP_URL || "");
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== "/") errors.push("NEXT_PUBLIC_APP_URL must be a site origin.");
    if (production && (url.protocol !== "https:" || local(url.hostname))) errors.push("Production NEXT_PUBLIC_APP_URL must use public HTTPS.");
  } catch { errors.push("NEXT_PUBLIC_APP_URL is missing or invalid."); }
  return errors;
}
