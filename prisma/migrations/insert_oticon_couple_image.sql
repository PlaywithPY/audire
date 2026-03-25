-- Migration: Ajouter l'image oticon-couple comme ImageEffect
-- Cette image était auparavant hardcodée dans la page d'accueil

INSERT INTO "ImageEffect" (
  "imageUrl",
  "effectType",
  "effectSpeed",
  "effectScale",
  "pageKey",
  "sectionKey",
  "order",
  "isVisible",
  "alt",
  "overlayColor",
  "minHeight",
  "createdAt",
  "updatedAt"
)
VALUES (
  '/images/oticon-couple.jpg',
  'parallax',
  0.6,
  1.2,
  'home',
  'after-hero',
  0,
  true,
  'Couple dans un environnement élégant avec Oticon',
  'rgba(0, 0, 0, 0.3)',
  '600px',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("pageKey", "sectionKey") DO UPDATE SET
  "imageUrl" = EXCLUDED."imageUrl",
  "effectType" = EXCLUDED."effectType",
  "effectSpeed" = EXCLUDED."effectSpeed",
  "effectScale" = EXCLUDED."effectScale",
  "alt" = EXCLUDED."alt",
  "overlayColor" = EXCLUDED."overlayColor",
  "minHeight" = EXCLUDED."minHeight",
  "updatedAt" = CURRENT_TIMESTAMP;
