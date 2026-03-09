-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OpeningHours" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dayOfWeek" INTEGER NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "morningOpen" TEXT,
    "morningClose" TEXT,
    "afternoonOpen" TEXT,
    "afternoonClose" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ThemeColors" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "primary" TEXT NOT NULL DEFAULT '#42a4ff',
    "primaryLight" TEXT NOT NULL DEFAULT '#5ab3ff',
    "primaryDark" TEXT NOT NULL DEFAULT '#2d87e6',
    "secondary" TEXT NOT NULL DEFAULT '#EBF5FF',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CardImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cardKey" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "fallbackEmoji" TEXT NOT NULL DEFAULT '📷',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SectionBackground" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sectionKey" TEXT NOT NULL,
    "imageUrl" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteSettings_key_key" ON "SiteSettings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "OpeningHours_dayOfWeek_key" ON "OpeningHours"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "CardImage_cardKey_key" ON "CardImage"("cardKey");

-- CreateIndex
CREATE UNIQUE INDEX "SectionBackground_sectionKey_key" ON "SectionBackground"("sectionKey");
