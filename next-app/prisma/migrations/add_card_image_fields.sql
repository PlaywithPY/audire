-- Migration: Ajout des champs pour les feature cards
-- À exécuter sur votre base de données PostgreSQL

ALTER TABLE "CardImage"
ADD COLUMN "imagePosition" TEXT NOT NULL DEFAULT 'center center',
ADD COLUMN "href" TEXT,
ADD COLUMN "title" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "imageAlt" TEXT;

-- Note: Cette migration ajoute les champs nécessaires pour gérer:
-- - imagePosition: Position de l'image dans la card (object-position CSS)
-- - href: Lien vers une page
-- - title: Titre de la card
-- - description: Description de la card
-- - imageAlt: Texte alternatif pour l'image
