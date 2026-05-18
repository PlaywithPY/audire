# Patch Prisma v2.1 — `ProductContentBlock` enrichi

## Où

Dans `prisma/schema.prisma`, modèle `ProductContentBlock` (vers la ligne 240).

## Ce qu'il faut ajouter

Trouve le bloc :

```prisma
model ProductContentBlock {
  id           Int        @id @default(autoincrement())
  hearingAidId Int
  hearingAid   HearingAid @relation(fields: [hearingAidId], references: [id], onDelete: Cascade)

  order     Int     @default(0)
  isVisible Boolean @default(true)
  ...
}
```

Et ajoute **3 champs** juste après `isVisible` :

```prisma
model ProductContentBlock {
  id           Int        @id @default(autoincrement())
  hearingAidId Int
  hearingAid   HearingAid @relation(fields: [hearingAidId], references: [id], onDelete: Cascade)

  order     Int     @default(0)
  isVisible Boolean @default(true)

+ // Type de bloc inséré (v2.1) : "text-media" | "gallery" | "highlight"
+ blockType String @default("text-media")
+
+ // ID du bloc fixe APRÈS lequel ce bloc s'insère (ex: "hero", "section-2")
+ afterBlockId String?
+
+ // Métadonnées spécifiques au type (JSON)
+ //   text-media : {} (utilise les champs natifs)
+ //   gallery    : { images: string[] }
+ //   highlight  : { ctaLabel?: string, ctaHref?: string }
+ metadata String?

  // Contenu du bloc
  title       String?
  description String?
  ...
}
```

## Appliquer

```bash
npx prisma db push --accept-data-loss
npx prisma generate
```

Les 3 champs sont optionnels (ou ont un default) → aucune donnée existante n'est touchée. Les ProductContentBlock déjà créés via l'éditeur legacy auront automatiquement `blockType="text-media"` et `afterBlockId=null` (= placés en fin de page, comme avant).

## Alternative SQL pure

Si vraiment tu préfères (mais tu dois aussi éditer `schema.prisma` comme ci-dessus, sinon le code TS ne reconnaîtra pas les champs) :

```sql
ALTER TABLE "ProductContentBlock"
  ADD COLUMN "blockType" TEXT NOT NULL DEFAULT 'text-media',
  ADD COLUMN "afterBlockId" TEXT,
  ADD COLUMN "metadata" TEXT;
```
