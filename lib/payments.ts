// Purchasing stays disabled until the operator completes provider checks and explicitly enables it.
export function paymentsEnabled(env: Record<string, string | undefined> = process.env) {
  return env.PAYMENTS_ENABLED === "true" && env.PAYMENT_PROVIDER === "iyzico" && Boolean(env.IYZICO_API_KEY && env.IYZICO_SECRET_KEY && env.NEXT_PUBLIC_APP_URL);
}
