
-- Add the fields previously present only in developer databases.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "examScore" DOUBLE PRECISION;
CREATE TABLE IF NOT EXISTS "ChatMessage" (
 "id" TEXT NOT NULL,
 "userId" TEXT NOT NULL,
 "content" VARCHAR(500) NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");
CREATE INDEX IF NOT EXISTS "ChatMessage_userId_createdAt_idx" ON "ChatMessage"("userId", "createdAt");
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ChatMessage_userId_fkey' AND conrelid = '"ChatMessage"'::regclass) THEN
  ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
 END IF;
END $$;
