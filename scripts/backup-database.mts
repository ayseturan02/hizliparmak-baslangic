import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { parseEnv } from "node:util";
import { randomBytes, createCipheriv, createDecipheriv, createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { PrismaClient, Prisma } from "@prisma/client";
const arg = (name: string) => { const i=process.argv.indexOf(name); return i < 0 ? undefined : process.argv[i+1]; };
const sourceFile=arg("--source-env"), keyFile=arg("--key-file");
const source=sourceFile ? parseEnv(readFileSync(sourceFile,"utf8")) : process.env;
const sourceUrl=source.DATABASE_URL_UNPOOLED || source.DATABASE_URL;
if(!sourceUrl) throw new Error("Source DATABASE_URL is missing.");
const key=Buffer.from(keyFile ? readFileSync(keyFile,"utf8").trim() : process.env.BACKUP_ENCRYPTION_KEY || "", "base64");
if(key.length!==32) throw new Error("Backup encryption key must decode to 32 bytes.");
// Parent records must precede their dependents when restoring.
const order=["User","AuthToken","UserBlock","ContentReport","RaceAttempt","Lesson","Plan","Achievement","Race","SiteSetting","Announcement","WeeklyContest","PaymentEvent","Order","Subscription","LessonProgress","TypingResult","Friendship","UserAchievement","DailyActivity","RaceParticipant","WeeklyContestEntry","ChatMessage","Question","Answer"];
assert.deepEqual([...order].sort(),Prisma.dmmf.datamodel.models.map(m=>m.name).sort(),"Update the backup dependency order when adding Prisma models");
const delegate=(name: string)=>name[0].toLowerCase()+name.slice(1);
const schema=readFileSync("prisma/schema.prisma","utf8");
const sourceDb=new PrismaClient({datasources:{db:{url:sourceUrl}}});
try {
  const records: Record<string,Record<string,unknown>[]> = await sourceDb.$transaction(async tx=>{
    const rows: Record<string,Record<string,unknown>[]>={};
    const tables = await tx.$queryRaw<{ tablename: string }[]>`SELECT tablename FROM pg_tables WHERE schemaname = current_schema()`;
    const existing = new Set(tables.map(t => t.tablename));
    // A pre-migration snapshot must also work while optional new tables/columns do not exist yet.
    // Table names come exclusively from the fixed, model-validated dependency order above.
    for(const name of order) rows[name] = existing.has(name) ? await tx.$queryRawUnsafe<Record<string,unknown>[]>('SELECT * FROM "' + name + '"') : [];
    return rows;
  },{isolationLevel:Prisma.TransactionIsolationLevel.RepeatableRead,maxWait:10000,timeout:120000});
  const plain=JSON.stringify({format:"hp-data-v1",createdAt:new Date().toISOString(),schema,records});
  const iv=randomBytes(12), cipher=createCipheriv("aes-256-gcm",key,iv);
  const encrypted=Buffer.concat([cipher.update(plain,"utf8"),cipher.final()]);
  const envelope={format:"hp-encrypted-v1",iv:iv.toString("base64"),tag:cipher.getAuthTag().toString("base64"),ciphertext:encrypted.toString("base64")};
  const directory=resolve(".vercel","backups"); mkdirSync(directory,{recursive:true});
  const destination=resolve(directory,new Date().toISOString().replace(/[:.]/g,"-")+".hpbackup");
  writeFileSync(destination,JSON.stringify(envelope),{encoding:"utf8",flag:"wx",mode:0o600});
  // Read back the actual file and authenticate the ciphertext before reporting success.
  const saved=JSON.parse(readFileSync(destination,"utf8"));
  const decipher=createDecipheriv("aes-256-gcm",key,Buffer.from(saved.iv,"base64")); decipher.setAuthTag(Buffer.from(saved.tag,"base64"));
  const decoded=JSON.parse(Buffer.concat([decipher.update(Buffer.from(saved.ciphertext,"base64")),decipher.final()]).toString("utf8"));
  assert.equal(createHash("sha256").update(JSON.stringify(decoded)).digest("hex"),createHash("sha256").update(plain).digest("hex"));
  console.log("PASS encrypted database snapshot saved and authenticated: "+destination);
  console.log("Row counts: "+JSON.stringify(Object.fromEntries(order.map(name=>[name,decoded.records[name].length]))));
  if(process.argv.includes("--verify-local")) {
    const local=parseEnv(readFileSync(".env","utf8")); const target=new URL(local.DATABASE_URL);
    if(!["localhost","127.0.0.1","[::1]"].includes(target.hostname)) throw new Error("Restore verification is allowed only on local PostgreSQL.");
    const testSchema="hp_backup_check_"+Date.now();
    if(!/^hp_backup_check_[0-9]+$/.test(testSchema)) throw new Error("Unsafe schema name");
    const localDb=new PrismaClient({datasources:{db:{url:target.toString()}}});
    target.searchParams.set("schema",testSchema);
    const restoredDb=new PrismaClient({datasources:{db:{url:target.toString()}}});
    try {
      await localDb.$executeRawUnsafe('CREATE SCHEMA "'+testSchema+'"');
      const migration=spawnSync(process.execPath,["node_modules/prisma/build/index.js","migrate","deploy"],{env:{...process.env,DATABASE_URL:target.toString()},windowsHide:true,encoding:"utf8",timeout:120000});
      if(migration.status!==0) throw new Error("Could not migrate the isolated restore schema.");
      await restoredDb.$transaction(async tx=>{
        for(const name of order) {
          const model=Prisma.dmmf.datamodel.models.find(m=>m.name===name)!;
          const dates=model.fields.filter(f=>f.type==="DateTime").map(f=>f.name);
          const data=decoded.records[name].map((record: Record<string,unknown>)=>Object.fromEntries(Object.entries(record).map(([k,v])=>[k,v!==null && dates.includes(k)?new Date(v as string):v])));
          if(data.length) await (tx as any)[delegate(name)].createMany({data});
        }
      },{maxWait:10000,timeout:120000});
      for(const name of order) {
        const actual=await (restoredDb as any)[delegate(name)].findMany();
        const stable=(rows: Record<string,unknown>[])=>rows.map(row=>JSON.stringify(Object.fromEntries(Object.entries(row).sort(([a],[b])=>a.localeCompare(b))))).sort();
        assert.deepEqual(stable(JSON.parse(JSON.stringify(actual))),stable(decoded.records[name]),"Restored records differ: "+name);
      }
      console.log("PASS all tables restored into an isolated local schema and every record matched the encrypted backup.");
    } finally {
      await restoredDb.$disconnect();
      await localDb.$executeRawUnsafe('DROP SCHEMA IF EXISTS "'+testSchema+'" CASCADE');
      await localDb.$disconnect();
      console.log("Temporary restore schema removed; existing local application data preserved.");
    }
  }
} finally { await sourceDb.$disconnect(); }
