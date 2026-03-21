# 🗄️ Configuration de la Base de Données

## ⚠️ Problème Actuel

Vous avez une **incohérence** entre votre schéma Prisma et votre configuration :

- **`prisma/schema.prisma`** : `provider = "postgresql"` (attend PostgreSQL)
- **`.env`** : `DATABASE_URL="file:./dev.db"` (pointe vers SQLite)

C'est pour cela que vous obtenez des erreurs 500 sur les routes `/api/admin/page-texts` et `/api/admin/populate-texts`.

## 📋 Solutions

### Option 1 : Utiliser SQLite en développement (Recommandé pour débuter)

Si vous voulez travailler en local avec SQLite :

1. **Modifier `prisma/schema.prisma`** :
   ```prisma
   datasource db {
     provider = "sqlite"  // ← Changer de "postgresql" à "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. **Appliquer le schéma** :
   ```bash
   npx prisma db push
   ```

3. **Générer le client Prisma** :
   ```bash
   npx prisma generate
   ```

4. **Peupler la table PageText** :
   - Via l'interface web : http://localhost:3000/admin/database
   - OU via CLI : `npx tsx scripts/populate-page-texts.ts`

### Option 2 : Utiliser PostgreSQL (Production)

Si vous voulez utiliser PostgreSQL (recommandé pour production) :

1. **Créer une base PostgreSQL** :
   - Localement : Installer PostgreSQL et créer une DB
   - En ligne : Utiliser [Neon](https://neon.tech/), [Supabase](https://supabase.com/), ou [Railway](https://railway.app/)

2. **Configurer l'URL dans `.env.local`** :
   ```bash
   DATABASE_URL="postgresql://user:password@host:5432/database_name"
   ```

3. **Appliquer les migrations** :
   ```bash
   npx prisma migrate dev
   ```

4. **Peupler la base** :
   - Via l'interface web : http://localhost:3000/admin/database
   - OU via CLI : `npx tsx scripts/populate-page-texts.ts`

### Option 3 : Configuration Hybride (Recommandé)

SQLite en dev, PostgreSQL en production :

1. **Créer `.env.local`** (pour le développement local, non versionné) :
   ```bash
   DATABASE_URL="file:./dev.db"
   ```

2. **Modifier le schéma pour supporter les deux** :

   Le problème : Prisma ne peut pas changer de provider dynamiquement.

   **Solution A** : Créer deux schémas différents (compliqué)

   **Solution B** : Utiliser uniquement PostgreSQL partout
   - Installer PostgreSQL localement
   - Ou utiliser un service cloud gratuit (Neon, Supabase)

## 🔧 Tests de Diagnostic

Utilisez la page admin pour diagnostiquer :

**http://localhost:3000/admin/database**

1. Cliquez sur "🔍 Tester la connexion à la DB"
2. Vérifiez les logs pour voir le problème exact
3. Suivez les suggestions affichées

## 📊 Quelle Table Sera Remplie ?

Le script de peuplement remplit la table **`PageText`** définie dans `prisma/schema.prisma` :

```prisma
model PageText {
  id        Int      @id @default(autoincrement())
  pageKey   String   // Page (ex: "home", "about", "solutions", "contact")
  textKey   String   // Identifiant du texte (ex: "hero-title", "hero-subtitle")
  content   String   @db.Text // Contenu du texte
  label     String?  // Label descriptif pour l'admin
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())

  @@unique([pageKey, textKey])
  @@index([pageKey])
}
```

### Textes qui seront créés :

Le fichier `PAGE_DEFINITIONS.ts` contient **tous les textes** des pages suivantes :
- 🏠 **Home** (7 textes : hero-title, section-1-title, descriptions, etc.)
- 👂 **Test Auditif Gratuit** (9 textes)
- 🤝 **Notre Accompagnement** (textes d'accompagnement)
- 🦻 **Solutions Auditives** (descriptions des appareils)
- 📞 **Contact** (formulaire et infos)
- 💬 **Témoignages** (avis clients)
- ℹ️ **À propos** (qui sommes-nous)

**Total : environ 40-60 textes** selon les pages définies.

## ✅ Procédure Recommandée (Démarrage Rapide)

Pour démarrer rapidement :

```bash
# 1. Modifier le provider pour SQLite
# Éditez prisma/schema.prisma et changez "postgresql" en "sqlite"

# 2. Appliquer le schéma
npx prisma db push

# 3. Générer le client
npx prisma generate

# 4. Redémarrer le serveur Next.js
npm run dev

# 5. Aller sur http://localhost:3000/admin/database
# 6. Cliquer sur "Test de connexion DB" (devrait être ✅)
# 7. Cliquer sur "Exécuter le peuplement"
```

## 🚨 Note Importante

- **Les textes existants ne seront JAMAIS écrasés** par le script de peuplement
- Seuls les textes manquants seront créés
- La table doit d'abord exister (via `prisma db push` ou `prisma migrate`)
- Sans migration, la table PageText n'existe pas = erreur 500

## 📝 Vérifier que tout fonctionne

Après le peuplement, allez sur :
- **http://localhost:3000/admin/text-editor** pour éditer les textes
- **http://localhost:3000/** pour voir les textes sur le site

Les textes seront chargés dynamiquement depuis la base de données !
