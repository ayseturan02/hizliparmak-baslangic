const zone = "Europe/Istanbul";
const parts = (date: Date) => Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(date).filter(p => p.type !== "literal").map(p => [p.type, Number(p.value)]));
function midnight(day: number) {
  let instant = day;
  for (let i=0;i<2;i++) {
    const p=parts(new Date(instant));
    const offset=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second)-instant;
    instant=day-offset;
  }
  return new Date(instant);
}
export function currentContestWindow(now = new Date()) {
  const p=parts(now);
  const calendarDay=Date.UTC(p.year,p.month-1,p.day);
  const weekday=new Date(calendarDay).getUTCDay();
  const monday=calendarDay-((weekday+6)%7)*86400000;
  const startsAt=midnight(monday), endsAt=new Date(midnight(monday+7*86400000).getTime()-1);
  return { startsAt, endsAt, titleDate: startsAt.toLocaleDateString("tr-TR", { timeZone: zone }) };
}
