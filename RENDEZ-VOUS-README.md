# Système de Prise de Rendez-vous Audire

Ce document explique comment configurer et utiliser le système de prise de rendez-vous en ligne pour Audire.

## 📋 Table des matières

1. [Fonctionnalités](#fonctionnalités)
2. [Configuration](#configuration)
3. [Utilisation Admin](#utilisation-admin)
4. [Utilisation Client](#utilisation-client)
5. [Intégrations](#intégrations)

## ✨ Fonctionnalités

### Côté Admin
- **Gestion des créneaux horaires** : Création manuelle ou en masse de créneaux disponibles
- **Visualisation des rendez-vous** : Liste des rendez-vous pris par les clients
- **Filtrage par centre** : Gestion multi-centres

### Côté Client
- **Formulaire multi-étapes** : Interface intuitive en 3 étapes
- **Types de rendez-vous** :
  - Premier contact / Prise d'informations générales
  - Premier RDV (avec prescription ORL)
  - Réglage
- **Upload de prescription** : Les clients peuvent uploader leur prescription ORL (format PDF, JPEG, PNG)
- **Rappels SMS** : Système de rappels automatiques (à configurer ultérieurement)

### Intégrations automatiques
- **Google Calendar** : Ajout automatique des RDV à l'agenda "RDV Site" avec rappels (1 semaine, 3 jours, 2 jours, la veille)
- **Email** : Envoi automatique de la prescription par email à centre.audire@gmail.com
- **Suppression automatique** : Les prescriptions sont supprimées 1 mois après la date du RDV

## ⚙️ Configuration

### 1. Base de données

Appliquer les migrations Prisma :

```bash
npx prisma db push
npx prisma generate
```

### 2. Google Calendar API

#### Étape 1 : Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google Calendar :
   - Dans le menu, allez à "APIs & Services" > "Library"
   - Recherchez "Google Calendar API"
   - Cliquez sur "Enable"

#### Étape 2 : Créer des credentials OAuth 2.0

1. Allez à "APIs & Services" > "Credentials"
2. Cliquez sur "Create Credentials" > "OAuth client ID"
3. Sélectionnez "Desktop app" comme type d'application
4. Donnez-lui un nom (ex: "Audire RDV")
5. Téléchargez le fichier JSON des credentials

#### Étape 3 : Obtenir le Refresh Token

Utilisez le script suivant pour obtenir votre refresh token :

```javascript
// get-refresh-token.js
const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = 'VOTRE_CLIENT_ID';
const CLIENT_SECRET = 'VOTRE_CLIENT_SECRET';
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});

console.log('Authorize this app by visiting this url:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the code from that page here: ', (code) => {
  rl.close();
  oauth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    console.log('Refresh Token:', token.refresh_token);
  });
});
```

Exécutez le script :

```bash
node get-refresh-token.js
```

#### Étape 4 : Créer l'agenda "RDV Site"

1. Ouvrez [Google Calendar](https://calendar.google.com/)
2. Dans la barre latérale gauche, cliquez sur le "+" à côté de "Autres agendas"
3. Sélectionnez "Créer un agenda"
4. Nommez-le "RDV Site"
5. Notez l'ID de l'agenda (dans les paramètres de l'agenda)

#### Étape 5 : Variables d'environnement

Ajoutez les variables suivantes dans votre fichier `.env` :

```env
GOOGLE_CALENDAR_CLIENT_ID="votre-client-id"
GOOGLE_CALENDAR_CLIENT_SECRET="votre-client-secret"
GOOGLE_CALENDAR_REFRESH_TOKEN="votre-refresh-token"
GOOGLE_CALENDAR_ID="RDV Site"
```

### 3. Configuration Email (Gmail)

#### Étape 1 : Activer l'authentification à 2 facteurs

1. Allez sur votre compte Google
2. Sécurité > Validation en deux étapes
3. Activez-la si ce n'est pas déjà fait

#### Étape 2 : Créer un mot de passe d'application

1. Allez sur [Mots de passe des applications](https://myaccount.google.com/apppasswords)
2. Sélectionnez "Autre (nom personnalisé)"
3. Nommez-le "Audire RDV"
4. Copiez le mot de passe généré (16 caractères)

#### Étape 3 : Variables d'environnement

Ajoutez les variables suivantes dans votre fichier `.env` :

```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="centre.audire@gmail.com"
EMAIL_PASSWORD="votre-mot-de-passe-application"
EMAIL_FROM="centre.audire@gmail.com"
EMAIL_TO="centre.audire@gmail.com"
```

### 4. Vercel Blob Storage (Upload de fichiers)

#### En production sur Vercel :

1. Allez sur votre projet Vercel
2. Settings > Storage > Create Database > Blob
3. Le token `BLOB_READ_WRITE_TOKEN` sera automatiquement créé

#### En local (développement) :

Les fichiers seront stockés dans `public/uploads/prescriptions/` (le token n'est pas nécessaire).

### 5. Cron Job (Suppression automatique)

Le cron job est configuré dans `vercel.json` pour s'exécuter tous les jours à 2h du matin.

Pour sécuriser le cron job, ajoutez dans votre `.env` :

```env
CRON_SECRET="votre-secret-aleatoire"
```

Générez un secret aléatoire :

```bash
openssl rand -base64 32
```

## 📖 Utilisation Admin

### Accéder à l'interface admin

1. Connectez-vous à l'admin : `/admin/login`
2. Cliquez sur "📅 Rendez-vous" dans le menu

### Créer des créneaux horaires

#### Méthode 1 : Créer un créneau unique

1. Cliquez sur "Ajouter un créneau"
2. Sélectionnez la date
3. Définissez l'heure de début et de fin
4. Cliquez sur "Enregistrer"

#### Méthode 2 : Créer plusieurs créneaux en masse

1. Cliquez sur "Ajouter plusieurs créneaux"
2. Définissez la période (date de début et de fin)
3. Sélectionnez les jours de la semaine
4. Ajoutez les créneaux horaires (ex: 9h-10h, 10h-11h, etc.)
5. Cliquez sur "Créer tous les créneaux"

**Exemple** : Pour créer des créneaux tous les lundis, mercredis et vendredis de 9h à 12h et de 14h à 17h pendant 2 mois :
- Date de début : 01/04/2026
- Date de fin : 31/05/2026
- Jours : Lun, Mer, Ven
- Créneaux : 09:00-10:00, 10:00-11:00, 11:00-12:00, 14:00-15:00, 15:00-16:00, 16:00-17:00

### Gérer les créneaux

- **Voir les créneaux** : Liste de tous les créneaux avec leur statut (Disponible/Réservé)
- **Supprimer un créneau** : Seuls les créneaux non réservés peuvent être supprimés

### Voir les rendez-vous

L'onglet "Rendez-vous" permet de voir tous les rendez-vous pris par les clients (fonctionnalité en cours de développement).

## 👤 Utilisation Client

### Prendre rendez-vous

1. Le client clique sur "Prendre RDV" dans le header du site
2. Il accède au formulaire en 3 étapes :

#### Étape 1 : Choix du créneau
- Sélection du centre Audire
- Visualisation des créneaux disponibles groupés par date
- Sélection d'un créneau

#### Étape 2 : Informations personnelles
- Prénom, Nom (obligatoires)
- Adresse complète (obligatoire)
- N° de GSM (obligatoire pour les rappels SMS)
- Email (optionnel)
- Type de rendez-vous (obligatoire)
- Message optionnel

#### Étape 3 : Confirmation et prescription
- Récapitulatif du rendez-vous
- Upload optionnel de la prescription ORL (PDF, JPEG, PNG, max 10 MB)
- Confirmation finale

### Après la prise de rendez-vous

1. **Confirmation immédiate** : Le client voit une page de confirmation
2. **Ajout au calendrier** : Le RDV est automatiquement ajouté à Google Calendar
3. **Email** : Si une prescription a été uploadée, elle est envoyée par email à centre.audire@gmail.com
4. **Rappels** : Des rappels sont configurés dans Google Calendar (1 semaine, 3 jours, 2 jours, la veille)

## 🔗 Intégrations

### Google Calendar

**Format de l'événement** :
- **Titre** : M/Mme [Nom du patient] : [Type de RDV]
- **Description** : Rendez-vous pris par le site
- **Rappels** :
  - 1 semaine avant (si possible)
  - 3 jours avant
  - 2 jours avant
  - La veille

### Email de prescription

**Format** :
- **Sujet** : Nouvelle prescription - [Nom du patient]
- **Contenu** : Informations du RDV + lien de téléchargement de la prescription
- **Sécurité** : La prescription sera supprimée 1 mois après la date du RDV

### Suppression automatique

Un cron job s'exécute tous les jours à 2h du matin pour :
1. Identifier les prescriptions expirées (1 mois après la date du RDV)
2. Supprimer les fichiers uploadés
3. Supprimer les enregistrements de la base de données

## 🚀 Prochaines étapes

- [ ] Système de rappels SMS (intégration d'un gateway SMS)
- [ ] Notification email au client après la prise de RDV
- [ ] Interface admin pour voir et gérer les rendez-vous
- [ ] Statistiques et rapports
- [ ] Annulation de RDV en ligne
- [ ] Reprogrammation de RDV

## 🐛 Dépannage

### Les événements ne s'ajoutent pas au calendrier

1. Vérifiez que les credentials Google Calendar sont corrects
2. Vérifiez que l'API Google Calendar est activée
3. Vérifiez les logs dans la console Vercel

### Les emails ne sont pas envoyés

1. Vérifiez le mot de passe d'application Gmail
2. Vérifiez que l'authentification à 2 facteurs est activée
3. Vérifiez les paramètres SMTP

### Les prescriptions ne sont pas supprimées

1. Vérifiez que le cron job est configuré dans Vercel
2. Vérifiez le `CRON_SECRET` dans les variables d'environnement
3. Vérifiez les logs du cron job dans Vercel

## 📞 Support

Pour toute question ou problème, contactez l'équipe de développement.
