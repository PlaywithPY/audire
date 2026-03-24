-- Migration: Création de la table PageText pour les textes éditables
-- Cette table permet de gérer tous les textes du site depuis l'admin

CREATE TABLE IF NOT EXISTS "PageText" (
  "id" SERIAL PRIMARY KEY,
  "pageKey" TEXT NOT NULL,
  "textKey" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "label" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PageText_pageKey_textKey_key" UNIQUE ("pageKey", "textKey")
);

-- Index pour améliorer les performances des requêtes par pageKey
CREATE INDEX IF NOT EXISTS "PageText_pageKey_idx" ON "PageText"("pageKey");
