-- Migration: Ajouter le champ effectDirection à ImageEffect
-- Date: 2026-03-20

ALTER TABLE "ImageEffect"
ADD COLUMN "effectDirection" TEXT DEFAULT 'down';

COMMENT ON COLUMN "ImageEffect"."effectDirection" IS 'Direction de l''effet: up, down, left, right';
