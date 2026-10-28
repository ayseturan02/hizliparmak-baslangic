import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export function lessonAttemptKey(slug: string, layout: string, content: string) {
  return `lesson:${slug}:${layout}:${createHash("sha256").update(content).digest("hex")}`;
}
export async function allowResultRequest(userId: string, action: "start" | "submit" | "export") {
  const limiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(action === "export" ? 3 : 60, "10 m"),
    prefix: `hp:results:${action}`,
  });
  return (await limiter.limit(userId)).success;
}
