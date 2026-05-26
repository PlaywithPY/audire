# Sprint 5.8 — Patch Prisma (automatisé)

## ⚡ TL;DR — une seule commande

Depuis la racine du repo, après avoir dézippé la livraison :

```bash
node prisma/patch-sprint5-8.mjs
```

Le script :
1. fait un backup de `prisma/schema.prisma` (→ `schema.prisma.backup-sprint5-8`)
2. ajoute 2 champs `String?` (`sectionKickers` et `heroBadges`) sur `HearingAid`
3. lance `npx prisma db push --accept-data-loss`
4. lance `npx prisma generate`

Le script est **idempotent** : tu peux le relancer, il détecte les marqueurs
`// === Sprint 5.8 BEGIN ===` / `// === Sprint 5.8 END ===` et ne touche
plus à rien si c'est déjà patché.

## ✅ Sécurité

- Les deux champs sont **nullables** (`String?`) → aucune perte de données,
  aucun appareil existant n'a besoin d'être touché.
- Si tes appareils ont déjà `sectionKickers = null`, les helpers `parseKickers()`
  et `parseHeroBadges()` retombent automatiquement sur les valeurs hardcodées
  d'avant ("Tout ce qu'il vous faut", "Essai gratuit 30 jours", etc.).
- → **Zéro régression visuelle** au déploiement.

## 🧑‍🔧 Patch manuel (si jamais le script ne tourne pas)

Édite `prisma/schema.prisma`, trouve `model HearingAid { … }`, ajoute ces 2
lignes n'importe où dans le modèle (idéalement à côté de `blockVisibility`
et `imagePositions`) :

```prisma
model HearingAid {
  // … champs existants …
  blockVisibility   String?   // déjà présent
  imagePositions    String?   // déjà présent

  // ▼▼▼ Sprint 5.8 ▼▼▼
  /// JSON : { promises, section1, section2, highlight1, section3, section4, highlight2, accessories }
  sectionKickers    String?
  /// JSON : [{ text: string, dotColor: string }]
  heroBadges        String?
  // ▲▲▲ Sprint 5.8 ▲▲▲
}
```

Puis lance :

```bash
npx prisma db push --accept-data-loss
npx prisma generate
```

## 🧪 Alternative SQL pure (si tu gères ta DB à la main)

```sql
ALTER TABLE "HearingAid"
  ADD COLUMN "sectionKickers" TEXT,
  ADD COLUMN "heroBadges"     TEXT;
```

(Pense quand même à mettre à jour `schema.prisma` sinon le client Prisma
ne reconnaîtra pas les champs.)
