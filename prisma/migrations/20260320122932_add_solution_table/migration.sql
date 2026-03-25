-- CreateTable
CREATE TABLE IF NOT EXISTS "Solution" (
    "id" SERIAL NOT NULL,
    "solutionKey" TEXT NOT NULL,
    "fullDesc" TEXT NOT NULL,
    "detailImage" TEXT,
    "detailEmoji" TEXT NOT NULL DEFAULT '🎧',
    "pros" TEXT NOT NULL,
    "cons" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Solution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Solution_solutionKey_key" ON "Solution"("solutionKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Solution_solutionKey_idx" ON "Solution"("solutionKey");
