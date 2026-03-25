# 📝 Système de Textes Éditables

Ce document explique comment utiliser le nouveau système de textes éditables pour rendre tous les textes du site modifiables via l'interface d'administration.

## 🎯 Objectif

Permettre de modifier tous les textes des pages (titres, descriptions, etc.) via l'interface admin `/admin/text-editor` sans toucher au code.

## 📊 État Actuel

✅ **61 textes identifiés** sur 8 pages :
- 🏠 Home: 7 textes
- 👂 Test Auditif Gratuit: 10 textes
- 🤝 Notre Accompagnement: 8 textes
- 🎧 Solutions Auditives: 8 textes
- 💰 Remboursements: 8 textes
- ❓ FAQ: 4 textes
- 📍 Contact: 6 textes
- 💊 Partenaires Pharmaciens: 10 textes

## 🚀 Installation (À FAIRE)

### 1. Peupler la base de données

**En production (Vercel)**, exécutez le script pour créer tous les enregistrements PageText :

```bash
# Via Vercel CLI ou dans un déploiement
npx tsx scripts/populate-page-texts.ts
```

Ce script va créer 61 enregistrements dans la table `PageText` avec les textes actuels comme valeurs par défaut.

### 2. Modifier les pages pour utiliser les textes de la DB

Actuellement, les pages ont les textes hardcodés. Il faut les remplacer par des appels à la DB.

#### Option A : Utiliser le composant `<PageText>`

```tsx
// AVANT (hardcodé)
<h1 className="text-5xl font-bold mb-6">
  Mieux entendre, simplement.
</h1>

// APRÈS (depuis la DB)
import { PageText } from '@/lib/page-texts';

<PageText
  pageKey="home"
  textKey="hero-title"
  as="h1"
  className="text-5xl font-bold mb-6"
  fallback="Mieux entendre, simplement."
/>
```

#### Option B : Charger tous les textes en une fois

```tsx
import { getPageTexts } from '@/lib/page-texts';

export default async function Home() {
  const texts = await getPageTexts('home');

  return (
    <main>
      <h1>{texts['hero-title'] || 'Mieux entendre, simplement.'}</h1>
      <p>{texts['description-1'] || 'Description par défaut...'}</p>
    </main>
  );
}
```

## 📂 Fichiers Importants

- `src/lib/page-texts.ts` - Helper pour charger les textes
- `src/app/admin/text-editor/page.tsx` - Interface admin pour éditer les textes
- `scripts/populate-page-texts.ts` - Script pour peupler la DB
- `scripts/extract-page-texts.py` - Script d'extraction automatique
- `PAGE_DEFINITIONS.ts` - Définitions générées automatiquement
- `TEXTES_IDENTIFICATION.md` - Documentation des textes par page

## 🔧 Utilisation de l'Admin

1. Allez sur `/admin/login` et connectez-vous
2. Allez sur `/admin/text-editor`
3. Sélectionnez une page dans les onglets
4. Modifiez les textes
5. Cliquez sur "Enregistrer"

Les changements sont immédiats grâce à l'ISR (Incremental Static Regeneration) avec `revalidate: 60`.

## 📝 Mapping des TextKeys

Chaque texte a un `textKey` unique. Voici les conventions :

- `hero-title` - Titre principal (H1) de la section hero
- `hero-kicker` - Petit badge au-dessus du titre
- `section-N-title` - Titre de la section N (H2)
- `description-N` - Paragraphe de description N
- `cta-title` - Titre de la section CTA finale
- `cta-description` - Description de la CTA

## ⚠️ Notes Importantes

1. **Fallbacks** : Toujours fournir une valeur `fallback` au cas où le texte n'existe pas en DB
2. **Revalidation** : Les pages sont recachées toutes les 60 secondes (`revalidate: 60`)
3. **Server Components** : Les fonctions `getPageTexts` et le composant `PageText` sont pour Server Components uniquement
4. **Production uniquement** : Le script `populate-page-texts.ts` nécessite PostgreSQL (ne marche pas en local avec SQLite)

## 🎨 Exemple Complet

```tsx
// src/app/page.tsx
import { getPageTexts } from '@/lib/page-texts';
import { PageText } from '@/lib/page-texts';

export const revalidate = 60; // ISR: revalider toutes les 60s

export default async function Home() {
  const texts = await getPageTexts('home');

  return (
    <main>
      {/* Option 1: Utiliser l'objet texts */}
      <section className="hero">
        <span>{texts['hero-kicker'] || 'Centre auditif'}</span>
        <h1>{texts['hero-title'] || 'Mieux entendre, simplement.'}</h1>
        <p>{texts['description-1'] || 'Description par défaut...'}</p>
      </section>

      {/* Option 2: Utiliser le composant PageText */}
      <section className="features">
        <PageText
          pageKey="home"
          textKey="section-1-title"
          as="h2"
          className="text-4xl font-bold"
          fallback="Pourquoi choisir Audire ?"
        />
      </section>
    </main>
  );
}
```

## 🔄 Prochaines Étapes

1. [ ] Exécuter `populate-page-texts.ts` en production
2. [ ] Modifier les pages une par une pour utiliser `getPageTexts()`
3. [ ] Tester l'édition via `/admin/text-editor`
4. [ ] Vérifier que les changements apparaissent sur le site

## ❓ Questions ?

- Les textes sont stockés dans la table `PageText` (PostgreSQL)
- Le composant utilise les Server Components de Next.js 14
- Les modifications sont visibles après 60 secondes max (ISR)
- Pas besoin de rebuild le site après modification

---

**Créé le** : 2026-03-21
**Auteur** : Claude (système automatisé)
