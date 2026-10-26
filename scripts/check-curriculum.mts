import assert from "node:assert/strict";
import { applyCurriculum, buildSeedLessons } from "../lib/lessons.ts";
for (const layout of ["TR", "F"] as const) {
 const lessons = buildSeedLessons(layout);
 assert.equal(lessons.length, 100);
 assert.equal(new Set(lessons.map(row => row.content)).size, 100, "Every lesson must have different text");
 assert.equal(new Set(lessons.map(row => row.title)).size, 100);
 assert.equal(new Set(lessons.map(row => row.slug)).size, 100);
 lessons.forEach((lesson, index) => { assert.equal(lesson.levelNumber, index + 1); assert.equal(lesson.content.trim(), lesson.content); assert.ok(lesson.content.length > 10); assert.equal(lesson.isPremium, index >= 20); });
 for (const lesson of lessons.slice(0,20)) { assert.equal(lesson.minWpm, 0); for (const char of lesson.content) assert.ok(char === " " || lesson.focusKeys.includes(char), "A beginner drill must only contain its focus keys"); }
 const average = (rows: typeof lessons) => rows.reduce((sum,row) => sum + row.content.length,0) / rows.length;
 assert.ok(average(lessons.slice(80)) > average(lessons.slice(60,80)), "Final passages should be longer");
 const old = { ...lessons[0], id: "saved-lesson", content: "old unrelated text", isPublished: false, isPremium: true };
 const updated = applyCurriculum(old, layout);
 assert.equal(updated.content, lessons[0].content); assert.equal(updated.id,"saved-lesson"); assert.equal(updated.isPublished,false); assert.equal(updated.isPremium,true);
 const custom = { slug:"custom-lesson", levelNumber:1, content:"keep custom text" };
 assert.equal(applyCurriculum(custom,layout),custom);
 console.log("PASS " + layout + ": 100 distinct lessons, gradual drills, later long passages, identity/access preserved");
}
const q = buildSeedLessons();
assert.ok(q[0].content.startsWith("ff jj")); assert.ok(q[1].content.startsWith("dd kk"));
for (const lesson of q.slice(0,40)) assert.equal(lesson.content,lesson.content.toLocaleLowerCase("tr-TR"));
for (const lesson of q.slice(0,48)) assert.ok(!/[0-9]/.test(lesson.content), "Numbers are introduced at lesson 49");
console.log("PASS Q progression: F/J then D/K; lowercase before capitals; digits introduced separately");
