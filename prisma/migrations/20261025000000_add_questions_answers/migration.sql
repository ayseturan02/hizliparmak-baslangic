
CREATE TABLE "Question" (
 "id" TEXT NOT NULL PRIMARY KEY,
 "userId" TEXT NOT NULL,
 "title" VARCHAR(160) NOT NULL,
 "content" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "Question_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "Answer" (
 "id" TEXT NOT NULL PRIMARY KEY,
 "questionId" TEXT NOT NULL,
 "userId" TEXT NOT NULL,
 "content" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT "Answer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Question_createdAt_id_idx" ON "Question"("createdAt", "id");
CREATE INDEX "Answer_questionId_createdAt_id_idx" ON "Answer"("questionId", "createdAt", "id");
