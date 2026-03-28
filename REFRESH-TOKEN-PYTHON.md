# 🐍 Script Python - Obtenir le Refresh Token Google Calendar

## 📋 Prérequis

Vous devez avoir Python 3.6+ installé sur votre machine.

## 🚀 Installation et utilisation

### Étape 1 : Téléchargez le script

Téléchargez le fichier `get-refresh-token.py` sur votre machine locale.

### Étape 2 : Installez la dépendance Google

Ouvrez un terminal et exécutez :

```bash
pip install google-auth-oauthlib
```

Ou si vous utilisez Python 3 :

```bash
pip3 install google-auth-oauthlib
```

### Étape 3 : Exécutez le script

```bash
python get-refresh-token.py
```

Ou :

```bash
python3 get-refresh-token.py
```

### Étape 4 : Suivez les instructions du script

Le script va vous demander :

1. **Votre CLIENT_ID**
   - Ouvrez le fichier JSON téléchargé depuis Google Cloud Console
   - Copiez la valeur de `client_id`
   - Collez-la dans le terminal

2. **Votre CLIENT_SECRET**
   - Dans le même fichier JSON
   - Copiez la valeur de `client_secret`
   - Collez-la dans le terminal

3. **Autorisation Google**
   - Le script affichera une URL
   - Copiez cette URL dans votre navigateur
   - Connectez-vous avec **centre.audire@gmail.com**
   - Autorisez l'accès (cliquez sur "Paramètres avancés" si non vérifié)
   - Copiez le code d'autorisation

4. **Code d'autorisation**
   - Collez le code dans le terminal
   - Le script affichera votre **REFRESH TOKEN** 🎉

### Étape 5 : Copiez le refresh token

Le script affichera quelque chose comme :

```
🔑 VOTRE REFRESH TOKEN :
------------------------------------------------------------
1//0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
------------------------------------------------------------

📋 Copiez cette ligne dans votre fichier .env :
------------------------------------------------------------
GOOGLE_CALENDAR_REFRESH_TOKEN="1//0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
------------------------------------------------------------
```

Copiez cette valeur dans votre fichier `.env` sur le serveur.

## ✅ Fichier .env final

Votre fichier `.env` devrait contenir :

```env
GOOGLE_CALENDAR_CLIENT_ID="votre-client-id"
GOOGLE_CALENDAR_CLIENT_SECRET="votre-client-secret"
GOOGLE_CALENDAR_REFRESH_TOKEN="le-refresh-token-obtenu"
GOOGLE_CALENDAR_ID="RDV Site"
```

## ❌ Problèmes courants

### "ModuleNotFoundError: No module named 'google_auth_oauthlib'"

**Solution** : Installez la dépendance
```bash
pip install google-auth-oauthlib
```

### "Pas de refresh token reçu"

**Solution** : Google ne renvoie le refresh_token que la première fois.

Si vous avez déjà autorisé cette application auparavant :
1. Allez sur https://myaccount.google.com/permissions
2. Trouvez votre application dans la liste
3. Cliquez sur "Supprimer l'accès"
4. Réexécutez le script

### "Cette application n'est pas vérifiée"

**C'est NORMAL !** Votre application n'est pas publique.

1. Cliquez sur "Paramètres avancés"
2. Cliquez sur "Accéder à [nom de votre app] (non sécurisé)"
3. Autorisez l'accès

## 🎯 Avantages du script Python

✅ Pas besoin de Node.js
✅ Fonctionne sur n'importe quelle machine avec Python
✅ Interface interactive et guidée
✅ Messages d'erreur clairs
✅ Nettoyage automatique des fichiers temporaires

## 📝 Notes

- Ce script est totalement autonome
- Il ne modifie rien sur votre serveur
- Il ne stocke aucune information
- Vous pouvez le supprimer après utilisation
- Le refresh token ne change jamais (sauf si vous révoquez l'accès)

---

**Besoin d'aide ?** Consultez le guide complet dans `REFRESH-TOKEN-GUIDE.md`
