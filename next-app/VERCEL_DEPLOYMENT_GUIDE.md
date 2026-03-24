# 🚀 Guide de Déploiement sur Vercel

## ❌ Problème Actuel

Vous rencontrez une erreur 500 sur les endpoints API `/api/admin/page-texts` :

```
GET https://audire-pink.vercel.app/api/admin/page-texts 500 (Internal Server Error)
POST https://audire-pink.vercel.app/api/admin/page-texts 500 (Internal Server Error)
```

**Cause principale** : La base de données Neon n'est pas accessible depuis Vercel. Soit les variables d'environnement ne sont pas configurées, soit la base de données est en mode veille.

---

## ✅ Solution : Configuration des Variables d'Environnement Vercel

### Étape 1 : Accéder aux Paramètres du Projet Vercel

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet `audire-pink`
3. Cliquez sur l'onglet **Settings**
4. Dans le menu de gauche, cliquez sur **Environment Variables**

### Étape 2 : Ajouter les Variables d'Environnement

Ajoutez les variables suivantes (utilisez les valeurs de votre fichier `.env` local) :

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_c1mGaY9dXbhP@ep-silent-leaf-ag9wozdx-pooler.c-2.eu-central-1.aws.neon.tech/neondb?connect_timeout=30&sslmode=require&pool_timeout=10` | Production, Preview, Development |
| `DIRECT_URL` | `postgresql://neondb_owner:npg_c1mGaY9dXbhP@ep-silent-leaf-ag9wozdx.c-2.eu-central-1.aws.neon.tech/neondb?connect_timeout=30&sslmode=require` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://audire-pink.vercel.app` | Production |
| `NEXTAUTH_URL` | `https://[votre-preview-url]` | Preview |
| `NEXTAUTH_SECRET` | `[générez un secret aléatoire]` | Production, Preview, Development |
| `ADMIN_USERNAME` | `admin` | Production, Preview, Development |
| `ADMIN_PASSWORD` | `[votre mot de passe sécurisé]` | Production, Preview, Development |

