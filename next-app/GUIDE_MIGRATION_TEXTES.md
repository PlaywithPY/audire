# 🚀 Guide de Migration - Système de Textes Éditables

## 📋 Vue d'ensemble

Ce guide explique comment migrer les pages du site pour utiliser le système de textes éditables, permettant de modifier tous les textes via l'interface admin `/admin/text-editor` sans toucher au code.

## ✅ État de la Migration

| Page | PageKey | Statut | Notes |
|------|---------|--------|-------|
| 🏠 Accueil | `home` | ✅ **Migré** | Intégré avec `getPageTexts()` |
| 👂 Test Auditif | `test-auditif-gratuit` | ⏳ À faire | 5 textes à migrer |
| 🤝 Accompagnement | `notre-accompagnement` | ⏳ À faire | 4 textes à migrer |
| 🎧 Solutions | `solutions-auditives` | ⏳ À faire | 4 textes à migrer |
| 💰 Remboursements | `remboursements` | ⏳ À faire | 4 textes à migrer |
| ❓ FAQ | `faq` | ⏳ À faire | 2 textes à migrer |
| 📍 Contact | `contact` | ⏳ À faire | 3 textes à migrer |
| 💊 Pharmaciens | `partenaires-pharmaciens` | ⏳ À faire | 5 textes à migrer |

## 🎯 Étapes de Migration (par page)

### 1. Importer la fonction `getPageTexts`

```tsx
import { getPageTexts } from "@/lib/page-texts";
```

### 2. Charger les textes dans le composant

```tsx
export default async function MaPage() {
  const texts = await getPageTexts('pageKey'); // Remplacer par le bon pageKey

  return (
    // ... votre JSX
  );
}
```

### 3. Remplacer les textes hardcodés

**AVANT (hardcodé):**
```tsx
<h1>Mieux entendre, simplement.</h1>
```

**APRÈS (depuis la DB):**
```tsx
<h1>{texts['hero-title'] || 'Mieux entendre, simplement.'}</h1>
```

> ⚠️ **Important**: Toujours fournir une valeur par défaut avec `||` au cas où le texte n'existe pas en DB.

## 📝 Exemple Complet: Page d'Accueil (déjà migré)

Voici un exemple réel de migration pour la page d'accueil:

```tsx
import { getPageTexts } from "@/lib/page-texts";

export const revalidate = 60; // ISR: revalidation toutes les 60s

export default async function Home() {
  const texts = await getPageTexts('home');

  return (
    <main>
      {/* Hero Section */}
      <section>
        <div>
          <span>{texts['hero-kicker'] || 'Centre auditif indépendant • Province de Liège'}</span>
          <h1>{texts['hero-title'] || 'Mieux entendre, simplement.'}</h1>
          <p>{texts['description-1'] || 'Chez Audire, on commence par comprendre...'}</p>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2>{texts['section-1-title'] || 'Pourquoi choisir Audire ?'}</h2>
        <p>{texts['description-2'] || 'Parce que bien entendre...'}</p>
      </section>

      {/* CTA Section */}
      <section>
        <h2>{texts['section-2-title'] || 'Prêt à mieux entendre ?'}</h2>
        <p>{texts['description-3'] || 'Prenez rendez-vous...'}</p>
      </section>
    </main>
  );
}
```

## 🗺️ Mapping des TextKeys par Page

### 🏠 Home (`pageKey: 'home'`)
- `hero-title` - Titre principal H1
- `hero-kicker` - Badge/étiquette au-dessus du titre
- `section-1-title` - Titre "Pourquoi choisir Audire ?"
- `section-2-title` - Titre section CTA
- `description-1` - Description hero
- `description-2` - Description section "Pourquoi Audire"
- `description-3` - Description CTA

### 👂 Test Auditif Gratuit (`pageKey: 'test-auditif-gratuit'`)
- `hero-title` - Titre principal H1
- `section-1-title` - "Pourquoi faire un test auditif ?"
- `section-2-title` - "Comment se déroule le test ?"
- `section-3-title` - "Réservez votre test gratuit"
- `section-4-title` - "Ou contactez-nous directement"
- `description-1` à `description-5` - Descriptions des sections

### 🤝 Notre Accompagnement (`pageKey: 'notre-accompagnement'`)
- `hero-title` - Titre principal H1
- `section-1-title` - "Comment ça se passe ?"
- `section-2-title` - "Ce qui nous différencie"
- `section-3-title` - "Prêt à commencer ?"
- `description-1` à `description-4` - Descriptions des sections

### 🎧 Solutions Auditives (`pageKey: 'solutions-auditives'`)
- `hero-title` - Titre principal H1
- `section-1-title` - "Oticon & Bernafon"
- `section-2-title` - "Types d'appareils"
- `section-3-title` - "Trouvez votre solution"
- `description-1` à `description-4` - Descriptions des sections

### 💰 Remboursements (`pageKey: 'remboursements'`)
- `hero-title` - Titre principal H1
- `section-1-title` - "Comment ça marche ?"
- `section-2-title` - "Interventions INAMI"
- `section-3-title` - "Une question sur les remboursements ?"
- `description-1` à `description-4` - Descriptions des sections

### ❓ FAQ (`pageKey: 'faq'`)
- `hero-title` - Titre principal H1
- `section-1-title` - "Vous ne trouvez pas votre réponse ?"
- `description-1` - Description hero
- `description-2` - Description section 1

