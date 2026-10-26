import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { getCurriculumLesson } from "../lib/lessons.ts";
if (!process.env.DATABASE_URL) process.loadEnvFile(".env");
const index = process.argv.indexOf("--base");
const base = index >= 0 ? process.argv[index + 1] : "http://localhost:3000";
const tag = "check_" + randomBytes(5).toString("hex");
const email = tag + "@example.com", password = randomBytes(24).toString("base64url") + "7a";
const db = new PrismaClient();
let cookie = "", id: string | undefined;
async function api(path: string, method = "GET", body?: unknown, extra: Record<string,string> = {}) {
  return fetch(base + path, { method, redirect: "manual", headers: { ...(cookie ? { Cookie: cookie } : {}), ...(body === undefined ? {} : { "Content-Type": "application/json" }), ...extra }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}
try {
  assert.equal((await api("/api/me")).status,401);
  assert.equal((await api("/api/me","PATCH",{keyboardLayout:"F"})).status,401);
  const register=await api("/api/auth/register","POST",{ email, username:tag, password });
  assert.equal(register.status,201,"Registration must succeed");
  id=(await register.json()).user.id;
  const setCookie=register.headers.get("set-cookie") || "";
  assert.match(setCookie,/HttpOnly/i); assert.match(setCookie,/SameSite=lax/i);
  if (base.startsWith("https:")) assert.match(setCookie,/Secure/i);
  cookie=setCookie.split(";")[0];
  const me=await (await api("/api/me")).json(); assert.equal(me.user.id,id); assert.equal(me.user.passwordHash,undefined);
  assert.equal((await api("/api/me","PATCH",{role:"ADMIN"})).status,400);
  assert.equal((await api("/api/me","PATCH",{profilePublic:false},{Origin:"https://untrusted.example"})).status,403);
  assert.equal((await api("/api/me","PATCH",{keyboardLayout:"invalid"})).status,400);
  assert.equal((await api("/api/me","PATCH",{keyboardLayout:"F",profilePublic:false,showOnLeaderboard:false})).status,200);
  const lesson=getCurriculumLesson("asama-001","F")!;
  const progress=await api("/api/progress","POST",{slug:lesson.slug,typed:lesson.content,elapsedSeconds:60});
  assert.equal(progress.status,201); assert.equal((await progress.json()).passed,true);
  assert.equal((await api("/profil/"+tag)).status,404);
  const logout=await api("/api/auth/logout","POST"); assert.equal(logout.status,303); assert.match(logout.headers.get("set-cookie") || "",/Max-Age=0/i); cookie="";
  assert.equal((await api("/api/me")).status,401);
  const login=await api("/api/auth/login","POST",{email,password}); assert.equal(login.status,200); cookie=(login.headers.get("set-cookie")||"").split(";")[0];
  const restored=(await (await api("/api/me")).json()).user;
  assert.equal(restored.keyboardLayout,"F"); assert.equal(restored.profilePublic,false); assert.equal(restored.showOnLeaderboard,false);
  assert.equal(await db.lessonProgress.count({where:{userId:id,completed:true}}),1);
  const lessonPage=await api("/ders/asama-001"); assert.equal(lessonPage.status,200); assert.ok((await lessonPage.text()).includes("Türkçe F"));
  console.log("PASS registration, secure cookie, preference persistence, private profile, F lesson completion, logout and relogin");
  assert.equal((await api("/api/me/delete","POST",{password,confirmation:"wrong"})).status,400);
  assert.equal((await api("/api/me/delete","POST",{password:"wrong-password",confirmation:"HESABIMI SİL"})).status,400);
  const order=await db.order.create({data:{userId:id!,amountMinor:100,currency:"TRY",idempotencyKey:tag}});
  try { assert.equal((await api("/api/me/delete","POST",{password,confirmation:"HESABIMI SİL"})).status,409); }
  finally { await db.order.delete({where:{id:order.id}}); }
  const removed=await api("/api/me/delete","POST",{password,confirmation:"HESABIMI SİL"}); assert.equal(removed.status,200);
  assert.match(removed.headers.get("set-cookie") || "",/Max-Age=0/i);
  assert.equal(await db.user.count({where:{id}}),0); assert.equal(await db.typingResult.count({where:{userId:id}}),0); assert.equal(await db.lessonProgress.count({where:{userId:id}}),0);
  assert.equal((await api("/api/me")).status,401);
  console.log("PASS account mutation allowlist, cross-origin rejection, password confirmation, payment-history safeguard and complete test-account cleanup");
} finally {
  // Only the uniquely named account created by this run can be removed here.
  const test=await db.user.findUnique({where:{email},select:{id:true,username:true}});
  if(test && test.username===tag){ await db.order.deleteMany({where:{userId:test.id,idempotencyKey:tag}}); await db.typingResult.deleteMany({where:{userId:test.id}}); await db.user.delete({where:{id:test.id}}); }
  await db.$disconnect();
}
