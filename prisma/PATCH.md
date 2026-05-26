# Sprint 5.8 — Migration Prisma (aucune commande à taper)

## ⚡ TL;DR — il n'y a rien à faire à la main

Tu dézippes la livraison, tu pushes sur `main`, Vercel rebuild → la migration
se fait toute seule.

## 🔧 Comment ça marche

Deux fichiers livrés s'occupent de tout :

### 1. `prisma/schema.prisma` — déjà patché

J'ai ajouté **2 champs nullables** au modèle `HearingAid`, entourés de
marqueurs visuels pour que tu retrouves vite l'ajout :

```prisma
model HearingAid {
  …
  blockVisibility String?

  // === Sprint 5.8 BEGIN ===
  /// JSON : { promises, section1, section2, highlight1, section3, section4, highlight2, accessories }
  sectionKickers String?
  /// JSON : [{ text: string, dotColor: string }]
  heroBadges     String?
  // === Sprint 5.8 END ===

  updatedAt DateTime @updatedAt
  …
}
```

Le reste de ton schéma est **strictement identique** à ce qu'il y avait sur
`main` au moment où j'écris cette livraison. Si tu as modifié `schema.prisma`
entre temps, regarde le `diff` GitHub après dézip — c'est trivial à fusionner.

### 2. `package.json` — le build Vercel fait la migration

J'ai changé une seule ligne dans les `scripts` :

```diff
- "build": "next build",
+ "build": "prisma db push --accept-data-loss && next build",
```

Désormais, à chaque déploiement Vercel :

1. Vercel installe les deps → `postinstall` lance `prisma generate` (déjà ton cas)
2. Vercel lance `npm run build` → **d'abord** `prisma db push` synchronise
   la DB avec le schéma (= crée les 2 nouvelles colonnes), **ensuite**
   `next build` compile.

Donc à la première mise en prod après ce sprint :
- Vercel détecte que `sectionKickers` et `heroBadges` manquent en DB
- `prisma db push --accept-data-loss` les ajoute (`ALTER TABLE` simple, données préservées)
- L'app builde sans erreur, démarre, fonctionne.

## ✅ Sécurité

- Les 2 nouvelles colonnes sont **nullables** → `db push` n'a aucune raison
  de toucher quoi que ce soit d'autre. Le flag `--accept-data-loss` n'a
  d'effet que si tu **supprimes** ou **renommes** des champs dans le schéma
  (pas le cas ici).
- Tous les appareils existants auront `sectionKickers = null` et
  `heroBadges = null` après la migration. Les helpers `parseKickers()` et
  `parseHeroBadges()` retombent automatiquement sur les valeurs hardcodées
  d'avant ("Tout ce qu'il vous faut", "Essai gratuit 30 jours", etc.) → **zéro
  régression visuelle**.
- Le build sera juste **~5 secondes plus long** (le temps que `db push`
  inspecte la DB). C'est négligeable.

## 🤔 Pourquoi pas une vraie migration Prisma ?

Pour deux raisons pragmatiques :

1. **Tu n'as pas de CLI sous la main** → on ne peut pas faire
   `prisma migrate dev` localement pour générer un dossier `migrations/`.
2. **`db push` est idempotent et safe pour des ajouts purs** → tant qu'on
   reste sur des champs nullables ou avec `@default()`, c'est strictement
   équivalent à `migrate`. La seule différence est qu'on n'a pas d'historique
   `migrations/` versionné.

Si plus tard tu veux passer à un workflow `prisma migrate` propre, tu pourras
toujours faire un `prisma migrate dev --name init-from-current-db` qui crée
une baseline depuis l'état actuel de ta DB. Mais ce n'est **pas nécessaire**
pour ce sprint.

## 🧑‍🔧 Patch manuel (si tu préfères ne pas toucher au build)

Si tu veux remettre le `build` à `next build` après le 1er déploiement réussi,
c'est OK — la DB aura déjà les colonnes. Mais tu peux aussi laisser tel quel,
ça ne casse rien.
