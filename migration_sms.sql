-- Migration pour ajouter le système de gestion SMS
-- À exécuter manuellement dans votre base de données PostgreSQL

-- 1. Créer la table SMSTemplate pour les modèles SMS préfabriqués
CREATE TABLE IF NOT EXISTS "SMSTemplate" (
    "id" SERIAL PRIMARY KEY,
    "templateKey" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "variables" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Créer les index pour SMSTemplate
CREATE INDEX IF NOT EXISTS "SMSTemplate_templateKey_idx" ON "SMSTemplate"("templateKey");
CREATE INDEX IF NOT EXISTS "SMSTemplate_isActive_idx" ON "SMSTemplate"("isActive");

-- 2. Ajouter les colonnes de rappel SMS à la table Appointment
ALTER TABLE "Appointment"
ADD COLUMN IF NOT EXISTS "reminderSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "reminderDaysBefore" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS "reminderDate" TIMESTAMP(3);

-- Créer l'index pour les rappels
CREATE INDEX IF NOT EXISTS "Appointment_reminderDate_reminderSent_idx"
ON "Appointment"("reminderDate", "reminderSent");

-- 3. Insérer les modèles SMS par défaut
INSERT INTO "SMSTemplate" ("templateKey", "name", "content", "variables", "description", "isActive")
VALUES
(
    'confirmation_demande',
    'Confirmation de la demande',
    'Bonjour {firstName}, nous avons bien reçu votre demande de rendez-vous chez {centre}. Nous vous confirmons votre rendez-vous le {date} à {time}. À bientôt ! Audire',
    '["firstName", "lastName", "centre", "date", "time"]',
    'Envoyé dès qu''un client demande un rendez-vous',
    true
),
(
    'confirmation_rdv',
    'Confirmation du rendez-vous',
    'Bonjour {firstName} {lastName}, votre rendez-vous chez {centre} est confirmé pour le {date} à {time}. Merci de vous présenter 5 minutes avant. Audire',
    '["firstName", "lastName", "centre", "date", "time", "address"]',
    'Envoyé après validation par l''administrateur',
    true
),
(
    'rappel_rdv',
    'Rappel de rendez-vous',
    'Bonjour {firstName}, nous vous rappelons votre rendez-vous chez {centre} le {date} à {time}. Adresse : {address}. À très bientôt ! Audire',
    '["firstName", "lastName", "centre", "date", "time", "address", "daysBefore"]',
    'Envoyé automatiquement 1 à 3 jours avant le rendez-vous',
    true
),
(
    'annulation_rdv',
    'Annulation du rendez-vous',
    'Bonjour {firstName}, votre rendez-vous du {date} à {time} chez {centre} a été annulé. Pour reprendre un nouveau rendez-vous, contactez-nous. Audire',
    '["firstName", "lastName", "centre", "date", "time"]',
    'Envoyé en cas d''annulation du rendez-vous',
    true
)
ON CONFLICT ("templateKey") DO NOTHING;

-- 4. Mettre à jour les rendez-vous existants avec une date de rappel
-- (Uniquement pour les RDV confirmés qui n'ont pas encore de date de rappel)
UPDATE "Appointment" a
SET
    "reminderDate" = (
        SELECT
            TIMESTAMP WITH TIME ZONE (
                TO_CHAR(ts.date, 'YYYY-MM-DD') || ' ' || ts."startTime" || ':00'
            ) - INTERVAL '1 day'
        FROM "TimeSlot" ts
        WHERE ts.id = a."timeSlotId"
    ),
    "reminderDaysBefore" = 1
WHERE
    a.status = 'confirmed'
    AND a."timeSlotId" IS NOT NULL
    AND a."reminderDate" IS NULL;

-- Afficher un résumé
SELECT 'Migration terminée avec succès !' as message;
SELECT COUNT(*) as "Nombre de modèles SMS créés" FROM "SMSTemplate";
SELECT COUNT(*) as "Nombre de rendez-vous mis à jour" FROM "Appointment" WHERE "reminderDate" IS NOT NULL;
