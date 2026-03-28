# 🌐 Configuration des variables d'environnement sur Vercel

## ✅ Pourquoi utiliser les variables Vercel ?

- ✅ **Sécurisé** : Les secrets ne sont jamais commités dans Git
- ✅ **Simple** : Pas besoin de fichier `.env` en production
- ✅ **Automatique** : Vercel injecte automatiquement les variables au build et runtime
- ✅ **Multi-environnements** : Variables différentes pour Production, Preview, Development

---

## 📋 Étapes pour configurer vos variables

### Étape 1 : Accéder au Dashboard Vercel

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Cliquez sur votre projet **"audire"** (ou le nom que vous avez donné)

### Étape 2 : Ouvrir les paramètres

1. Cliquez sur l'onglet **"Settings"** (en haut)
2. Dans le menu de gauche, cliquez sur **"Environment Variables"**

### Étape 3 : Ajouter les variables

Pour chaque variable ci-dessous, cliquez sur **"Add New"** et remplissez :

#### 🗄️ Variables de base de données

```
Name: DATABASE_URL
Value: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
Environment: Production, Preview, Development
```

```
Name: DIRECT_URL
Value: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
Environment: Production, Preview, Development
```

> **Note** : Si vous utilisez Vercel Postgres, ces variables sont automatiquement créées

#### 🔐 NextAuth

```
Name: NEXTAUTH_URL
Value: https://votre-domaine-vercel.vercel.app
Environment: Production, Preview
```

```
Name: NEXTAUTH_SECRET
Value: [générez avec: openssl rand -base64 32]
Environment: Production, Preview, Development
```

#### 👤 Admin

```
Name: ADMIN_USERNAME
Value: admin
Environment: Production, Preview, Development
```

```
Name: ADMIN_PASSWORD
Value: [votre-mot-de-passe-sécurisé]
Environment: Production, Preview, Development
```

#### 📅 Google Calendar API (IMPORTANT pour les RDV)

```
Name: GOOGLE_CALENDAR_CLIENT_ID
Value: 123456789-xxxxxxxx.apps.googleusercontent.com
Environment: Production, Preview, Development
```

```
Name: GOOGLE_CALENDAR_CLIENT_SECRET
Value: GOCSPX-XxXxXxXxXxXxXxXxXxXxXx
Environment: Production, Preview, Development
```

```
Name: GOOGLE_CALENDAR_REFRESH_TOKEN
Value: 1//0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Environment: Production, Preview, Development
```

```
Name: GOOGLE_CALENDAR_ID
Value: RDV Site
Environment: Production, Preview, Development
```

#### 📧 Configuration Email

```
Name: EMAIL_HOST
Value: smtp.gmail.com
Environment: Production, Preview, Development
```

```
Name: EMAIL_PORT
Value: 587
Environment: Production, Preview, Development
```

```
Name: EMAIL_USER
Value: centre.audire@gmail.com
Environment: Production, Preview, Development
```

```
Name: EMAIL_PASSWORD
Value: [mot-de-passe-application-gmail]
Environment: Production, Preview, Development
```

```
Name: EMAIL_FROM
Value: centre.audire@gmail.com
Environment: Production, Preview, Development
```

```
Name: EMAIL_TO
Value: centre.audire@gmail.com
Environment: Production, Preview, Development
```

#### 🔒 Cron Job

```
Name: CRON_SECRET
Value: [générez avec: openssl rand -base64 32]
Environment: Production, Preview, Development
```

#### 📦 Vercel Blob Storage (Optionnel)

```
Name: BLOB_READ_WRITE_TOKEN
Value: [auto-généré par Vercel Blob]
Environment: Production, Preview, Development
```

> **Note** : Pour obtenir ce token, allez dans "Storage" → "Create Database" → "Blob"

---

## 🎯 Sélection de l'environnement

Pour chaque variable, vous pouvez choisir où elle s'applique :

- **Production** ✅ : Le site en ligne accessible par vos clients
- **Preview** ✅ : Les déploiements de test (branches, pull requests)
- **Development** ⚠️ : Local uniquement (nécessite Vercel CLI)

**Recommandation** : Cochez les 3 pour chaque variable

---

## 🔄 Redéployer après ajout

Une fois toutes les variables ajoutées :

1. Allez dans l'onglet **"Deployments"**
2. Cliquez sur le dernier déploiement
3. Cliquez sur **"... (trois points)"** → **"Redeploy"**

Ou simplement faites un nouveau commit et push :

```bash
git add .
git commit -m "Update configuration"
git push origin main
```

Vercel redéploiera automatiquement avec les nouvelles variables ! 🚀

---

## 🏠 Développement local (optionnel)

Si vous voulez tester en local, vous avez **deux options** :

### Option A : Utiliser Vercel CLI (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Lier le projet
vercel link

# Télécharger les variables
vercel env pull .env.local
```

Vercel créera automatiquement un fichier `.env.local` avec toutes vos variables !

### Option B : Créer manuellement un fichier .env.local

Créez un fichier `.env.local` à la racine du projet et copiez toutes les variables ci-dessus.

**Important** : Le fichier `.env.local` est déjà dans `.gitignore`, il ne sera jamais commité.

---

## ✅ Vérifier que tout fonctionne

Après le redéploiement :

1. **Testez votre site** : `https://votre-domaine.vercel.app`
2. **Testez un RDV** : Allez sur la page "Prendre RDV"
3. **Vérifiez Google Calendar** : Le RDV devrait apparaître automatiquement
4. **Vérifiez l'email** : La prescription devrait être envoyée

---

## 🔧 Dépannage

### Les variables ne sont pas prises en compte

**Solution** :
1. Vérifiez que vous avez redéployé après avoir ajouté les variables
2. Les variables ne sont pas appliquées rétroactivement
3. Un nouveau build est nécessaire

### Erreur "GOOGLE_CALENDAR_CLIENT_ID is undefined"

**Solution** :
1. Vérifiez que les variables sont bien ajoutées dans Vercel
2. Vérifiez qu'elles sont activées pour "Production"
3. Redéployez le projet

### Le refresh token ne fonctionne pas

**Solution** :
1. Vérifiez que vous avez bien copié le token complet (il est très long)
2. Vérifiez qu'il n'y a pas d'espaces avant/après
3. Vérifiez que vous avez obtenu le token avec le bon compte (`centre.audire@gmail.com`)

---

## 📊 Résumé

| Configuration | Fichier `.env` local | Variables Vercel |
|--------------|---------------------|------------------|
| **Local dev** | ✅ Nécessaire | ⚠️ Avec Vercel CLI |
| **Production** | ❌ Non utilisé | ✅ **Recommandé** |
| **Sécurité** | ⚠️ Risque si commité | ✅ Sécurisé |
| **Facilité** | 🟡 Manuel | 🟢 Interface web |

---

## 🎯 À retenir

- ✅ **Sur Vercel** : Utilisez les variables d'environnement Vercel
- ✅ **Pas de fichier .env** nécessaire en production
- ✅ **Redéployez** après avoir ajouté les variables
- ✅ **Testez** votre site après le déploiement

---

**C'est tout ! Votre application sera configurée et opérationnelle. 🎉**
