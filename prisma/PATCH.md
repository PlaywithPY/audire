# Patch Prisma — ajouter `blockVisibility`

## Où

Dans `prisma/schema.prisma`, modèle `HearingAid` (ligne ~178), section
"Positions des images", **avant** `updatedAt`.

## Ce qu'il faut ajouter

```prisma
  // Positions des images (object-position CSS)
  imagePositions String? // JSON object: {"mainImage": {"x": 50, "y": 50}, ...}

+ // Visibilité par bloc sur la page produit (v2)
+ // JSON: {"topbanner":true,"hero":true,"promises":true,"section-1":true,...}
+ // Si null/absent : tous les blocs sont visibles (rétrocompatibilité)
+ blockVisibility String?

  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())
```

## Appliquer

```bash
npx prisma db push --accept-data-loss
npx prisma generate
```

`--accept-data-loss` est sûr ici : le champ est optionnel, ajouté à la fin,
aucune donnée existante n'est touchée.

## Vérifier

```bash
npx prisma studio
```

Le modèle `HearingAid` doit afficher la nouvelle colonne `blockVisibility`
en `String?` (nullable).
