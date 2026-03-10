# Configuration de la base de données

## 🚨 Problème résolu

Le build échouait car il essayait de se connecter à la base de données pendant le build Vercel (timeout Neon).

## ✅ Solution appliquée

Le script de build a été simplifié :
- **Avant** : `prisma generate && prisma migrate deploy && npx tsx prisma/seed.ts && next build`
- **Maintenant** : `next build`

Les migrations et le seed doivent être faits **manuellement** après le premier déploiement.

## 📋 Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run build` | Build Next.js (pour Vercel) |
| `npm run build:full` | Build complet avec migrations + seed (local uniquement) |
| `npm run db:migrate` | Exécuter les migrations Prisma |
| `npm run db:seed` | Remplir la DB avec les données de test |
| `npm run db:setup` | Migrations + seed en une commande |

## 🛠️ Setup initial de la base de données (après premier déploiement)

### Option 1 : Via Vercel CLI (recommandé)

1. **Installer Vercel CLI** (si pas déjà fait)
   ```bash
   npm i -g vercel
   ```

2. **Se connecter**
   ```bash
   vercel login
   ```

3. **Lier le projet**
   ```bash
   cd next-app
   vercel link
   ```

4. **Exécuter les migrations**
   ```bash
   vercel env pull .env.local  # Télécharger les variables d'env
   npm run db:migrate
   ```

5. **Seeder la base de données**
   ```bash
   npm run db:seed
   ```

### Option 2 : Via Neon Dashboard

1. **Aller sur** [Neon Console](https://console.neon.tech/)
2. **Sélectionner** votre projet
3. **SQL Editor** → Exécuter les migrations SQL manuellement
4. Copier le contenu de `prisma/migrations/*/migration.sql`
5. Exécuter dans l'éditeur SQL

### Option 3 : En local avec connexion à Neon

1. **Copier DATABASE_URL** depuis Vercel
   - Vercel Dashboard → Settings → Environment Variables
   - Copier la valeur de `DATABASE_URL`

2. **Créer .env.local**
   ```bash
   echo 'DATABASE_URL="postgresql://..."' > .env.local
   ```

3. **Exécuter le setup**
   ```bash
   npm run db:setup
   ```

## 📊 Vérifier que la DB est bien configurée

### Via Prisma Studio (local)

```bash
npx prisma studio
```

Cela ouvrira une interface graphique pour voir vos données.

### Via code (dans l'admin)

1. Connectez-vous à `/admin/login`
2. Si vous voyez les centres et les données → ✅ DB configurée
3. Sinon → Exécutez le seed

## 🔄 Après chaque changement du schéma Prisma

Si vous modifiez `prisma/schema.prisma` :

1. **Créer une migration**
   ```bash
   npx prisma migrate dev --name nom_de_la_migration
   ```

2. **Déployer en production**
   ```bash
   vercel env pull .env.local
   npm run db:migrate
   ```

## ⚠️ Important

- Les migrations sont **déjà créées** dans `prisma/migrations/`
- Vous devez juste les **appliquer** avec `db:migrate` ou `db:setup`
- Le seed créera :
  - 2 centres (Jemeppe ⭐, Liège Centre)
  - Horaires d'ouverture pour chaque centre
  - 3 témoignages exemple
  - Couleurs par défaut du thème

## 🐛 Dépannage

### Erreur "Table already exists"

La migration a déjà été appliquée. Ignorez l'erreur ou utilisez :
```bash
npx prisma migrate resolve --applied <migration_name>
```

### Timeout lors de la connexion

Neon peut être en veille. Attendez 30 secondes et réessayez.

### "No such table" dans l'admin

La migration n'a pas été appliquée. Exécutez `npm run db:migrate`.

## 📝 Résumé : Ordre des opérations

1. ✅ **Déployer sur Vercel** (le build fonctionne maintenant)
2. ✅ **Configurer les variables d'environnement** (voir VERCEL_SETUP.md)
3. ✅ **Appliquer les migrations** (avec l'une des options ci-dessus)
4. ✅ **Seeder la DB** (optionnel, crée des données de test)
5. ✅ **Se connecter à l'admin** et vérifier que tout fonctionne
