-- Migration: Ajouter la table ImageEffect pour les images avec effets CSS
-- À exécuter sur votre base de données Neon

CREATE TABLE IF NOT EXISTS "ImageEffect" (
  "id" SERIAL PRIMARY KEY,
  "imageUrl" TEXT NOT NULL,
  "effectType" TEXT NOT NULL DEFAULT 'none',
  "effectSpeed" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  "effectScale" DOUBLE PRECISION NOT NULL DEFAULT 1.2,
  "pageKey" TEXT NOT NULL,
  "sectionKey" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isVisible" BOOLEAN NOT NULL DEFAULT true,
  "alt" TEXT,
  "overlayColor" TEXT,
  "minHeight" TEXT NOT NULL DEFAULT '400px',
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index pour la recherche par page
CREATE INDEX IF NOT EXISTS "ImageEffect_pageKey_order_idx" ON "ImageEffect"("pageKey", "order");

-- Contrainte d'unicité pour pageKey + sectionKey
ALTER TABLE "ImageEffect"
ADD CONSTRAINT "ImageEffect_pageKey_sectionKey_key" UNIQUE ("pageKey", "sectionKey");

-- Commentaire
COMMENT ON TABLE "ImageEffect" IS 'Images avec effets CSS (parallax, zoom, fade, etc.) entre les sections de page';
