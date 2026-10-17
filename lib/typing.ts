export type TypingStats = { wpm: number; accuracy: number; correctChars: number; incorrectChars: number; elapsedSeconds: number };
/** Standardized estimate: 5 typed characters = one word. */
export function calculateTypingStats(target: string, typed: string, elapsedSeconds: number): TypingStats {
  const elapsed = Math.max(1, elapsedSeconds);
  const len = Math.min(typed.length, target.length);
  let correctChars = 0;
  for (let i = 0; i < len; i++) if (typed[i] === target[i]) correctChars++;
  const incorrectChars = Math.max(0, typed.length - correctChars);
  const accuracy = typed.length === 0 ? 100 : Math.round((correctChars / typed.length) * 10000) / 100;
  const wpm = Math.round((correctChars / 5 / (elapsed / 60)) * 100) / 100;
  return { wpm, accuracy, correctChars, incorrectChars, elapsedSeconds: elapsed };
}
