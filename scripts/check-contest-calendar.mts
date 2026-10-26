import assert from "node:assert/strict";
import { currentContestWindow } from "../lib/contest-calendar.ts";
for(const tz of ["UTC","Europe/Istanbul","America/New_York"]) {
  process.env.TZ=tz;
  const monday=currentContestWindow(new Date("2026-10-25T21:00:00Z"));
  assert.equal(monday.startsAt.toISOString(),"2026-10-25T21:00:00.000Z");
  assert.equal(monday.endsAt.toISOString(),"2026-11-01T20:59:59.999Z");
  assert.equal(monday.titleDate,"26.10.2026");
  const sunday=currentContestWindow(new Date("2026-10-25T20:59:59Z"));
  assert.equal(sunday.startsAt.toISOString(),"2026-10-18T21:00:00.000Z");
  const year=currentContestWindow(new Date("2027-01-01T10:00:00Z"));
  assert.equal(year.startsAt.toISOString(),"2026-12-27T21:00:00.000Z");
}
console.log("PASS Istanbul week boundaries, Sunday/Monday transition and year boundary in three server time zones");
