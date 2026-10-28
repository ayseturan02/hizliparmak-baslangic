import assert from "node:assert/strict";
import nodemailer from "nodemailer";
import { getEmailConfiguration, emailConfigured, gmailTransportOptions, sendEmail } from "../lib/email.ts";
const gmail = { NEXT_PUBLIC_APP_URL: "https://example.com", EMAIL_PROVIDER: "gmail", GMAIL_USER: "sender@gmail.com", GMAIL_APP_PASSWORD: "abcd efgh ijkl mnop" };
assert.equal(getEmailConfiguration({}), null);
assert.equal(getEmailConfiguration({ ...gmail, GMAIL_APP_PASSWORD: "" }), null);
assert.equal(getEmailConfiguration({ ...gmail, GMAIL_APP_PASSWORD: "[SENSITIVE]" }), null);
assert.equal(getEmailConfiguration({ ...gmail, GMAIL_USER: "sender@example.com" }), null);
assert.equal(getEmailConfiguration({ ...gmail, EMAIL_PROVIDER: "unknown" }), null);
const config = getEmailConfiguration(gmail)!; assert.equal(config.provider, "gmail");
if (config.provider !== "gmail") throw new Error("Expected Gmail configuration");
assert.equal(config.password, "abcdefghijklmnop");
const options = gmailTransportOptions(config);
assert.equal(options.host, "smtp.gmail.com"); assert.equal(options.port, 465); assert.equal(options.secure, true); assert.equal(options.tls.rejectUnauthorized, true); assert.equal(options.logger, false); assert.equal(options.debug, false);
const oldEnv = { ...process.env }, originalTransport = nodemailer.createTransport, originalFetch = globalThis.fetch;
let closed = 0, captured: any, outcome: "accepted" | "rejected" | "error" = "accepted";
try {
 Object.assign(process.env, gmail);
 assert.equal(emailConfigured(), true);
 nodemailer.createTransport = ((settings: any) => {
  assert.equal(settings.auth.pass, "abcdefghijklmnop");
  return { sendMail: async (message: any) => { captured = message; if(outcome === "error") throw new Error("Provider diagnostics must not escape"); return { accepted: outcome === "accepted" ? ["recipient@example.com"] : [], rejected: outcome === "accepted" ? [] : ["recipient@example.com"] }; }, close: () => { closed++; } };
 }) as typeof nodemailer.createTransport;
 await sendEmail("recipient@example.com", "Test subject", "Test body", "test-key");
 assert.equal(captured.from.address, "sender@gmail.com"); assert.equal(captured.to, "recipient@example.com"); assert.equal(captured.text, "Test body"); assert.equal(captured.disableFileAccess, true); assert.equal(captured.disableUrlAccess, true); assert.equal(closed, 1);
 outcome = "rejected"; await assert.rejects(sendEmail("recipient@example.com", "Test", "Body"), { message: "EMAIL_DELIVERY_FAILED" }); assert.equal(closed, 2);
 outcome = "error"; await assert.rejects(sendEmail("recipient@example.com", "Test", "Body"), { message: "EMAIL_DELIVERY_FAILED" }); assert.equal(closed, 3);
 process.env.GMAIL_APP_PASSWORD = ""; assert.equal(emailConfigured(), false); await assert.rejects(sendEmail("recipient@example.com", "Test", "Body"), { message: "EMAIL_NOT_CONFIGURED" });
 process.env.EMAIL_PROVIDER = "resend"; process.env.RESEND_API_KEY = "test-only-placeholder"; process.env.EMAIL_FROM = "sender@example.com";
 globalThis.fetch = (async (input: any, init: any) => { assert.equal(input, "https://api.resend.com/emails"); assert.equal(init.headers["Idempotency-Key"], "unique-test-key"); assert.equal(JSON.parse(init.body).from, "sender@example.com"); return new Response("{}", { status: 200 }); }) as typeof fetch;
 await sendEmail("recipient@example.com", "Test", "Body", "unique-test-key");
 console.log("PASS Gmail credential validation, whitespace normalization, TLS, authenticated sender, delivery rejection, sanitized errors, connection cleanup and Resend compatibility (no real email sent)");
} finally {
 nodemailer.createTransport = originalTransport; globalThis.fetch = originalFetch;
 for (const key of Object.keys(process.env)) if (!(key in oldEnv)) delete process.env[key]; Object.assign(process.env, oldEnv);
}
