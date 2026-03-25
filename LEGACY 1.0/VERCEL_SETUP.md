# Configuration Vercel - Variables d'environnement

## ⚠️ URGENT : Ajouter les variables d'environnement sur Vercel

Pour que l'authentification admin fonctionne, vous devez ajouter ces variables d'environnement dans les paramètres de votre projet Vercel.

## 📝 Variables à ajouter

### 1. Aller dans les Settings

1. Connectez-vous à [Vercel](https://vercel.com)
2. Sélectionnez votre projet **audire**
3. Allez dans **Settings** → **Environment Variables**

### 2. Ajouter ces variables

| Nom | Valeur | Environnements |
|-----|--------|----------------|
| `NEXTAUTH_URL` | `https://votre-domaine.vercel.app` | Production |
| `NEXTAUTH_URL` | `https://votre-preview.vercel.app` | Preview (optionnel) |
| `NEXTAUTH_SECRET` | [voir ci-dessous](#générer-nextauth_secret) | Production, Preview, Development |
| `ADMIN_USERNAME` | `admin` (ou votre choix) | Production, Preview, Development |
| `ADMIN_PASSWORD` | [voir ci-dessous](#choisir-un-mot-de-passe-fort) | Production, Preview, Development |

### 3. Générer NEXTAUTH_SECRET

**Option 1 : En ligne de commande** (recommandé)
```bash
openssl rand -base64 32
```

**Option 2 : Site web**
- Allez sur https://generate-secret.vercel.app/32
- Copiez le secret généré

**Exemple de valeur :**
```
XyZ123aBcDeFgHiJkLmNoPqRsTuVwXyZ456=
```

### 4. Choisir un mot de passe fort

⚠️ **IMPORTANT** : N'utilisez PAS "changez-ce-mot-de-passe" !

Utilisez un mot de passe fort :
- Au moins 16 caractères
- Mélange de lettres, chiffres et symboles
- Unique à cette application

**Exemple :**
```
MyStr0ng@P@ssw0rd!2024#Aud1r3
```

## 🔄 Après avoir ajouté les variables

1. Cliquez sur **Save** pour chaque variable
2. **Redéployez** votre application :
   - Allez dans **Deployments**
   - Cliquez sur les "..." à côté du dernier déploiement
   - Sélectionnez **Redeploy**

## ✅ Vérifier que ça fonctionne

1. Allez sur `https://votre-domaine.vercel.app/admin`
2. Vous devriez être redirigé vers `/admin/login`
3. Connectez-vous avec :
   - **Username** : celui que vous avez défini dans `ADMIN_USERNAME`
   - **Password** : celui que vous avez défini dans `ADMIN_PASSWORD`
4. Vous devriez accéder au dashboard admin

## 🔧 Variables déjà configurées

Ces variables sont déjà dans votre projet (configurées automatiquement par Vercel/Neon) :
- ✅ `DATABASE_URL` - Connexion PostgreSQL (Neon)

## 📋 Résumé des valeurs

Pour référence, voici un exemple de configuration complète :

```env
# Base de données (déjà configurée par Vercel)
DATABASE_URL="postgresql://..."

# NextAuth (À AJOUTER)
NEXTAUTH_URL="https://audire.vercel.app"
NEXTAUTH_SECRET="[généré avec openssl rand -base64 32]"

# Admin Credentials (À AJOUTER)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="[mot de passe fort unique]"
```

## 🔐 Sécurité

- ✅ Ne commitez JAMAIS le fichier `.env` dans git
- ✅ Changez le mot de passe régulièrement
- ✅ Utilisez des mots de passe différents pour dev/preview/prod si possible
- ✅ Le `NEXTAUTH_SECRET` doit être différent entre environnements

## 🐛 Dépannage

### Erreur "Unauthorized" sur les routes API

➡️ Vérifiez que toutes les variables sont bien configurées et redéployez

### Impossible de se connecter

➡️ Vérifiez que `ADMIN_USERNAME` et `ADMIN_PASSWORD` correspondent à vos identifiants

### Erreur 500 lors du login

➡️ Vérifiez que `NEXTAUTH_SECRET` et `NEXTAUTH_URL` sont bien configurés

### Redirection infinie

➡️ Vérifiez que `NEXTAUTH_URL` correspond exactement à votre domaine (avec https://)
