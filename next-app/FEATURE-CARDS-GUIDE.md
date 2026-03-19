# 🎴 Guide des Feature Cards - Audire

## ✅ Ce qui a été fait

### 1. Composant ImageFeatureCard amélioré
- ✅ Support des liens cliquables (href)
- ✅ Contrôle de la position de l'image (imagePosition)
- ✅ Position par défaut: `center 35%` (pour voir les visages)
- ✅ Effet parallax subtil au scroll et zoom au hover

### 2. Page d'accueil mise à jour
- ✅ Toutes les 6 feature cards utilisent maintenant ImageFeatureCard
- ✅ Chaque card a un lien vers sa page correspondante
- ✅ Images configurées avec les bons noms

### 3. Base de données étendue
- ✅ Schéma Prisma mis à jour avec nouveaux champs:
  - `imagePosition` (string) - Position CSS de l'image
  - `href` (string?) - Lien vers une page
  - `title` (string?) - Titre de la card
  - `description` (text?) - Description de la card
  - `imageAlt` (string?) - Texte alternatif

### 4. API mise à jour
- ✅ `/api/admin/card-images` supporte tous les nouveaux champs
- ✅ GET, POST, PUT, DELETE fonctionnels

### 5. Interface Admin dédiée
- ✅ Nouvelle page: `/admin/feature-cards`
- ✅ Gestion visuelle de chaque card
- ✅ Prévisualisation en temps réel
- ✅ Contrôle précis de la position de l'image
- ✅ Interface intuitive avec exemples

---

## 📋 Actions requises de votre part

### Étape 1: Exécuter la migration SQL

Connectez-vous à votre base de données PostgreSQL et exécutez:

```bash
psql $DATABASE_URL -f /home/user/audire/next-app/prisma/migrations/add_card_image_fields.sql
```

Ou via Prisma (si DATABASE_URL est configuré):

```bash
cd /home/user/audire/next-app
npx prisma migrate dev
```

### Étape 2: Uploader les images

Uploadez les 6 images suivantes dans `/next-app/public/images/`:

1. **hearing-test.jpg**
   - ✅ Image fournie (femme avec casque)
   - Lien: `/test-auditif-gratuit`
   - Suggestion: Cette image que vous m'avez montrée

2. **human-support.jpg**
   - Lien: `/notre-accompagnement`
   - Suggestion: Audioprothésiste en consultation avec patient

3. **personalized-follow-up.jpg**
   - Lien: `/notre-accompagnement`
   - Suggestion: Réglages d'appareil sur ordinateur

4. **quality-solutions.jpg**
   - Lien: `/solutions-auditives`
   - Suggestion: Appareils Oticon ou Bernafon modernes

5. **independent-center.jpg**
   - Lien: `/notre-accompagnement`
   - Suggestion: Votre centre Audire (façade ou intérieur)

6. **price-transparency.jpg**
   - Lien: `/remboursements`
   - Suggestion: Documents clairs, conversation sur les prix

**Recommandations:**
- Format: JPG ou WebP
- Dimensions: Au moins 800x600px (ratio 4:3)
- Poids: 200-300KB max (optimisé pour le web)
- Style: Cohérent entre toutes les images

### Étape 3: Configurer les cards via l'admin

1. Allez sur `/admin/feature-cards`
2. Pour chaque card, cliquez sur "Créer cette card" (si pas déjà créée)
3. Modifiez les paramètres:
   - **Image Position**: Ajustez pour cadrer correctement (ex: "center 35%" pour voir le visage)
   - **Titre**: Personnalisez si nécessaire
   - **Description**: Ajoutez ou modifiez
   - **Lien**: Vérifiez que le lien est correct
4. Utilisez la prévisualisation pour vérifier le rendu
5. Sauvegardez

---

## 🎨 Guide d'utilisation de Image Position

### Comprendre object-position

La propriété `imagePosition` contrôle quelle partie de l'image est visible dans la card.

**Syntaxe:** `horizontal vertical`

### Exemples courants:

```css
"center center"    /* Image parfaitement centrée */
"center 30%"       /* Centré horizontalement, décalé vers le haut */
"center 35%"       /* Légèrement vers le haut (RECOMMANDÉ pour visages) */
"center 50%"       /* Centré verticalement (= center center) */
"center 70%"       /* Décalé vers le bas */
"left center"      /* Aligné à gauche, centré verticalement */
"right center"     /* Aligné à droite, centré verticalement */
```

### Pour bien cadrer un visage:

1. Si le visage est **trop bas** dans la card → Diminuez le pourcentage (ex: 30%)
2. Si le visage est **trop haut** dans la card → Augmentez le pourcentage (ex: 40%)
3. **Recommandation par défaut:** `center 35%` montre bien la partie supérieure de la photo

### Testez en temps réel:

Dans `/admin/feature-cards`, vous pouvez:
1. Modifier la valeur d'`Image Position`
2. Voir la prévisualisation instantanément
3. Sauvegarder quand le cadrage est parfait

---

## 🔗 Mapping des Cards et Pages

| Card | Fichier image | Lien | Page |
|------|--------------|------|------|
| Test auditif gratuit | `hearing-test.jpg` | `/test-auditif-gratuit` | Test auditif |
| Accompagnement humain | `human-support.jpg` | `/notre-accompagnement` | Notre accompagnement |
| Suivi personnalisé | `personalized-follow-up.jpg` | `/notre-accompagnement` | Notre accompagnement |
| Solutions de qualité | `quality-solutions.jpg` | `/solutions-auditives` | Solutions auditives |
| Centre indépendant | `independent-center.jpg` | `/notre-accompagnement` | Notre accompagnement |
| Transparence des prix | `price-transparency.jpg` | `/remboursements` | Remboursements |

---

## 🛠️ Architecture technique

### Composant ImageFeatureCard

```tsx
<ImageFeatureCard
  imageSrc="/images/hearing-test.jpg"
  title="Test auditif gratuit"
  description="Un test complet..."
  imageAlt="Test auditif avec casque"
  href="/test-auditif-gratuit"
  imagePosition="center 35%"
/>
```

### Effet parallax

- **Scroll**: L'image se déplace légèrement (±20px) en fonction du scroll
- **Hover**: Zoom subtil de 1.05x au survol
- **Transition**: Fluide (500ms ease-out)

### Base de données

Table `CardImage`:
- Stocke toutes les configurations
- Modifiable via `/admin/feature-cards`
- Changes en temps réel sur le site

---

## 📝 Checklist finale

- [ ] Migration SQL exécutée
- [ ] 6 images uploadées dans `/public/images/`
- [ ] Cards créées dans `/admin/feature-cards`
- [ ] Positions d'images ajustées (surtout hearing-test.jpg)
- [ ] Titres et descriptions vérifiés
- [ ] Liens testés
- [ ] Prévisualisation validée
- [ ] Site testé en local

---

## 🚀 Accès rapide

- **Admin principal**: `/admin`
- **Gestion des cards**: `/admin/feature-cards`
- **Liste des images**: `/next-app/public/images/IMAGES-REQUIRED.md`

---

## ⚡ Prochaines étapes suggérées

1. Ajouter les mêmes images sur les pages correspondantes
2. Créer des variantes pour mobile
3. Ajouter des animations supplémentaires
4. Optimiser les images (compression, WebP)
5. Ajouter un système de cache pour les images

---

**Note**: Tous les changements sont committés et pushés sur la branche `claude/audire-website-design-xqUXz`.
