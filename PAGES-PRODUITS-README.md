# Pages Produits - Appareils Auditifs

## 📝 Ce qui a été créé

### 1. Modèle de base de données `HearingAid`
- Fichier: `prisma/schema.prisma`
- Table complète pour stocker toutes les informations des appareils auditifs
- **Nouveau:** Champs pour hero customisé, avantages, 4 sections de contenu, 2 highlight boxes, FAQ

### 2. Modèle `ProductContentBlock` - Blocs flexibles ✨
- Permet d'ajouter **autant de sections image/vidéo + texte** que nécessaire
- Choix de la position du média (gauche ou droite)
- Choix de la couleur de fond
- Ordre personnalisable
- **Idéal pour créer des pages produits riches et variées**

### 3. Composant réutilisable `ProductContentBlock`
- Fichier: `src/components/ProductContentBlock.tsx`
- Affiche automatiquement les blocs flexibles avec le bon layout

### 4. Page dynamique `/appareils/[slug]` - Version complète
- Fichier: `src/app/appareils/[slug]/page.tsx`
- **Structure complète** inspirée de la page Lapperre:
  1. **Hero** avec dégradé personnalisable + image de fond
  2. **2 CTA** (Prendre RDV + Appeler)
  3. **Section avantages** avec 4-5 icônes/images
  4. **Section 1** : Texte gauche + Vidéo/Image droite
  5. **Section 2** : Image gauche + Texte droite
  6. **Highlight Box 1** : Encadré clair avec photo + texte + CTA
  7. **Section 3** : Texte gauche + Image droite
  8. **Section 4** : Vidéo/Image gauche + Texte droite
  9. **Highlight Box 2** : Encadré avec plusieurs photos + CTA
  10. **Blocs flexibles** : Autant que nécessaire ! ✨
  11. **FAQ** : Questions/réponses accordéon
  12. **Formulaire de contact**
  13. **CTA final**

### 5. API Routes améliorées
- `src/app/api/hearing-aids/route.ts` - Liste tous les appareils
- `src/app/api/hearing-aids/[slug]/route.ts` - Récupère un appareil + ses blocs flexibles

### 6. Script de seed complet
- Fichier: `prisma/seed-hearing-aids.ts`
- Exemple complet pour Oticon Real avec toutes les sections
- Exemples plus simples pour les autres produits
- Exemple de blocs flexibles

### 7. Liens temporaires
- **🚧 Bouton jaune "Produits"** dans le header (desktop + mobile)
- **🚧 Dropdown** en haut de la page produit

## 🚀 Déploiement sur Vercel

### Étape 1: Push du schéma
Le build Vercel va automatiquement créer les tables :
```bash
npm run build
# Exécute: prisma db push --accept-data-loss && next build
```

### Étape 2: Seed des données
```bash
npx tsx prisma/seed-hearing-aids.ts
```

## 🎨 Structure de la page produit

### Sections fixes (dans l'ordre)

1. **Hero** - `heroGradientFrom`, `heroGradientTo`, `heroImage`, `heroDescription`
2. **Avantages** - `advantages` (JSON array)
3. **Section 1** - `section1Title`, `section1Description`, `section1MediaUrl`, `section1MediaType`
4. **Section 2** - `section2Title`, `section2Description`, `section2Image`
5. **Highlight Box 1** - `highlightBox1Title`, `highlightBox1Description`, `highlightBox1Image`
6. **Section 3** - `section3Title`, `section3Description`, `section3Image`
7. **Section 4** - `section4Title`, `section4Description`, `section4MediaUrl`, `section4MediaType`
8. **Highlight Box 2** - `highlightBox2Title`, `highlightBox2Images` (JSON array)
9. **🆕 Blocs flexibles** - Voir ci-dessous
10. **FAQ** - `productFAQs` (JSON array)
11. **Formulaire de contact**
12. **CTA final**

### Blocs flexibles - La nouveauté ! ✨

Les blocs flexibles permettent d'ajouter **autant de sections "image/vidéo + texte"** que nécessaire, avec un contrôle total sur le layout.

**Exemple d'utilisation :**

```typescript
await prisma.productContentBlock.create({
  data: {
    hearingAidId: product.id,
    order: 1,           // Ordre d'affichage (1, 2, 3...)
    isVisible: true,    // Visible ou masqué
    title: 'Mon titre',
    description: 'Ma description\n\nSupporte les retours à la ligne.',
    mediaUrl: '/images/mon-image.jpg',
    mediaType: 'image', // 'image' ou 'video'
    mediaAlt: 'Texte alternatif',
    mediaPosition: 'left', // 'left' ou 'right' - Position du média
    backgroundColor: '#f9fafb', // Couleur de fond (optionnel)
  },
});
```

**Avantages des blocs flexibles :**
- ✅ Nombre illimité de sections
- ✅ Choix de la position (média à gauche ou droite)
- ✅ Support vidéo ET image
- ✅ Couleur de fond personnalisable
- ✅ Ordre modifiable facilement
- ✅ Peut être masqué sans supprimer

## 📝 Ajouter un nouveau produit

