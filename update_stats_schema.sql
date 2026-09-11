-- AlterTable
ALTER TABLE "UserProgress" ADD COLUMN "timesWrong" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "timesRight" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "GlobalStat" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "totalMinutesSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "GlobalStat_pkey" PRIMARY KEY ("id")
);
