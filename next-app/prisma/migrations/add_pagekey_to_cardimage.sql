-- Migration: Ajouter pageKey à CardImage
-- Date: 2026-03-19

-- 1. Ajouter la colonne pageKey avec valeur par défaut 'home'
ALTER TABLE "CardImage"
ADD COLUMN IF NOT EXISTS "pageKey" TEXT NOT NULL DEFAULT 'home';

-- 2. Supprimer l'ancienne contrainte unique sur cardKey
ALTER TABLE "CardImage"
DROP CONSTRAINT IF EXISTS "CardImage_cardKey_key";

-- 3. Créer une nouvelle contrainte unique sur (pageKey, cardKey)
ALTER TABLE "CardImage"
ADD CONSTRAINT "CardImage_pageKey_cardKey_key" UNIQUE ("pageKey", "cardKey");

-- 4. Créer un index sur pageKey pour performance
CREATE INDEX IF NOT EXISTS "CardImage_pageKey_idx" ON "CardImage"("pageKey");
