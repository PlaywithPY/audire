# 🔐 Résoudre l'erreur OAuth 403 : access_denied

## ❌ Le problème que vous rencontrez

Quand vous essayez d'autoriser l'application OAuth, vous voyez :

```
Accès bloqué : AUDIRE RDV n'a pas terminé la procédure de validation de Google
centre.audire@gmail.com
AUDIRE RDV n'a pas terminé la procédure de validation de Google.
L'appli est en cours de test et seuls les testeurs approuvés par le développeur y ont accès.
Erreur 403 : access_denied
```

**Cause** : Votre application OAuth est en **mode test** et l'email `centre.audire@gmail.com` n'est pas dans la liste des utilisateurs test autorisés.

---

## ✅ Solution : Ajouter l'email comme utilisateur test

### Étape 1 : Accéder à Google Cloud Console

1. Ouvrez [Google Cloud Console](https://console.cloud.google.com/)
2. Connectez-vous avec le compte qui a créé le projet (probablement `centre.audire@gmail.com`)

### Étape 2 : Sélectionner le bon projet

- En haut de la page, cliquez sur le **sélecteur de projet**
- Sélectionnez votre projet (**"AUDIRE RDV"** ou le nom que vous avez donné)

### Étape 3 : Accéder à l'écran de consentement OAuth

1. Dans le menu ☰ (à gauche), allez dans :
   ```
   APIs & Services → OAuth consent screen
   ```

2. Vous verrez un écran avec les informations de votre application

### Étape 4 : Ajouter un utilisateur test

1. **Descendez** jusqu'à la section **"Test users"** (utilisateurs test)

2. Cliquez sur le bouton **"+ ADD USERS"**

3. Dans le champ qui apparaît, entrez l'email :
   ```
   centre.audire@gmail.com
   ```

4. Cliquez sur **"SAVE"** (Enregistrer) en bas de la page

### Étape 5 : Vérifier l'ajout

Vous devriez maintenant voir `centre.audire@gmail.com` dans la liste des "Test users".

---

## 🚀 Obtenir votre Refresh Token

Maintenant que l'email est autorisé, vous pouvez obtenir votre refresh token.

### Choisissez votre méthode :

#### Option A : Avec Python (Recommandé - Plus simple)

1. **Installez la dépendance** :
   ```bash
   pip install google-auth-oauthlib
   ```

2. **Lancez le script** :
   ```bash
   python get-refresh-token.py
   ```

3. **Suivez les instructions** :
   - Le script vous demandera votre `CLIENT_ID` et `CLIENT_SECRET`
   - Il affichera une URL d'autorisation
   - Copiez l'URL dans votre navigateur
   - Connectez-vous avec `centre.audire@gmail.com`
   - **Cette fois, ça devrait fonctionner !** ✅
   - Autorisez l'accès à Google Calendar
   - Copiez le code d'autorisation
   - Collez-le dans le terminal

4. **Récupérez votre refresh token** :
   - Le script affichera votre `REFRESH_TOKEN`
   - Copiez-le et ajoutez-le dans votre fichier `.env`

#### Option B : Avec Node.js

1. **Modifiez le fichier `get-refresh-token.js`** :
   - Ouvrez le fichier
   - Remplacez `VOTRE_CLIENT_ID_ICI` par votre CLIENT_ID
   - Remplacez `VOTRE_CLIENT_SECRET_ICI` par votre CLIENT_SECRET

2. **Lancez le script** :
   ```bash
   node get-refresh-token.js
   ```

3. **Suivez les instructions** (comme pour Python ci-dessus)

---

## 📝 Ajouter le Refresh Token au fichier .env

Créez ou modifiez votre fichier `.env` à la racine du projet :

```env
# Google Calendar API
GOOGLE_CALENDAR_CLIENT_ID="votre-client-id-ici"
GOOGLE_CALENDAR_CLIENT_SECRET="votre-client-secret-ici"
GOOGLE_CALENDAR_REFRESH_TOKEN="1//0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
GOOGLE_CALENDAR_ID="RDV Site"
```

---

## ✅ Vérifier que tout fonctionne

Une fois le refresh token ajouté :

1. **Démarrez votre application** :
   ```bash
   npm run dev
   ```

2. **Testez la prise de rendez-vous** :
   - Allez sur votre site local : `http://localhost:3000`
   - Cliquez sur "Prendre RDV"
   - Remplissez le formulaire
   - Validez

3. **Vérifiez Google Calendar** :
   - Ouvrez [Google Calendar](https://calendar.google.com/)
   - Allez dans l'agenda "RDV Site"
   - Vous devriez voir le rendez-vous ajouté automatiquement ! 🎉

---

## ❓ Problèmes courants

### "Cette application n'est pas vérifiée"

**C'est normal !** Votre application est en mode test.

**Solution** :
1. Cliquez sur **"Paramètres avancés"** (en bas à gauche)
2. Cliquez sur **"Accéder à AUDIRE RDV (non sécurisé)"**
3. Continuez l'autorisation

### "Le refresh_token est undefined"

**Cause** : Google a déjà autorisé cette application auparavant.

**Solution** :
1. Allez sur [Google Account Permissions](https://myaccount.google.com/permissions)
2. Trouvez "AUDIRE RDV" dans la liste
3. Cliquez sur "Supprimer l'accès"
4. Relancez le script `get-refresh-token.py` ou `get-refresh-token.js`

### "Error retrieving access token"

**Causes possibles** :
- Le `CLIENT_ID` ou `CLIENT_SECRET` est incorrect
- Le code d'autorisation est incomplet ou a expiré
- L'API Google Calendar n'est pas activée

**Solution** :
1. Vérifiez vos credentials dans Google Cloud Console
2. Vérifiez que l'API Google Calendar est activée :
   - Google Cloud Console → APIs & Services → Library
   - Recherchez "Google Calendar API"
   - Assurez-vous qu'elle est "Enabled"

---

## 🎯 Récapitulatif

✅ Ajoutez `centre.audire@gmail.com` comme testeur dans Google Cloud Console
✅ Lancez le script `get-refresh-token.py` (ou `.js`)
✅ Autorisez l'accès avec l'email autorisé
✅ Copiez le refresh token dans votre `.env`
✅ Testez votre système de rendez-vous

---

## 🔒 Note de sécurité

**Mode test vs Mode production** :

- **Mode test** (actuel) : Seuls les emails dans "Test users" peuvent utiliser l'OAuth
  - ✅ **Recommandé** si vous utilisez l'app uniquement pour votre centre
  - ✅ Pas de validation Google nécessaire
  - ✅ Configuration rapide

- **Mode production** : Tout le monde peut utiliser l'OAuth
  - ❌ Nécessite une validation par Google (plusieurs jours/semaines)
  - ❌ Formulaire de demande de vérification complexe
  - ⚠️ **Pas nécessaire** pour votre usage interne

**Notre recommandation** : Restez en mode test, c'est largement suffisant pour un usage interne !

---

## 📞 Besoin d'aide ?

Si vous êtes toujours bloqué après avoir suivi ce guide :

1. Vérifiez que vous avez bien ajouté l'email comme testeur
2. Vérifiez que vous utilisez le bon compte Google (celui qui a créé le projet)
3. Vérifiez que l'API Google Calendar est activée
4. Essayez de révoquer l'accès et de recommencer

---

**Bon courage ! 🚀**
