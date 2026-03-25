-- Migration: Création de la table FAQ pour les questions fréquentes

-- CreateTable
CREATE TABLE IF NOT EXISTS "FAQ" (
  "id" SERIAL NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isVisible" BOOLEAN NOT NULL DEFAULT true,
  "category" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FAQ_order_isVisible_idx" ON "FAQ"("order", "isVisible");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FAQ_category_idx" ON "FAQ"("category");
