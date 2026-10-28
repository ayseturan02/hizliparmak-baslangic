import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { getEmailConfiguration } from "../lib/email.ts";
import { validateRuntimeEnv } from "../lib/runtime-env.ts";

// Read only the explicitly selected file; never silently fall back to local .env.
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== "--env-file")) {
  console.error("Usage: npm run check:readiness -- [--env-file <production-env-file>]");
  process.exit(2);
}
const env = args.length ? parseEnv(readFileSync(args[1], "utf8")) : process.env;
let missing = 0;
function check(label: string, ready: boolean) {
  console.log(`${ready ? "PASS" : "MISSING"} ${label}`);
  if (!ready) missing++;
}
const errors = validateRuntimeEnv(env, true);
check("Production database, session, Redis and site origin settings", errors.length === 0);
for (const error of errors) console.log(`  ${error}`);
check("Email provider credentials and sender configuration", getEmailConfiguration(env) !== null);
const address = (value: string | undefined) => !!value && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value.trim());
check("Support email", address(env.SUPPORT_EMAIL));
check("Operator alert email", address(env.ALERT_EMAIL));
check("Business / data controller name", !!env.BUSINESS_NAME?.trim());
check("Business / data controller address", !!env.BUSINESS_ADDRESS?.trim());
console.log("MANUAL Verify actual email delivery, reset/verification links and operator notifications.");
console.log("MANUAL Verify administrator access, final legal texts, advertising approval/consent and latest backup restore.");
console.log("Configuration checks do not prove delivery, service availability or legal readiness. No secret values printed.");
process.exitCode = missing ? 1 : 0;
