# 🔧 Corriger l'erreur 404 "Not Found" du Google Calendar

## 🐛 Le problème

Vous rencontrez cette erreur dans les logs :

```
Error creating calendar event: Error: Not Found
code: 404,
status: 404
```

Le rendez-vous est enregistré dans la base de données, mais n'apparaît **pas** sur Google Calendar.

## 🎯 La cause

La variable `GOOGLE_CALENDAR_ID` est configurée avec le **nom** du calendrier (`"RDV Site"`) au lieu de l'**ID réel** du calendrier.

❌ **Incorrect** : `GOOGLE_CALENDAR_ID="RDV Site"`

✅ **Correct** : `GOOGLE_CALENDAR_ID="xxxxxx@group.calendar.google.com"` ou `"primary"`

## 🔍 Solution 1 : Utiliser le calendrier principal

La solution la plus simple est d'utiliser le calendrier principal :

### Sur Vercel

1. Allez dans **Settings** → **Environment Variables**
2. Cherchez `GOOGLE_CALENDAR_ID`
3. Changez la valeur en : `primary`
4. Sauvegardez
5. Redéployez l'application (ou faites un nouveau commit)

### En local (.env.local)

```env
GOOGLE_CALENDAR_ID="primary"
```

## 🔍 Solution 2 : Utiliser un calendrier spécifique

Si vous voulez utiliser un calendrier spécifique comme "RDV Site", vous devez récupérer son **ID réel**.

### Étape 1 : Récupérer l'ID du calendrier

Utilisez un des scripts fournis :

#### Option A : Avec Node.js

```bash
# Charger les variables d'environnement
export $(cat .env.local | xargs)

# Lancer le script
node get-calendar-id.js
```

#### Option B : Avec Python

```bash
# Installer les dépendances si nécessaire
pip install google-auth-oauthlib google-auth-httplib2 google-api-python-client

# Charger les variables d'environnement
export $(cat .env.local | xargs)

# Lancer le script
python3 get-calendar-id.py
```

### Étape 2 : Copier l'ID du calendrier

Le script affichera tous vos calendriers avec leurs IDs :

```
📅 Liste de vos calendriers:

1. 📆 RDV Site
   ID: c_abc123def456@group.calendar.google.com
   Description: Calendrier pour les RDV du site
   TimeZone: Europe/Brussels
   Access: owner
   ----------------------------------------

2. 📆 Votre calendrier principal
   ID: votre.email@gmail.com
   Description: Aucune
   TimeZone: Europe/Brussels
   Access: owner
   ⭐ CALENDRIER PRINCIPAL
   ----------------------------------------
```

Copiez l'ID du calendrier "RDV Site" (par exemple : `c_abc123def456@group.calendar.google.com`)

### Étape 3 : Mettre à jour la variable d'environnement

#### Sur Vercel

1. Allez dans **Settings** → **Environment Variables**
2. Cherchez `GOOGLE_CALENDAR_ID`
3. Changez la valeur avec l'ID copié : `c_abc123def456@group.calendar.google.com`
4. Sauvegardez
5. Redéployez l'application

#### En local (.env.local)

```env
GOOGLE_CALENDAR_ID="c_abc123def456@group.calendar.google.com"
```

## 🔍 Solution 3 : Récupérer l'ID manuellement

Si vous ne pouvez pas utiliser les scripts :

1. Allez sur [Google Calendar](https://calendar.google.com/)
2. Dans la liste de gauche, trouvez le calendrier "RDV Site"
3. Cliquez sur les trois points `⋮` à côté du nom
4. Sélectionnez **"Paramètres et partage"**
5. Descendez jusqu'à la section **"Intégrer l'agenda"**
6. Copiez l'**ID de l'agenda** (format : `xxxxxx@group.calendar.google.com`)

## ✅ Vérification

Après avoir mis à jour `GOOGLE_CALENDAR_ID` et redéployé :

1. Allez sur votre site
2. Créez un nouveau rendez-vous de test
3. Vérifiez Google Calendar
4. Le rendez-vous devrait maintenant apparaître ✨

## 📝 Récapitulatif des options

| Option | GOOGLE_CALENDAR_ID | Avantages | Inconvénients |
|--------|-------------------|-----------|---------------|
| **Calendrier principal** | `primary` | ✅ Simple<br>✅ Pas besoin de l'ID | ⚠️ RDV mélangés avec vos événements personnels |
| **Calendrier spécifique** | `xxx@group.calendar.google.com` | ✅ Séparation des RDV<br>✅ Plus organisé | ⚠️ Besoin de récupérer l'ID |

## 🔧 Dépannage

### Le script get-calendar-id.js ne fonctionne pas

**Erreur** : `Variables d'environnement manquantes`

**Solution** :
```bash
# Linux/Mac
export $(cat .env.local | xargs)
node get-calendar-id.js

# Windows (PowerShell)
Get-Content .env.local | ForEach-Object {
  $name, $value = $_.split('=')
  Set-Content env:$name $value
}
node get-calendar-id.js
```

### L'erreur 404 persiste

**Solution** :
1. Vérifiez que vous avez bien **redéployé** après avoir changé la variable
2. Vérifiez que le compte Google utilisé pour le refresh token a bien accès au calendrier
3. Essayez avec `"primary"` pour confirmer que l'authentification fonctionne

### Erreur 403 "Forbidden"

**Solution** :
- Le compte utilisé n'a pas accès au calendrier spécifié
- Vérifiez que le calendrier est bien accessible avec le compte `centre.audire@gmail.com`
- Ou utilisez `"primary"` à la place

## 🎯 À retenir

- ✅ **ID du calendrier** ≠ **Nom du calendrier**
- ✅ Pour le calendrier principal : `GOOGLE_CALENDAR_ID="primary"`
- ✅ Pour un calendrier spécifique : utilisez son ID (format email)
- ✅ **Toujours redéployer** après avoir changé les variables sur Vercel

---

**Besoin d'aide ?** Consultez [RENDEZ-VOUS-README.md](./RENDEZ-VOUS-README.md) pour la configuration complète.
