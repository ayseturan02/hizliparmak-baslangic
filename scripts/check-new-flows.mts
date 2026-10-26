import assert from "node:assert/strict";
import { resolve, sep } from "node:path";
import { randomBytes, createHash, createDecipheriv } from "node:crypto";
import { readFileSync, readdirSync, mkdirSync, writeFileSync, cpSync, rmSync } from "node:fs";
import { parseEnv } from "node:util";
import { spawn, spawnSync } from "node:child_process";
import { PrismaClient, Prisma } from "@prisma/client";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { practiceTexts } from "../lib/practice-texts.ts";
const local = parseEnv(readFileSync(".env", "utf8"));
const target = new URL(local.DATABASE_URL);
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(target.hostname), "Test database must be local");
const schema = "hp_launch_check_" + Date.now();
const root = new PrismaClient({ datasources: { db: { url: target.toString() } } });
target.searchParams.set("schema", schema);
const baseline = ".vercel/migration-check-" + Date.now();
const db = new PrismaClient({ datasources: { db: { url: target.toString() } } });
const secret = randomBytes(48).toString("hex"), base = "http://localhost:3001";
const hash = (v: string) => createHash("sha256").update(v).digest("hex");
let server: ReturnType<typeof spawn> | undefined;
async function api(path: string, body?: unknown, cookie?: string, origin = base) {
 return fetch(base + path, { method: body === undefined ? "GET" : "POST", headers: { ...(body === undefined ? {} : { "Content-Type": "application/json", Origin: origin }), ...(cookie ? { Cookie: cookie } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}
async function session(id: string, version = 0) { return "hp_session=" + await new SignJWT({ sub: id, version }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("30m").sign(new TextEncoder().encode(secret)); }
try {
 await root.$executeRawUnsafe('CREATE SCHEMA "' + schema + '"');
 mkdirSync(baseline + "/migrations", { recursive: true });
 writeFileSync(baseline + "/schema.prisma", readFileSync("prisma/schema.prisma"));
 for (const name of readdirSync("prisma/migrations")) if(name === "migration_lock.toml" || name < "20261026000000") cpSync("prisma/migrations/" + name, baseline + "/migrations/" + name, { recursive: true });
 const migrated = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy", "--schema", baseline + "/schema.prisma"], { env: { ...process.env, DATABASE_URL: target.toString() }, encoding: "utf8", windowsHide: true });
 assert.equal(migrated.status, 0, "All migrations must apply to an isolated schema");
 // Restore the previous encrypted production snapshot into the migrated schema.
 const files = readdirSync(".vercel/backups").filter(f => f.endsWith(".hpbackup")).sort();
 assert.ok(files.length, "A previous encrypted production snapshot is required");
 const envelope = JSON.parse(readFileSync(".vercel/backups/" + files[files.length - 1], "utf8"));
 const key = Buffer.from(readFileSync(".vercel/backup.key", "utf8").trim(), "base64");
 const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(envelope.iv, "base64")); decipher.setAuthTag(Buffer.from(envelope.tag, "base64"));
 const snapshot = JSON.parse(Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext, "base64")), decipher.final()]).toString("utf8"));
 for (const [name, records] of Object.entries(snapshot.records) as [string, Record<string, unknown>[]][]) {
  const model = Prisma.dmmf.datamodel.models.find(m => m.name === name)!;
  assert.ok(model, "Snapshot model must exist: " + name);
  const dates = model.fields.filter(f => f.type === "DateTime").map(f => f.name);
  const data = records.map(row => Object.fromEntries(Object.entries(row).map(([k,v]) => [k, v !== null && dates.includes(k) ? new Date(v as string) : v])));
  if (data.length) {
   const columns = Object.keys(data[0]);
   assert.ok(columns.every(c => model.fields.some(f => f.name === c && f.kind !== "object")), "Known model columns only");
   for (const row of data) await db.$executeRawUnsafe('INSERT INTO "' + name + '" (' + columns.map(c => '"'+c+'"').join(',') + ') VALUES (' + columns.map((c,i)=>'$'+(i+1)+(model.fields.find(f=>f.name===c)?.kind === 'enum' ? '::\"'+model.fields.find(f=>f.name===c)!.type+'\"' : model.fields.find(f=>f.name===c)?.type === 'DateTime' ? '::timestamp' : '')).join(',') + ')', ...columns.map(c=>row[c] instanceof Date ? (row[c] as Date).toISOString() : row[c]));
  }
 }
 const upgraded = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], { env: { ...process.env, DATABASE_URL: target.toString() }, encoding: "utf8", windowsHide: true });
 assert.equal(upgraded.status, 0, "New migrations must apply to restored production-like data");
 for (const [name, records] of Object.entries(snapshot.records) as [string, Record<string, unknown>[]][]) {
  const actual = await (db as any)[name[0].toLowerCase()+name.slice(1)].findMany();
  assert.equal(actual.length, records.length);
  for (const row of records) {
   const found = actual.find((r: any) => r.id === row.id && (row.id !== undefined || r.key === row.key));
   assert.ok(found);
   for (const [key,value] of Object.entries(row)) assert.deepEqual(JSON.parse(JSON.stringify(found[key])), value, name + "." + key);
  }
 }
 console.log("PASS all migrations and restoration of the prior encrypted production snapshot; existing fields preserved");
 server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", "3001"], { env: { ...process.env, ...local, DATABASE_URL: target.toString(), AUTH_SECRET: secret, NEXT_PUBLIC_APP_URL: base, NODE_ENV: "production", RESEND_API_KEY: "", EMAIL_FROM: "", ALERT_EMAIL: "" }, stdio: "ignore", windowsHide: true });
 let ready = false;
 for (let i=0;i<100;i++) { try { const r=await fetch(base+"/api/me"); if(r.status===401){ready=true;break;} }catch{} await new Promise(r=>setTimeout(r,200)); }
 assert.ok(ready, "Isolated test server must start");
 const password = "TestPassword9381", passwordHash = await bcrypt.hash(password, 12);
 const a=await db.user.create({data:{username:"flow_alpha",email:"flow_alpha@example.com",passwordHash}}), b=await db.user.create({data:{username:"flow_beta",email:"flow_beta@example.com",passwordHash}}), admin=await db.user.create({data:{username:"flow_admin",email:"flow_admin@example.com",passwordHash,role:"ADMIN"}});
 const ca=await session(a.id), cb=await session(b.id), cad=await session(admin.id);
 const verify=randomBytes(32).toString("hex");
 await db.authToken.create({data:{userId:a.id,purpose:"VERIFY",tokenHash:hash(verify),expiresAt:new Date(Date.now()+60000)}});
 assert.equal((await api("/api/auth/email/confirm",{purpose:"VERIFY",token:verify},ca,"https://evil.example")).status,403);
 assert.equal((await api("/api/auth/email/confirm",{purpose:"VERIFY",token:verify})).status,200);
 assert.ok((await db.user.findUniqueOrThrow({where:{id:a.id}})).emailVerifiedAt);
 assert.equal((await api("/api/auth/email/confirm",{purpose:"VERIFY",token:verify})).status,400);
 const expired=randomBytes(32).toString("hex");
 await db.authToken.create({data:{userId:a.id,purpose:"RESET",tokenHash:hash(expired),expiresAt:new Date(Date.now()-1000)}});
 assert.equal((await api("/api/auth/email/confirm",{purpose:"RESET",token:expired,password:"NewPassword1122"})).status,400);
 const reset=randomBytes(32).toString("hex"), other=randomBytes(32).toString("hex");
 for(const token of [reset,other])await db.authToken.create({data:{userId:a.id,purpose:"RESET",tokenHash:hash(token),expiresAt:new Date(Date.now()+60000)}});
 assert.equal((await api("/api/auth/email/confirm",{purpose:"RESET",token:reset,password:"NewPassword1122"})).status,200);
 assert.equal((await api("/api/me",undefined,ca)).status,401);
 assert.equal((await api("/api/auth/email/confirm",{purpose:"RESET",token:other,password:"OtherPassword1122"})).status,400);
 assert.ok(await bcrypt.compare("NewPassword1122",(await db.user.findUniqueOrThrow({where:{id:a.id}})).passwordHash));
 assert.equal((await api("/api/auth/email/request",{purpose:"RESET",email:a.email})).status,503);
 console.log("PASS verification, expired/replayed tokens, cross-origin rejection, password reset, sibling token revocation and old session rejection");
 const currentA=await session(a.id,1);
 const message=await db.chatMessage.create({data:{userId:b.id,content:"Test community message"}});
 const question=await db.question.create({data:{userId:b.id,title:"Test question title",content:"Test question content"}});
 const answer=await db.answer.create({data:{userId:b.id,questionId:question.id,content:"Test answer content"}});
 assert.equal((await api("/api/community/blocks",{username:b.username,blocked:true},currentA)).status,200);
 const visible=await (await api("/api/chat",undefined,currentA)).json();assert.ok(!visible.messages.some((m:any)=>m.id===message.id));
 const questions=await (await api("/api/questions",undefined,currentA)).json();assert.ok(!questions.questions.some((q:any)=>q.id===question.id));
 assert.equal((await api(`/api/questions/${question.id}/answers`,undefined,currentA)).status,404);
 assert.equal((await api(`/api/questions/${question.id}/answers`,{content:"Cannot reply to blocked author"},currentA)).status,404);
 assert.equal((await api("/api/community/blocks",{username:b.username,blocked:false},currentA)).status,200);
 assert.equal((await api(`/api/questions/${question.id}/answers`,undefined,currentA)).status,200);
 const reportBody={targetType:"ANSWER",targetId:answer.id,reason:"Test moderation report"};
 assert.equal((await api("/api/community/reports",reportBody,currentA)).status,200);
 assert.equal((await api("/api/community/reports",reportBody,currentA)).status,200);
 assert.equal(await db.contentReport.count({where:{reporterId:a.id}}),1);
 const report=await db.contentReport.findFirstOrThrow({where:{reporterId:a.id}});
 assert.equal((await api("/api/admin/moderation",{reportId:report.id,action:"REMOVE"},currentA)).status,403);
 assert.equal((await api("/api/admin/moderation",{reportId:report.id,action:"REMOVE"},cad)).status,200);
 assert.equal(await db.answer.count({where:{id:answer.id}}),0);
 await api("/api/community/reports",{targetType:"CHAT",targetId:message.id,reason:"Test suspension report"},currentA);
 const report2=await db.contentReport.findFirstOrThrow({where:{targetId:message.id}});
 assert.equal((await api("/api/admin/moderation",{reportId:report2.id,action:"SUSPEND"},cad)).status,200);
 assert.equal((await api("/api/chat",{content:"Must reject suspended user"},await session(b.id,1))).status,403);
 assert.equal((await api("/api/me",undefined,cb)).status,401);
 console.log("PASS report deduplication, community blocking/unblocking, blocked replies, admin-only removal, suspension and session revocation");
 const source=practiceTexts.find(t=>t.id.startsWith("gecmis-"))!, typed=source.text.slice(0,30);
 const full=await db.raceAttempt.create({data:{userId:a.id,durationSeconds:180,textId:source.id,startedAt:new Date(Date.now()-181000)}});
 const fullResult=await api("/api/race-results",{attemptId:full.id,typed,wpm:300},currentA);assert.equal(fullResult.status,201);
 const fullData=await fullResult.json();const saved=await db.typingResult.findUniqueOrThrow({where:{id:fullData.resultId}});assert.equal(saved.verified,true);assert.equal(saved.wpm,Number((typed.length/15).toFixed(2)));
 assert.equal((await api("/api/race-results",{attemptId:full.id,typed},currentA)).status,400);
 const short=await db.raceAttempt.create({data:{userId:a.id,durationSeconds:180,textId:source.id,startedAt:new Date(Date.now()-5000)}});
 const shortResult=await api("/api/race-results",{attemptId:short.id,typed},currentA);assert.equal(shortResult.status,201);
 assert.equal((await db.typingResult.findUniqueOrThrow({where:{id:(await shortResult.json()).resultId}})).verified,false);
 const stale=await db.raceAttempt.create({data:{userId:a.id,durationSeconds:180,textId:source.id,startedAt:new Date(Date.now()-220000)}});
 assert.equal((await api("/api/race-results",{attemptId:stale.id,typed},currentA)).status,400);
 const contest=await db.weeklyContest.create({data:{title:"Isolated weekly test",description:"Test",textContent:"A test sentence.",startsAt:new Date(Date.now()-60000),endsAt:new Date(Date.now()+600000),status:"ACTIVE"}});
 await db.weeklyContestEntry.create({data:{contestId:contest.id,userId:a.id}});
 assert.equal((await api("/api/weekly-contest/start",{contestId:contest.id},currentA)).status,201);
 assert.equal((await api("/api/weekly-contest/start",{contestId:contest.id},currentA)).status,409);
 await db.weeklyContestEntry.updateMany({where:{contestId:contest.id,userId:a.id},data:{startedAt:new Date(Date.now()-10000)}});
 assert.equal((await api("/api/weekly-contest/submit",{contestId:contest.id,typed:contest.textContent},currentA)).status,200);
 assert.equal((await api("/api/weekly-contest/submit",{contestId:contest.id,typed:contest.textContent},currentA)).status,409);
 console.log("PASS server-side timed/weekly race scoring, ignored client score claims, replay protection, early-finish exclusion and expiry");
 for(const path of ["/parolami-unuttum","/parola-sifirla","/eposta-dogrula","/cerez-politikasi"])assert.equal((await api(path)).status,200,path);
 const html=await (await api("/")).text();assert.ok(!/<script[^>]+src=["']https:\/\/pagead2\.googlesyndication\.com/.test(html));
 console.log("PASS new public pages and no AdSense script in initial HTML before consent");
} finally {
 if(server){server.kill();await new Promise(r=>setTimeout(r,500));}
 await db.$disconnect();
 await root.$executeRawUnsafe('DROP SCHEMA IF EXISTS "'+schema+'" CASCADE');
 await root.$disconnect();
 const cleanupPath = resolve(baseline);
 assert.ok(cleanupPath.startsWith(resolve(".vercel") + sep) && /^migration-check-[0-9]+$/.test(cleanupPath.split(sep).pop()!), "Cleanup stays inside project .vercel");
 rmSync(cleanupPath, { recursive: true, force: true });
 console.log("Isolated test schema removed; existing local and production application data preserved.");
}