### Méthode 1: Via le script de seed

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
    shortDesc: 'Aussi modernes que des écouteurs',
    price: 'À partir de 3200€',

    // Hero
    heroGradientFrom: '#ff6b35',
    heroGradientTo: '#f7931e',
    heroImage: '/images/produits/phonak-virto.jpg',
    heroDescription: 'Des appareils auditifs qui ressemblent à des écouteurs modernes.',

    // Avantages
    advantages: JSON.stringify([
      { title: 'Design moderne', description: 'Comme des écouteurs', icon: '🎧' },
      { title: 'Sur mesure', description: 'Adapté à votre oreille', icon: '✨' },
      // ...
    ]),

    // Sections
    section1Title: 'Aussi modernes que des écouteurs',
    section1Description: 'Phonak Virto R Infinio élève les solutions...',
    section1MediaUrl: '/videos/phonak-virto-demo.mp4',
    section1MediaType: 'video',

    // FAQ
    productFAQs: JSON.stringify([
      {
        question: 'Quelle est la taille ?',
        answer: 'Jusqu\'à 15% plus petit que les modèles précédents.'
      },
    ]),

    isHighlight: true,
    isVisible: true,
    order: 1,
  },
});

// Ajouter des blocs flexibles
await prisma.productContentBlock.create({
  data: {
    hearingAidId: product.id,
    order: 1,
    title: 'Connectivité universelle',
    description: 'Connectez jusqu\'à 8 appareils Bluetooth simultanément.',
    mediaUrl: '/images/phonak-bluetooth.jpg',
    mediaType: 'image',
    mediaPosition: 'right',
    isVisible: true,
  },
});
```

### Méthode 2: Via l'admin (à créer)

Une page admin `/admin/hearing-aids` permettra de gérer visuellement :
- Les informations de base (nom, marque, prix, etc.)
- Le hero (couleurs dégradé, image, texte)
- Les avantages (avec icônes)
- Les 4 sections fixes
- Les 2 highlight boxes
- Les blocs flexibles (ajouter, réordonner, supprimer)
- Les FAQ

## 🧹 Retirer les éléments temporaires

### 1. Retirer le dropdown de la page produit
Dans `src/app/appareils/[slug]/page.tsx`, supprimer :
```tsx
{/* 🚧 DROPDOWN TEMPORAIRE - À RETIRER PLUS TARD */}
<div className="bg-yellow-100...
  ...
</div>
```

### 2. Retirer le lien du header
Dans `src/components/Header.tsx`, supprimer (2 occurrences) :
```tsx
{/* 🚧 LIEN TEMPORAIRE - À RETIRER */}
<Link href="/appareils/oticon-real"...>
  🚧 Produits
</Link>
```

## 🎯 Exemples de données JSON

### Avantages
```json
[
  {
    "title": "Son naturel",
    "description": "Reproduction fidèle des sons",
    "icon": "🎵"  // Peut être un emoji ou une URL d'image
  },
  {
    "title": "Bluetooth",
    "description": "Connexion sans fil",
    "icon": "/images/icons/bluetooth.png"  // URL d'image
  }
]
```

### FAQ
```json
[
  {
    "question": "Quelle est l'autonomie ?",
    "answer": "24 heures avec une seule charge.\n\nLe chargement complet prend 3 heures."
  }
]
```

### Images de la Highlight Box 2
```json
[
  "/images/produits/photo1.jpg",
  "/images/produits/photo2.jpg",
  "/images/produits/photo3.jpg",
  "/images/produits/photo4.jpg"
]
```

## 🔧 Personnalisation avancée

### Couleurs du dégradé
Par défaut : `#42a4ff` → `#5ab3ff` (bleu Audire)

Pour chaque produit, vous pouvez personnaliser :
```typescript
heroGradientFrom: '#ff6b35',  // Orange
heroGradientTo: '#f7931e',    // Orange clair
```

### Types de médias
- **Image** : `mediaType: 'image'`
- **Vidéo** : `mediaType: 'video'`

Les vidéos s'affichent avec des contrôles natifs du navigateur.

### Couleurs de fond des blocs flexibles
```typescript
backgroundColor: '#ffffff',    // Blanc
backgroundColor: '#f9fafb',    // Gris très clair
backgroundColor: 'transparent', // Transparent
backgroundColor: '#ebf5ff',    // Bleu très clair
```

## 📋 TODO - Fonctionnalités à venir

- [ ] Page admin pour gérer les produits visuellement
- [ ] Upload d'images via l'admin
- [ ] Drag & drop pour réordonner les blocs flexibles
- [ ] Prévisualisation en temps réel
- [ ] Import/export de produits (JSON)
- [ ] Page de liste des produits avec filtres
- [ ] Recherche de produits

## 🆘 Aide

### Le build échoue ?
Vérifiez que :
1. Prisma est à jour : `npx prisma generate`
2. Les imports sont corrects : `import { prisma } from '@/lib/prisma'`

### Les images ne s'affichent pas ?
1. Vérifiez que les images sont dans `/public/images/produits/`
2. Les URLs doivent commencer par `/images/` (sans `public/`)

### Les blocs flexibles ne s'affichent pas ?
1. Vérifiez que `isVisible: true`
2. Vérifiez que `hearingAidId` correspond bien au produit
3. Les blocs sont triés par `order` croissant

## 📞 Questions ?

Pour toute question sur l'implémentation ou l'utilisation du système, référez-vous à ce fichier ou consultez le code source dans `src/app/appareils/[slug]/page.tsx`.
