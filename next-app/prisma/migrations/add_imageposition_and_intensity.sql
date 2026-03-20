-- Migration: Ajouter imagePosition et effectIntensity à ImageEffect
-- Date: 2026-03-20

-- Ajouter imagePosition pour contrôler le centrage de l'image
ALTER TABLE "ImageEffect"
ADD COLUMN "imagePosition" TEXT DEFAULT 'center center';

-- Ajouter effectIntensity pour contrôler l'intensité globale de l'effet
ALTER TABLE "ImageEffect"
ADD COLUMN "effectIntensity" DOUBLE PRECISION DEFAULT 1.0;

COMMENT ON COLUMN "ImageEffect"."imagePosition" IS 'Position de l''image (object-position CSS, ex: "center 30%", "top center")';
COMMENT ON COLUMN "ImageEffect"."effectIntensity" IS 'Intensité de l''effet (0.1 = très subtil, 2.0 = très prononcé)';
