# 🚀 Audire - Site Next.js

Nouveau site moderne d'Audire développé avec Next.js 16, TypeScript et Tailwind CSS.

## 🎯 Stack Technique

- **Framework**: Next.js 16 (App Router)
- **Langage**: TypeScript
- **Styling**: Tailwind CSS
- **Base de données**: Vercel Postgres (à configurer)
- **Authentification**: NextAuth.js (à configurer)
- **Déploiement**: Vercel
- **Upload d'images**: Vercel Blob (à configurer)

## 🚀 Démarrage rapide

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Ouvrir http://localhost:3000
```

## 📁 Structure du projet

```
next-app/
├── src/
│   ├── app/              # Pages (App Router)
│   │   ├── layout.tsx    # Layout principal
│   │   ├── page.tsx      # Page d'accueil
│   │   └── globals.css   # Styles globaux
│   ├── components/       # Composants réutilisables
│   └── lib/             # Utilitaires et helpers
├── public/              # Assets statiques
└── package.json
```

## 🎨 Pages à migrer

- [x] Page d'accueil (démo créée)
- [ ] Solutions auditives
- [ ] Remboursements
- [ ] Contact
- [ ] FAQ
- [ ] Notre accompagnement
- [ ] Partenaires pharmaciens

## 🔧 Dashboard Admin (à créer)

Le dashboard admin permettra de :
- ✅ Gérer toutes les pages
- ✅ Upload d'images drag & drop
- ✅ Éditeur WYSIWYG
- ✅ Prévisualisation en temps réel
- ✅ Gestion des utilisateurs

## 📦 Déploiement sur Vercel

1. Push le code sur GitHub
2. Connecter le repo à Vercel
3. Configurer les variables d'environnement
4. Déployer !

```bash
# Build de production
npm run build

# Lancer en production
npm start
```

## 🔐 Variables d'environnement

Créer un fichier `.env.local` :

```env
# Base de données
POSTGRES_URL=your_postgres_url

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key

# Vercel Blob (pour les images)
BLOB_READ_WRITE_TOKEN=your_token
```

## 🎯 Prochaines étapes

1. **Migrer les pages restantes**
2. **Créer le dashboard admin**
3. **Connecter une base de données**
4. **Configurer l'authentification**
5. **Implémenter l'upload d'images**
6. **Déployer sur Vercel**

## 📝 Notes

- L'ancien site reste dans `/` pendant la migration
- Le nouveau site est dans `/next-app/`
- Une fois la migration terminée, on remplacera l'ancien site
