# 🔑 Guide pour obtenir le Refresh Token Google Calendar

## Vous êtes ici parce que :
✅ Vous avez créé un projet Google Cloud Console
✅ Vous avez activé l'API Google Calendar
✅ Vous avez créé des credentials OAuth 2.0 (type: Desktop app)
✅ Vous avez téléchargé le fichier JSON

❌ MAIS vous n'avez pas encore le REFRESH_TOKEN

---

## 📋 MARCHE À SUIVRE (ÉTAPE PAR ÉTAPE)

### Étape 1 : Trouvez vos credentials

Ouvrez le fichier JSON que vous avez téléchargé. Il ressemble à ça :

```json
{
  "installed": {
    "client_id": "123456789-xxxxxxxx.apps.googleusercontent.com",
    "client_secret": "GOCSPX-XxXxXxXxXxXxXxXxXxXxXx",
    "project_id": "votre-projet",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    ...
  }
}
```

**Copiez** :
- Le `client_id` (ligne 3)
- Le `client_secret` (ligne 4)

---

### Étape 2 : Modifiez le script get-refresh-token.js

Ouvrez le fichier `get-refresh-token.js` et **remplacez** :

```javascript
const CLIENT_ID = 'VOTRE_CLIENT_ID_ICI';        // ← Collez votre client_id ici
const CLIENT_SECRET = 'VOTRE_CLIENT_SECRET_ICI'; // ← Collez votre client_secret ici
```

Par exemple :
```javascript
const CLIENT_ID = '123456789-xxxxxxxx.apps.googleusercontent.com';
const CLIENT_SECRET = 'GOCSPX-XxXxXxXxXxXxXxXxXxXxXx';
```

---

### Étape 3 : Exécutez le script

Dans votre terminal :

```bash
node get-refresh-token.js
```

---

### Étape 4 : Autorisez l'application

Le script va afficher un lien qui ressemble à :

```
https://accounts.google.com/o/auth?client_id=...
```

**➡️ Cliquez sur ce lien** (ou copiez-le dans votre navigateur)

1. Connectez-vous avec votre compte Google (**centre.audire@gmail.com**)
2. Google va vous dire "Cette application n'est pas vérifiée"
   - Cliquez sur **"Paramètres avancés"**
   - Cliquez sur **"Accéder à [nom de votre app] (non sécurisé)"**
3. Autorisez l'accès à Google Calendar

---

### Étape 5 : Copiez le code d'autorisation

Après avoir autorisé, Google va afficher un **code d'autorisation**.

**Exemple** : `4/0AY0e-g7xxxxxxxxxxxxxxxxxxxxxxxxxxx`

**➡️ Copiez ce code**

---

### Étape 6 : Collez le code dans le terminal

Le script attend votre code :

```
📝 Entrez le code d'autorisation ici : _
```

**➡️ Collez le code** et appuyez sur **Entrée**

---

### Étape 7 : Récupérez votre Refresh Token ! 🎉

Le script va afficher :

```
🎉 Succès ! Voici votre Refresh Token :

🔑 REFRESH_TOKEN = 1//0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

📋 Copiez ce token et ajoutez-le dans votre fichier .env :
GOOGLE_CALENDAR_REFRESH_TOKEN="1//0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

---

### Étape 8 : Ajoutez-le au fichier .env

Créez (ou modifiez) votre fichier `.env` et ajoutez :

```env
GOOGLE_CALENDAR_CLIENT_ID="votre-client-id"
GOOGLE_CALENDAR_CLIENT_SECRET="votre-client-secret"
GOOGLE_CALENDAR_REFRESH_TOKEN="1//0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
GOOGLE_CALENDAR_ID="RDV Site"
```

---

## ✅ C'est terminé !

Vous pouvez maintenant :
- Supprimer le fichier `get-refresh-token.js`
- Supprimer le fichier credentials JSON téléchargé (vous n'en avez plus besoin)

Votre système de rendez-vous pourra maintenant créer des événements dans Google Calendar ! 🎊

---

## ❌ Problèmes courants

### Le script affiche "Error retrieving access token"

**Solution** :
- Vérifiez que vous avez bien copié le CLIENT_ID et CLIENT_SECRET (avec les guillemets)
- Vérifiez que le code d'autorisation est complet (sans espaces avant/après)
- Vérifiez que l'API Google Calendar est activée dans Google Cloud Console

### Le refresh_token est "undefined"

**Solution** :
Ajoutez `prompt: 'consent'` dans le script (c'est déjà fait dans le script fourni)

### Google dit "Cette application n'est pas vérifiée"

**C'est normal !** Votre application n'est pas publique, elle est juste pour votre usage.
- Cliquez sur "Paramètres avancés"
- Puis "Accéder à [nom de votre app] (non sécurisé)"

---

## 📞 Besoin d'aide ?

Si vous êtes bloqué, vérifiez que vous avez bien :
1. ✅ Créé un projet Google Cloud Console
2. ✅ Activé l'API Google Calendar
3. ✅ Créé des credentials OAuth 2.0 de type **Desktop app** (PAS Web application)
4. ✅ Téléchargé le fichier JSON
5. ✅ Copié le client_id et client_secret dans le script

---

🎯 **Rappel** : Le refresh_token vous permet d'accéder à Google Calendar de manière permanente, sans avoir à vous reconnecter à chaque fois.
