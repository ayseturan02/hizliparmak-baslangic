-- AlterTable
ALTER TABLE "User" ADD COLUMN     "examType" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "provinceMatchVisible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "targetProvince" TEXT;

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'DUYURU',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyContest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "textContent" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyContest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyContestEntry" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wpm" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyContestEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Announcement_published_publishedAt_idx" ON "Announcement"("published", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyContest_startsAt_key" ON "WeeklyContest"("startsAt");

-- CreateIndex
CREATE INDEX "WeeklyContest_status_startsAt_idx" ON "WeeklyContest"("status", "startsAt");

-- CreateIndex
CREATE INDEX "WeeklyContestEntry_contestId_wpm_idx" ON "WeeklyContestEntry"("contestId", "wpm");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyContestEntry_contestId_userId_key" ON "WeeklyContestEntry"("contestId", "userId");

-- AddForeignKey
ALTER TABLE "WeeklyContestEntry" ADD CONSTRAINT "WeeklyContestEntry_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "WeeklyContest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyContestEntry" ADD CONSTRAINT "WeeklyContestEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
