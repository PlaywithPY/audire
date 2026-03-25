# 🎛️ Admin Simple - Audire

Interface d'administration simple et fonctionnelle pour gérer les contenus du site Audire.

**✅ Fonctionne sur GitHub Pages sans OAuth !**

---

## 🚀 Accès à l'interface

### En production (GitHub Pages)
👉 **https://audire.be/admin-simple/**

### En local
```bash
python3 -m http.server 8000
# Puis ouvrir : http://localhost:8000/admin-simple/
```

---

## 🔐 Configuration (une seule fois)

### Étape 1 : Créer un Personal Access Token GitHub

1. **Allez sur :** https://github.com/settings/tokens/new

2. **Remplissez le formulaire :**
   - **Note :** `Audire Admin` (nom du token)
   - **Expiration :** `No expiration` (ou 1 an si vous préférez)
   - **Permissions :** Cochez `repo` (accès complet au repository)

3. **Cliquez sur "Generate token"**

4. **⚠️ IMPORTANT : Copiez le token immédiatement**
   - Format : `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Vous ne pourrez plus le voir après !
   - Conservez-le en lieu sûr (gestionnaire de mots de passe)

### Étape 2 : Se connecter à l'interface

1. Ouvrez `/admin-simple/`
2. Collez votre token dans le champ
3. Cliquez sur "Se connecter"
4. ✅ C'est tout !

**Le token est sauvegardé dans votre navigateur** (localStorage). Vous n'aurez plus besoin de le ressaisir.

---

## 📝 Utilisation

### Interface à onglets

L'interface est organisée en 3 onglets :

#### 📞 **Contact**
Gérez les informations de contact du site :
- Téléphone (affichage et lien)
- Email
- Adresse complète
- Province

**Impact :** Change automatiquement sur toutes les pages du site

#### 🏠 **Accueil**
Modifiez le contenu de la page d'accueil :
- Titre principal (H1)
- Sous-titre (description)
- Badge (kicker)
- Puces (chips) - une par ligne
- Section "Ce qu'on fait"

#### 🧭 **Navigation**
Gérez les menus du site :
- **Menu principal** : liens dans la navigation desktop
- **Liens topbar** : liens dans la barre du haut

Pour chaque lien :
- **Texte** : Le texte affiché
- **URL** : L'URL de destination (ex: `/contact/`)

Vous pouvez :
- ➕ Ajouter des liens
- 🗑️ Supprimer des liens
- Modifier l'ordre (haut = gauche)

---

## 💾 Sauvegarde

1. **Modifiez** les contenus dans l'interface
2. **Cliquez** sur le bouton "💾 Sauvegarder" de l'onglet concerné
3. **Attendez** la confirmation "✅ ... sauvegardé !"

**Que se passe-t-il ?**
1. L'interface commit vos modifications sur GitHub
2. GitHub Pages redéploie automatiquement le site (~1 minute)
3. Vos changements sont en ligne ! 🎉

**Vous pouvez vérifier :**
- Les commits sur GitHub : https://github.com/PlaywithPY/audire/commits/main
- Chaque sauvegarde crée un commit avec le message : "Update ... via admin"

---

## 🔒 Sécurité

### Le token est-il sécurisé ?

**✅ Oui, si vous suivez ces règles :**

1. **Ne partagez JAMAIS votre token** avec personne
2. **Utilisez HTTPS** (GitHub Pages force HTTPS automatiquement)
3. **Limitez les permissions** au repository `audire` uniquement
4. **Révoquez le token** si vous pensez qu'il est compromis

**Comment révoquer un token :**
1. Allez sur : https://github.com/settings/tokens
2. Trouvez "Audire Admin"
3. Cliquez sur "Delete"
4. Créez un nouveau token si besoin

### Puis-je partager l'accès ?

**Oui !** Chaque personne qui doit gérer le contenu doit :
1. Avoir accès au repository GitHub (collaborateur)
2. Créer son propre token GitHub
3. Se connecter avec son token

**Ne partagez jamais le même token.**

---

## 🛠️ Fichiers modifiés

L'interface édite ces fichiers JSON dans `/content/` :

| Fichier | Contenu |
|---------|---------|
| `content/contact.json` | Informations de contact |
| `content/pages/homepage.json` | Contenu page d'accueil |
| `content/navigation.json` | Menus de navigation |

**Vous pouvez aussi les éditer manuellement** directement sur GitHub si vous préférez.

---

## ❓ FAQ

### L'interface ne charge pas ?
- Vérifiez que vous êtes sur HTTPS (obligatoire)
- Videz le cache du navigateur (Ctrl+Shift+R)
- Vérifiez la console pour les erreurs (F12)

### "Token invalide" ?
- Vérifiez que le token commence par `ghp_`
- Assurez-vous d'avoir coché la permission `repo`
- Le token a peut-être expiré → créez-en un nouveau

### Mes modifications ne sont pas visibles ?
- Attendez ~1 minute (déploiement GitHub Pages)
- Videz le cache du navigateur
- Vérifiez que le commit est bien sur GitHub

### Je veux annuler mes modifications
- Allez dans l'historique GitHub : https://github.com/PlaywithPY/audire/commits/main
- Trouvez le commit "avant" votre modification
- Restaurez le fichier concerné

### Puis-je modifier d'autres pages ?
Actuellement, seules 3 sections sont éditables. Pour ajouter d'autres pages :
1. Créez le fichier JSON dans `/content/pages/`
2. Ajoutez l'onglet dans `/admin-simple/index.html`
3. Ajoutez la logique dans `/admin-simple/app.js`

Ou contactez le développeur pour ajouter de nouvelles sections.

---

## 🆘 Support

**Problème technique ?**
- Ouvrez une issue : https://github.com/PlaywithPY/audire/issues
- Vérifiez la console navigateur (F12) pour les erreurs

**Besoin d'aide ?**
- Documentation complète dans `/admin/README.md` (Decap CMS)
- Documentation développeur dans le README principal

---

## 🔄 Différence avec Decap CMS (`/admin/`)

| Fonctionnalité | Admin Simple | Decap CMS |
|----------------|--------------|-----------|
| **Auth GitHub Pages** | ✅ Personal Token | ❌ Nécessite OAuth |
| **Simplicité** | ✅ Très simple | ⚠️ Plus complexe |
| **Fonctionnalités** | ⚠️ Basique | ✅ Avancé (images, markdown, etc.) |
| **Personnalisable** | ✅ Facile | ⚠️ Plus difficile |

**Recommandation :**
- **Admin Simple** : Pour les modifications rapides et simples
- **Decap CMS** : Si vous migrez vers Netlify ou configurez OAuth

---

## 🎯 Prochaines améliorations possibles

- [ ] Édition des autres pages (FAQ, Solutions, etc.)
- [ ] Prévisualisation des changements
- [ ] Upload d'images
- [ ] Historique des modifications
- [ ] Mode brouillon
- [ ] Support Markdown

---

Bon travail ! 🎉