### 📍 Contact (`pageKey: 'contact'`)
- `hero-title` - Titre principal H1
- `section-1-title` - "Horaires d'ouverture"
- `section-2-title` - "Envoyez-nous un message"
- `description-1` à `description-3` - Descriptions des sections

### 💊 Partenaires Pharmaciens (`pageKey: 'partenaires-pharmaciens'`)
- `hero-title` - Titre principal H1
- `section-1-title` - "Pourquoi nous recommander ?"
- `section-2-title` - "Comment orienter vos patients ?"
- `section-3-title` - "Matériel de communication"
- `section-4-title` - "Devenons partenaires"
- `description-1` à `description-5` - Descriptions des sections

## 🔄 Processus de Déploiement

### 1. Peupler la base de données (une seule fois)

En production (Vercel), exécutez le script pour créer tous les enregistrements PageText:

```bash
npx tsx scripts/populate-page-texts.ts
```

Ce script va créer les enregistrements dans la table `PageText` avec les textes actuels comme valeurs par défaut.

### 2. Vérifier via l'admin

1. Allez sur `/admin/login` et connectez-vous
2. Allez sur `/admin/text-editor`
3. Vérifiez que tous les textes sont présents pour chaque page
4. Si des textes manquent, cliquez sur "➕ Créer ce texte"

### 3. Modifier les pages (une par une)

Pour chaque page:
1. Lire le fichier de la page (ex: `src/app/contact/page.tsx`)
2. Identifier tous les textes hardcodés
3. Ajouter l'import `getPageTexts`
4. Charger les textes avec `const texts = await getPageTexts('pageKey')`
5. Remplacer chaque texte hardcodé par `{texts['textKey'] || 'fallback'}`
6. Tester la page localement
7. Commiter les changements

### 4. Tester en production

1. Vérifier que les textes s'affichent correctement
2. Modifier un texte via `/admin/text-editor`
3. Attendre 60 secondes max (ISR)
4. Vérifier que le changement apparaît sur le site

## ⚙️ Configuration Technique

### ISR (Incremental Static Regeneration)

Chaque page utilise `export const revalidate = 60;` pour revalider les données toutes les 60 secondes. Cela signifie:

- Les pages sont générées statiquement à la build
- Les textes sont mis en cache pendant 60 secondes
- Après 60 secondes, Next.js régénère la page en background
- Les modifications dans l'admin apparaissent dans un délai max de 60 secondes

### Fallbacks

Toujours utiliser des fallbacks pour garantir que le site fonctionne même si:
- La table PageText est vide
- Un texte n'a pas été créé
- Il y a une erreur de connexion à la DB

```tsx
{texts['hero-title'] || 'Titre par défaut'}
```

### Types TypeScript

Le système retourne `Record<string, string>`, ce qui permet un accès facile:

```tsx
const texts: Record<string, string> = await getPageTexts('home');
// texts['hero-title'] => string | undefined
```

## 🐛 Troubleshooting

### Les textes ne s'affichent pas

1. Vérifier que la page utilise bien `getPageTexts()`
2. Vérifier que le `pageKey` est correct
3. Vérifier que les textes existent en DB via `/admin/text-editor`
4. Vérifier les logs serveur pour voir si Prisma arrive à se connecter

### Les modifications ne s'appliquent pas

1. Attendre 60 secondes (ISR)
2. Forcer un refresh de la page (Ctrl+Shift+R)
3. Vérifier que les modifications ont bien été sauvegardées en DB
4. En local, redémarrer le serveur de dev

### Erreurs Prisma

Si le script `populate-page-texts.ts` échoue:

1. Vérifier que PostgreSQL est accessible
2. Vérifier les variables d'environnement (DATABASE_URL)
3. Exécuter `npx prisma generate` puis `npx prisma db push`
4. Réessayer le script

## 📚 Ressources

- **Définitions des textes**: `PAGE_DEFINITIONS.ts` (racine du projet)
- **Helper library**: `src/lib/page-texts.ts`
- **API admin**: `src/app/api/admin/page-texts/route.ts`
- **Interface admin**: `src/app/admin/text-editor/page.tsx`
- **Script de population**: `scripts/populate-page-texts.ts`
- **Documentation technique**: `TEXTES_EDITABLES_README.md`

## 🎉 Avantages du Système

1. ✅ **Pas besoin de rebuild** - Les modifications sont immédiates (ISR)
2. ✅ **Interface admin intuitive** - Facile à utiliser pour les non-développeurs
3. ✅ **Fallbacks robustes** - Le site fonctionne toujours même en cas de problème
4. ✅ **Recherche intégrée** - Trouvez rapidement les textes à modifier
5. ✅ **Historique des modifications** - Chaque texte a un timestamp `updatedAt`
6. ✅ **Type-safe** - TypeScript garantit la cohérence

## 🔜 Prochaines Étapes

1. ⏳ Migrer les 7 pages restantes une par une
2. ⏳ Tester chaque page après migration
3. ⏳ Former les utilisateurs à l'interface admin
4. ⏳ Documenter les conventions de nommage des textKeys

---

**Créé le**: 2026-03-23
**Auteur**: Claude (système automatisé)
**Version**: 1.0
