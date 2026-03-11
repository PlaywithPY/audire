# 🚀 Configuration du Blob Storage pour Audire

Guide complet pour activer l'upload d'images sur le site Audire.

---

## 🎯 Objectif

Permettre à l'admin de **uploader des images** directement depuis le dashboard, qui seront hébergées sur **Vercel Blob Storage** (CDN ultra-rapide).

---

## 📋 Prérequis

- Un compte Vercel (gratuit ou payant)
- Le projet Audire déployé sur Vercel
- Accès au dashboard Vercel

---

## ⚙️ Configuration sur Vercel (2 minutes)

### 1️⃣ Aller dans les paramètres du projet

1. Connecte-toi à [vercel.com](https://vercel.com)
2. Ouvre le projet **audire** (next-app)
3. Clique sur **"Storage"** dans le menu de gauche

### 2️⃣ Créer un Blob Storage

1. Clique sur **"Create Database"**
2. Sélectionne **"Blob"**
3. Donne un nom : `audire-images` (ou ce que tu veux)
4. Choisis la région la plus proche : **Europe (eu-central-1 - Frankfurt)** recommandé
5. Clique sur **"Create"**

### 3️⃣ Connecter au projet

1. Une fois créé, clique sur **"Connect to Project"**
2. Sélectionne le projet **next-app**
3. Clique sur **"Connect"**

✅ **C'EST TOUT !** Vercel va automatiquement ajouter les variables d'environnement nécessaires.

---

## 🔑 Variables d'environnement (automatiques)

Vercel ajoute automatiquement ces variables à ton projet :

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

**Tu n'as RIEN à copier manuellement !** 🎉

---

## 🧪 Tester en local (optionnel)

Si tu veux tester en local sur ton ordinateur :

### 1️⃣ Récupérer le token

1. Va dans **Settings → Environment Variables**
2. Trouve `BLOB_READ_WRITE_TOKEN`
3. Clique sur "Show" et copie la valeur

### 2️⃣ Créer `.env.local`

Dans `next-app/`, crée le fichier `.env.local` :

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

### 3️⃣ Redémarrer le serveur

```bash
npm run dev
```

---

## 📸 Utilisation dans le Dashboard

### Comment uploader une image :

1. Connecte-toi au dashboard admin : `/admin`
2. Va dans l'onglet **"🧱 Contenu"**
3. Section **"🖼️ Médiathèque - Vos images"**
4. Clique sur **"📤 Uploader une image"**
5. Choisis ton fichier (JPEG, PNG, GIF, WebP, SVG - max 5MB)
6. ✅ L'image est uploadée et apparaît dans la galerie !

### Comment utiliser l'image :

1. Clique sur **"📋 Copier URL"** sur l'image
2. Utilise cette URL dans tes blocs HTML ou texte

**Exemple dans un bloc HTML :**
```html
<img src="https://xxx.blob.vercel-storage.com/1234567890-logo.png" alt="Logo" />
```

---

## 📊 Limites du Blob Storage

### Plan Gratuit (Hobby) :
- **1 GB** de stockage
- **100 GB** de bande passante/mois
- ✅ Largement suffisant pour un site vitrine avec quelques images

### Plan Pro (20$/mois) :
- **100 GB** de stockage
- **1 TB** de bande passante/mois

---

## 🔒 Sécurité

✅ **Accès protégé** : Seuls les admins authentifiés peuvent uploader/supprimer
✅ **Validation** : Types de fichiers et taille vérifiés
✅ **Public** : Les images sont accessibles publiquement (c'est normal pour un site web)

---

## 🐛 Dépannage

### Erreur : "BLOB_READ_WRITE_TOKEN not found"

**Cause** : Le Blob Storage n'est pas connecté au projet

**Solution** :
1. Va dans Vercel → Storage → Blob
2. Clique sur "Connect to Project"
3. Redéploie le projet

### Erreur : "Failed to upload file"

**Cause** : Fichier trop volumineux ou type invalide

**Solution** :
- Vérifie que l'image fait moins de 5MB
- Utilise un format supporté (JPEG, PNG, GIF, WebP, SVG)

### Les images ne s'affichent pas

**Cause** : URLs incorrectes ou CDN en cache

**Solution** :
- Vérifie que l'URL commence par `https://xxx.blob.vercel-storage.com/`
- Attends 30 secondes pour que le CDN se mette à jour
- Ctrl+F5 pour vider le cache du navigateur

---

## 📦 Architecture technique

```
┌─────────────────┐
│  Admin Upload   │
│   (Dashboard)   │
└────────┬────────┘
         │
         │ POST /api/admin/upload
         ▼
┌─────────────────┐
│   Vercel Blob   │ ← Hébergement CDN ultra-rapide
│    Storage      │   Images distribuées mondialement
└────────┬────────┘
         │
         │ URL publique
         ▼
┌─────────────────┐
│  Site Audire    │
│  (Frontend)     │
└─────────────────┘
```

---

## ✅ Checklist finale

- [ ] Blob Storage créé sur Vercel
- [ ] Connecté au projet next-app
- [ ] Variables d'environnement ajoutées automatiquement
- [ ] Projet redéployé
- [ ] Test d'upload d'une image depuis le dashboard
- [ ] Image visible dans la galerie
- [ ] URL copiée et utilisable

---

## 🎉 C'est prêt !

Une fois configuré, tu peux uploader autant d'images que tu veux depuis le dashboard admin, et elles seront automatiquement hébergées sur le CDN de Vercel pour un chargement ultra-rapide partout dans le monde ! 🚀

**Temps total de configuration : ~2 minutes** ⏱️