**⚠️ Important** :
- Cochez les cases **Production**, **Preview**, et **Development** pour chaque variable (sauf `NEXTAUTH_URL` qui doit être différent selon l'environnement)
- Pour générer un `NEXTAUTH_SECRET` sécurisé, utilisez :
  ```bash
  openssl rand -base64 32
  ```

### Étape 3 : Réveiller la Base de Données Neon

Les bases de données Neon gratuites se mettent en veille après une période d'inactivité. Pour la réveiller :

**Option 1 : Via l'API de Wake-up**
```bash
curl "https://ep-silent-leaf-ag9wozdx.c-2.eu-central-1.aws.neon.tech:5432"
```

**Option 2 : Via le Dashboard Neon**
1. Allez sur [Neon Console](https://console.neon.tech/)
2. Sélectionnez votre projet
3. Cliquez sur "Wake up database" si disponible
4. Ou faites une requête simple pour la réveiller :
   - Ouvrez l'onglet SQL Editor
   - Exécutez : `SELECT 1;`

### Étape 4 : Exécuter les Migrations Prisma

La base de données doit avoir les tables créées. Deux options :

**Option A : Via Build Command (Recommandé)**

Modifiez le Build Command dans Vercel :

1. Allez dans **Settings** > **General** > **Build & Development Settings**
2. Changez **Build Command** en :
   ```bash
   npx prisma migrate deploy && npm run build
   ```

**Option B : Manuellement en Local**

Si vous avez accès à la base de données en local :

```bash
# 1. Assurez-vous que .env contient DATABASE_URL et DIRECT_URL
# 2. Exécutez les migrations
npx prisma migrate deploy

# 3. Vérifiez que les tables sont créées
npx prisma studio
```

### Étape 5 : Redéployer sur Vercel

Après avoir configuré les variables d'environnement :

1. Allez dans l'onglet **Deployments**
2. Cliquez sur le bouton **Redeploy** du dernier déploiement
3. Cochez **Use existing Build Cache** si disponible
4. Cliquez sur **Redeploy**

OU push un nouveau commit :

```bash
git add .
git commit -m "Fix: Configure environment variables"
git push origin claude/audire-website-design-xqUXz
```

---

## 🔍 Vérification Post-Déploiement

Une fois déployé, testez :

1. **Vérifier l'API** :
   ```bash
   curl https://audire-pink.vercel.app/api/admin/page-texts
   ```

   - ✅ **Succès** : Retourne un JSON avec la liste des textes ou un tableau vide `[]`
   - ❌ **Erreur** : Retourne une erreur avec un message détaillé

2. **Vérifier la page d'accueil** :
   - Ouvrez https://audire-pink.vercel.app
   - Ouvrez la console du navigateur (F12)
   - Il ne devrait plus y avoir d'erreur 500

3. **Vérifier l'interface admin** :
   - Allez sur https://audire-pink.vercel.app/admin/login
   - Connectez-vous avec les identifiants configurés
   - Vérifiez que vous pouvez accéder à l'éditeur de textes

---

## 🐛 Diagnostics en Cas de Problème

### Erreur : "Cannot connect to database"

**Solution** :
- Vérifiez que `DATABASE_URL` et `DIRECT_URL` sont correctement configurés dans Vercel
- Vérifiez que la base de données Neon n'est pas en veille (voir Étape 3)
- Vérifiez que l'URL de connexion est correcte (pas de caractères manquants)

### Erreur : "Table PageText does not exist"

**Solution** :
- Les migrations n'ont pas été exécutées
- Exécutez `npx prisma migrate deploy` manuellement ou configurez le Build Command (voir Étape 4)

### Erreur : "Unauthorized" (401)

**Solution** :
- Vérifiez que `NEXTAUTH_SECRET` est configuré dans Vercel
- Vérifiez que `NEXTAUTH_URL` correspond à l'URL de déploiement
- Reconnectez-vous sur `/admin/login`

### Logs Vercel

Pour voir les logs détaillés :

1. Allez dans **Deployments**
2. Cliquez sur le dernier déploiement
3. Cliquez sur **View Function Logs** ou **Runtime Logs**
4. Recherchez les erreurs Prisma (P1001, P2021, etc.)

---

## 🔐 Sécurité

**⚠️ IMPORTANT** : Ne committez JAMAIS les fichiers suivants :

- `.env`
- `.env.local`
- `.env.production`

Ajoutez-les au `.gitignore` :

```bash
# Environment variables
.env
.env.local
.env.production
.env.development
```

**Générez toujours des secrets forts** :

```bash
# Pour NEXTAUTH_SECRET
openssl rand -base64 32

# Pour ADMIN_PASSWORD (utilisez un générateur de mot de passe)
# Minimum 12 caractères, avec majuscules, minuscules, chiffres et symboles
```

---

## 📊 Monitoring de la Base de Données Neon

Pour éviter que la base de données ne se mette en veille (plan gratuit) :

**Option 1 : Upgrade vers un plan payant Neon**
- Les plans payants n'ont pas de mise en veille automatique

**Option 2 : Ping automatique**
- Créez un cron job Vercel pour ping la DB toutes les heures :

```typescript
// app/api/cron/wake-db/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
```

Puis configurez un cron job Vercel dans `vercel.json` :

```json
{
  "crons": [{
    "path": "/api/cron/wake-db",
    "schedule": "0 * * * *"
  }]
}
```

---

## 🎯 Checklist Finale

Avant de déployer en production :

- [ ] Variables d'environnement configurées dans Vercel
- [ ] `NEXTAUTH_SECRET` généré de manière sécurisée
- [ ] `ADMIN_PASSWORD` changé depuis "changez-ce-mot-de-passe"
- [ ] Base de données Neon réveillée
- [ ] Migrations Prisma exécutées (`npx prisma migrate deploy`)
- [ ] `.env` ajouté au `.gitignore`
- [ ] Tests API réussis (`/api/admin/page-texts`)
- [ ] Page d'accueil se charge sans erreur 500
- [ ] Interface admin accessible et fonctionnelle

---

## 📞 Support

Si le problème persiste :

1. **Vérifiez les logs Vercel** : Deployments > [votre déploiement] > Runtime Logs
2. **Vérifiez les logs Neon** : Neon Console > Operations > Query Logs
3. **Testez l'API en local** : `npm run dev` puis visitez http://localhost:3000

Les erreurs Prisma les plus courantes :
- **P1001** : Cannot reach database server (connexion impossible)
- **P2021** : Table does not exist (migrations non exécutées)
- **P2025** : Record not found (enregistrement introuvable)
- **P2002** : Unique constraint violation (clé unique violée)
