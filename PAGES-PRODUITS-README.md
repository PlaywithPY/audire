# Pages Produits - Appareils Auditifs

## 📝 Ce qui a été créé

### 1. Modèle de base de données `HearingAid`
- Fichier: `prisma/schema.prisma`
- Table pour stocker les informations des appareils auditifs (nom, marque, prix, caractéristiques, etc.)
- Champs: slug, name, brand, range, type, descriptions, images, features, price, etc.

### 2. Script de seed
- Fichier: `prisma/seed-hearing-aids.ts`
- Import automatique des 6 produits legacy (Oticon Real, More, Own + Bernafon Alpha, Viron, Everest)
- **À exécuter après avoir pushé le schéma**: `npx tsx prisma/seed-hearing-aids.ts`

### 3. Page dynamique `/appareils/[slug]`
- Fichier: `src/app/appareils/[slug]/page.tsx`
- Page produit responsive avec:
  - Hero avec image et infos principales
  - Breadcrumb de navigation
  - Description complète
  - Liste des caractéristiques
  - CTA pour prendre rendez-vous
  - **🚧 Dropdown temporaire** en haut de page pour changer d'appareil

### 4. API Routes
- `src/app/api/hearing-aids/route.ts` - Liste tous les appareils
- `src/app/api/hearing-aids/[slug]/route.ts` - Récupère un appareil par slug

### 5. Lien temporaire dans le header
- Fichier: `src/components/Header.tsx`
- **🚧 Bouton jaune "Produits"** dans la navigation (desktop + mobile)
- Mène vers `/appareils/oticon-real`

## 🚀 Déploiement sur Vercel

### Étape 1: Push du schéma
```bash
# Le build Vercel fera automatiquement:
npm run build
# Qui exécute: prisma db push --accept-data-loss && next build
```

### Étape 2: Seed de la base de données
Après le premier déploiement, exécuter dans le terminal Vercel ou localement:
```bash
npx tsx prisma/seed-hearing-aids.ts
```

Ou ajouter au script `build:full` dans package.json (déjà configuré).

## 🧪 Test de la page

1. Accéder à: `https://votre-site.vercel.app/appareils/oticon-real`
2. Utiliser le dropdown jaune pour changer d'appareil
3. Tester les autres slugs:
   - `/appareils/oticon-more`
   - `/appareils/oticon-own`
   - `/appareils/bernafon-alpha`
   - `/appareils/bernafon-viron`
   - `/appareils/bernafon-everest`

## 🧹 Retirer les éléments temporaires

### 1. Retirer le dropdown de la page produit
Dans `src/app/appareils/[slug]/page.tsx`, supprimer le bloc:
```tsx
{/* DROPDOWN TEMPORAIRE - À RETIRER PLUS TARD */}
<div className="bg-yellow-100 border-b-2 border-yellow-300 py-3">
  ...tout le contenu jusqu'à </div>
</div>
```

### 2. Retirer le lien dans le header
Dans `src/components/Header.tsx`, supprimer:
```tsx
{/* 🚧 LIEN TEMPORAIRE - À RETIRER */}
<Link href="/appareils/oticon-real" ... >
  🚧 Produits
</Link>
```
(2 occurrences: une pour desktop, une pour mobile)

## 🎨 Personnalisation du design

La page utilise actuellement un design de base. Pour l'adapter au style de Lapperre:

### Sections à modifier dans `src/app/appareils/[slug]/page.tsx`:

1. **Hero Section** (ligne ~135)
   - Ajuster le layout image/texte
   - Modifier les couleurs et espacements

2. **Description** (ligne ~220)
   - Ajouter des sections supplémentaires si besoin

3. **Caractéristiques** (ligne ~233)
   - Modifier la présentation (grille, liste, icônes)

4. **CTA Section** (ligne ~254)
   - Personnaliser le texte et les actions

### Champs disponibles dans le modèle:
- `gallery`: Pour ajouter une galerie d'images (JSON array)
- `technicalSpecs`: Pour les spécifications techniques (JSON object)
- `seoTitle` / `seoDescription`: Pour le SEO

## 📝 Ajouter de nouveaux produits

### Via le script seed (recommandé pour le bulk)
Éditer `prisma/seed-hearing-aids.ts` et ajouter:
```typescript
await prisma.hearingAid.upsert({
  where: { slug: 'phonak-virto-r-infinio' },
  update: {},
  create: {
    slug: 'phonak-virto-r-infinio',
    name: 'Phonak Virto R Infinio',
    brand: 'Phonak',
    range: 'Premium',
    type: 'Intra-auriculaire',
    shortDesc: '...',
    fullDesc: '...',
    mainImage: '/images/produits/phonak-virto-r-infinio.jpg',
    features: JSON.stringify([...]),
    price: 'À partir de 3200€',
    isHighlight: true,
    isVisible: true,
    order: 7,
  },
});
```

### Via l'admin (TODO - à créer)
Créer une page admin `/admin/hearing-aids` pour gérer les produits visuellement.

## ❓ Questions / Personnalisation

Décrivez la structure exacte de la page Lapperre pour adapter le design:
- Sections présentes
- Layout des images
- Informations affichées
- Style visuel

## 🔗 URLs importantes

- Page exemple: `/appareils/oticon-real`
- API liste: `/api/hearing-aids`
- API détail: `/api/hearing-aids/oticon-real`
