CREATE TABLE "RaceAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "textId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "RaceAttempt_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RaceAttempt_userId_startedAt_idx" ON "RaceAttempt"("userId", "startedAt");

ALTER TABLE "RaceAttempt" ADD CONSTRAINT "RaceAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
