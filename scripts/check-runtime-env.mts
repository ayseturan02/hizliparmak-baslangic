import { validateRuntimeEnv } from "../lib/runtime-env.ts";
const production = process.argv.includes("--production") || process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
// Local development can read .env; production validation uses only injected settings.
if (!production) {
  try { process.loadEnvFile(".env"); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
}
const errors = validateRuntimeEnv(process.env, production);
if (errors.length) { errors.forEach(error => console.error(error)); process.exitCode = 1; }
else console.log("Required " + (production ? "production" : "development") + " environment settings are valid. No secret values printed.");
