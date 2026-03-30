# Configuration du Cron Job pour les Rappels de Rendez-vous

Ce document explique comment configurer un cron job pour envoyer automatiquement un email de rappel à l'administrateur lorsque des rendez-vous sont en attente de confirmation depuis plus de 24 heures.

## Fonctionnement

Le système envoie un email de rappel tous les jours à 10h si des rendez-vous sont en statut "pending" (en attente) depuis plus de 24 heures.

## Configuration

### Étape 1 : Configurer les variables d'environnement

Ajoutez cette variable dans votre fichier `.env` :

```env
# Token de sécurité pour le cron job (générez un token aléatoire sécurisé)
CRON_SECRET_TOKEN=votre-token-secret-aleatoire-tres-securise

# URL de base de votre site (nécessaire pour l'email)
NEXT_PUBLIC_BASE_URL=https://audire.be
```

Pour générer un token sécurisé, vous pouvez utiliser :
```bash
# Dans un terminal Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Étape 2 : Configurer le cron job

Vous avez plusieurs options pour configurer le cron job :

#### Option A : Utiliser un service externe (Recommandé pour la production)

Utilisez un service comme [cron-job.org](https://cron-job.org) ou [EasyCron](https://www.easycron.com/) :

1. Créez un compte sur le service
2. Créez un nouveau cron job avec les paramètres suivants :
   - **URL** : `https://audire.be/api/admin/pending-reminders`
   - **Méthode** : GET
   - **Headers personnalisés** :
     - `Authorization: Bearer VOTRE_TOKEN_SECRET`
   - **Planification** : Tous les jours à 10:00 (heure de Bruxelles)
     - Cron expression : `0 10 * * *`

3. Testez le cron job pour vérifier qu'il fonctionne correctement

#### Option B : Utiliser Vercel Cron Jobs (Si hébergé sur Vercel)

1. Créez un fichier `vercel.json` à la racine du projet :

```json
{
  "crons": [
    {
      "path": "/api/admin/pending-reminders",
      "schedule": "0 10 * * *"
    }
  ]
}
```

2. Ajoutez le token dans les variables d'environnement Vercel
3. Déployez sur Vercel

**Note** : Les Vercel Cron Jobs nécessitent un plan Pro.

#### Option C : Utiliser un serveur avec crontab (Linux/Unix)

Si vous avez accès à un serveur Linux :

1. Éditez le crontab :
```bash
crontab -e
```

2. Ajoutez cette ligne :
```bash
0 10 * * * curl -X GET -H "Authorization: Bearer VOTRE_TOKEN_SECRET" https://audire.be/api/admin/pending-reminders
```

### Étape 3 : Tester le système

Pour tester manuellement l'endpoint :

```bash
curl -X GET \
  -H "Authorization: Bearer VOTRE_TOKEN_SECRET" \
  https://audire.be/api/admin/pending-reminders
```

Réponses possibles :
- Si des RDV en attente : `{ "message": "Reminder email sent successfully", "count": 3 }`
- Si aucun RDV en attente : `{ "message": "No pending appointments to remind", "count": 0 }`
- Si erreur d'authentification : `{ "error": "Unauthorized" }`

## Personnalisation

### Changer l'heure d'envoi

Pour envoyer les rappels à une autre heure, modifiez la cron expression :
- `0 9 * * *` = 9h00
- `0 14 * * *` = 14h00
- `30 10 * * *` = 10h30

### Changer le délai avant rappel

Pour modifier le délai de 24h, éditez le fichier `/src/app/api/admin/pending-reminders/route.ts` :

```typescript
// Pour 12 heures au lieu de 24
const oneDayAgo = new Date();
oneDayAgo.setHours(oneDayAgo.getHours() - 12);

// Pour 48 heures
const oneDayAgo = new Date();
oneDayAgo.setHours(oneDayAgo.getHours() - 48);
```

### Personnaliser l'email de rappel

Le template de l'email se trouve dans `/src/lib/email.ts` dans la méthode `sendPendingAppointmentsReminder()`.

## Dépannage

### L'email n'est pas envoyé

1. Vérifiez que les variables d'environnement email sont bien configurées :
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`
   - `EMAIL_TO`

2. Vérifiez les logs du serveur pour voir les erreurs éventuelles

3. Testez manuellement l'endpoint avec curl

### Le cron job ne s'exécute pas

1. Vérifiez que le token est correct dans les headers
2. Vérifiez que l'URL est accessible publiquement
3. Consultez les logs du service de cron job utilisé

## Sécurité

⚠️ **Important** :
- Ne partagez jamais votre `CRON_SECRET_TOKEN` publiquement
- Utilisez un token long et aléatoire
- Changez le token régulièrement
- Surveillez les logs pour détecter les tentatives d'accès non autorisées

## Support

En cas de problème, contactez l'équipe technique avec les informations suivantes :
- Logs de l'erreur
- Configuration du cron job utilisée
- Résultat du test manuel de l'endpoint
