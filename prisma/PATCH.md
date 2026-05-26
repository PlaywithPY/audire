# Sprint 5.8 — Patch Prisma

Ajoute **deux champs JSON** sur le modèle `HearingAid` pour rendre éditables :

- les **kickers** (les titres bleus uppercase au-dessus de chaque section)
- les **puces du héros** (les "Essai gratuit 30 jours", "Remboursement INAMI", …)

## Ajouts dans `prisma/schema.prisma`

Dans le `model HearingAid { … }`, ajoute ces deux lignes (n'importe où, je
recommande à côté de `blockVisibility` et `imagePositions` pour grouper les
champs JSON de personnalisation) :

```prisma
model HearingAid {
  // … champs existants …

  blockVisibility   String?   // déjà présent
  imagePositions    String?   // déjà présent

  // ▼▼▼ Sprint 5.8 ▼▼▼
  sectionKickers    String?   // JSON : { promises, section1, section2, highlight1, section3, section4, highlight2, accessories }
  heroBadges        String?   // JSON : [{ text: string, dotColor: string }]
  // ▲▲▲ Sprint 5.8 ▲▲▲

  // … reste des champs …
}
```

## Migration

```bash
npx prisma migrate dev --name add-section-kickers-and-hero-badges
npx prisma generate
```

## ✅ Rétro-compatibilité

Les deux champs sont **nullables**. Si la valeur est `null` (le cas pour tous
les appareils existants), les helpers `parseKickers()` et `parseHeroBadges()`
retombent automatiquement sur les valeurs par défaut hardcodées d'avant :

- Kickers : "Tout ce qu'il vous faut", "À propos", "Design", "Highlight",
  "Connectivité", "Rechargeable", "L'expérience au quotidien", "Compatible avec".
- Badges : `[{text: "Essai gratuit 30 jours", dotColor: "#86efac"},
  {text: "Remboursement INAMI", dotColor: "#86efac"}]`.

Donc **zéro régression visuelle** au déploiement, même sans toucher aux données.
