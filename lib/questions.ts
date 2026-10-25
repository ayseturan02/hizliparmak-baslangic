import { z } from "zod";
export const questionInput = z.object({ title: z.string().trim().min(5).max(160), content: z.string().trim().min(10).max(5000) });
export const answerInput = z.object({ content: z.string().trim().min(2).max(3000) });
export const authorSelect = { username: true } as const;
