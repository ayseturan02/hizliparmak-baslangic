import assert from "node:assert/strict";
import { validateRuntimeEnv } from "../lib/runtime-env.ts";
import { paymentsEnabled } from "../lib/payments.ts";
const good = { DATABASE_URL:"postgresql://example:secret@db.example.com/app", AUTH_SECRET:"a".repeat(48), UPSTASH_REDIS_REST_URL:"https://redis.example.com", UPSTASH_REDIS_REST_TOKEN:"example", NEXT_PUBLIC_APP_URL:"https://example.com" };
assert.deepEqual(validateRuntimeEnv(good,true),[]);
for (const key of Object.keys(good)) { const env = {...good}; delete env[key as keyof typeof env]; assert.ok(validateRuntimeEnv(env,true).length, key); }
for (const host of ["localhost","127.0.0.1","[::1]","0.0.0.0","db.localhost"]) assert.ok(validateRuntimeEnv({...good,DATABASE_URL:"postgresql://user:pass@"+host+"/app"},true).length);
assert.ok(validateRuntimeEnv({...good,AUTH_SECRET:"replace-this-with-a-long-random-secret-before-running"},true).length);
assert.ok(validateRuntimeEnv({...good,UPSTASH_REDIS_REST_URL:"http://redis.example.com"},true).length);
assert.ok(validateRuntimeEnv({...good,NEXT_PUBLIC_APP_URL:"https://example.com/callback"},true).length);
assert.deepEqual(validateRuntimeEnv({...good,DATABASE_URL:"postgresql://user:pass@localhost/app",NEXT_PUBLIC_APP_URL:"http://localhost:3000"},false),[]);
const keys = { IYZICO_API_KEY:"example", IYZICO_SECRET_KEY:"example", NEXT_PUBLIC_APP_URL:"https://example.com" };
assert.equal(paymentsEnabled(keys), false);
assert.equal(paymentsEnabled({...keys,PAYMENTS_ENABLED:"true"}), false);
assert.equal(paymentsEnabled({...keys,PAYMENTS_ENABLED:"true",PAYMENT_PROVIDER:"iyzico"}), true);
assert.equal(paymentsEnabled({...keys,PAYMENTS_ENABLED:"true",PAYMENT_PROVIDER:"iyzico",IYZICO_SECRET_KEY:""}), false);
console.log("PASS production environment validation, localhost rejection, placeholders, and explicit payment activation guards");
