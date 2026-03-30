-- Migration: Ajout du champ smsConsent pour le consentement SMS séparé

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "smsConsent" BOOLEAN NOT NULL DEFAULT false;

-- UpdateData: Pour les rendez-vous existants avec un téléphone,
-- on peut considérer qu'ils ont implicitement donné leur consentement
-- UPDATE "Appointment" SET "smsConsent" = true WHERE "phone" IS NOT NULL;
-- Commenté car il vaut mieux laisser à false par défaut pour respecter le RGPD
