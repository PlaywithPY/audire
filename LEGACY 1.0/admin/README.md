# Interface d'administration Audire

Cette interface permet d'éditer facilement tous les contenus du site sans toucher au code.

## 🚀 Accès à l'admin

### En production (après déploiement)
Accédez à : `https://audire.be/admin/`

⚠️ **Important** : Pour utiliser l'admin en production, vous devez :

1. **Configurer GitHub OAuth** (nécessaire pour l'authentification)
   - Allez sur https://github.com/settings/developers
   - Créez une nouvelle "OAuth App"
   - Homepage URL: `https://audire.be`
   - Callback URL: `https://api.netlify.com/auth/done`
   - Notez le Client ID et Client Secret

2. **Configurer Netlify Identity** (service gratuit pour l'auth)
   - Option 1: Déployer sur Netlify (plus simple)
   - Option 2: Utiliser un service d'auth tiers compatible

### En local (pour tester)

**Option 1 : Mode test-repo (plus simple)**

1. Modifiez temporairement `/admin/config.yml` :
   ```yaml
   backend:
     name: test-repo
   ```

2. Lancez un serveur local :
   ```bash
   python3 -m http.server 8000
   ```

3. Accédez à : `http://localhost:8000/admin/`

4. ✅ Vous pouvez maintenant éditer les contenus !
   ⚠️ Les modifications ne sont PAS sauvegardées (mode test uniquement)

**Option 2 : Backend local (pour vraies modifications)**

1. Installez le proxy Decap CMS :
   ```bash
   npx decap-server
   ```

2. Modifiez `/admin/config.yml` :
   ```yaml
   local_backend: true
   ```

3. Lancez votre serveur local

4. Accédez à : `http://localhost:8000/admin/`

## 📝 Ce que vous pouvez éditer

### ⚙️ Paramètres du site
- **Informations de contact** : téléphone, email, adresse
- **Menu de navigation** : ajouter/modifier/supprimer des liens

### 📄 Pages
- **Page d'accueil** : titre, sous-titre, puces, sections
- **Page Contact** : contenu personnalisable
- **Page FAQ** : questions et réponses
- **Page Partenaires** : informations pour les pharmaciens

### 🎧 Solutions auditives
Créez et gérez des fiches produits pour vos appareils auditifs (Oticon, Bernafon, etc.)

### ❓ Questions FAQ
Ajoutez autant de questions/réponses que nécessaire

## 🔧 Comment ça marche ?

1. **Édition** : Vous modifiez les contenus via l'interface web
2. **Sauvegarde** : Decap CMS commit automatiquement sur GitHub
3. **Déploiement** : GitHub Pages redéploie le site automatiquement
4. **Résultat** : Vos modifications sont en ligne en ~1 minute !

## 🆘 Alternative simple

Si Decap CMS est trop complexe à configurer, vous pouvez :

1. **Éditer directement les fichiers JSON** dans `/content/`
   - `contact.json` : infos de contact
   - `pages/homepage.json` : contenu de l'accueil
   - etc.

2. **Commiter sur GitHub** (via l'interface web ou en local)

3. **GitHub Pages redéploie automatiquement**

## 📚 Documentation

- [Decap CMS](https://decapcms.org/)
- [Configuration backend GitHub](https://decapcms.org/docs/github-backend/)
