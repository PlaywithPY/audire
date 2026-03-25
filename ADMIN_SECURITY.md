# Sécurité de l'Administration

## Vue d'ensemble

Toutes les routes API admin (`/api/admin/*`) sont désormais protégées par authentification NextAuth. Seuls les utilisateurs authentifiés peuvent accéder à ces endpoints.

## Configuration

### Variables d'environnement

Les variables suivantes doivent être configurées dans votre fichier `.env` :

```env
# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"  # URL de votre application
NEXTAUTH_SECRET="votre-secret-jwt"    # Secret pour signer les tokens

# Admin Credentials
ADMIN_USERNAME="admin"                 # Nom d'utilisateur admin
ADMIN_PASSWORD="votre-mot-de-passe"   # Mot de passe admin
```

### Génération du secret NextAuth

Pour générer un secret sécurisé, utilisez :

```bash
openssl rand -base64 32
```

## Utilisation

### Connexion à l'interface admin

1. Accédez à `/admin/login`
2. Entrez vos identifiants (définis dans `.env`)
3. Une session sera créée et valide pendant 24 heures

### Routes protégées

Toutes les routes suivantes nécessitent une authentification :

- `GET/POST/PUT/DELETE /api/admin/blocks` - Gestion des blocs de contenu
- `GET/PUT /api/admin/settings` - Paramètres du site
- `GET/POST/PUT/DELETE /api/admin/centres` - Gestion des centres
- `GET/PUT /api/admin/centre` - Centre par défaut
- `GET/PUT /api/admin/hours` - Horaires d'ouverture
- `GET/PUT /api/admin/colors` - Couleurs du thème
- `GET/POST/PUT/DELETE /api/admin/testimonials` - Témoignages
- `GET/POST/PUT/DELETE /api/admin/card-images` - Images des cards
- `POST /api/admin/import-content` - Import de contenu

### Réponses d'erreur

Si vous tentez d'accéder à une route admin sans être authentifié, vous recevrez :

```json
{
  "error": "Unauthorized - Authentication required"
}
```

Status HTTP : `401 Unauthorized`

## Déploiement en production

### ⚠️ IMPORTANT - Sécurité

Avant de déployer en production :

1. **Changez le mot de passe admin** dans les variables d'environnement
2. **Générez un nouveau secret NextAuth** sécurisé
3. **Mettez à jour NEXTAUTH_URL** avec votre domaine de production
4. **Ne commitez JAMAIS** le fichier `.env` dans git

### Configuration Vercel/Netlify

Dans les paramètres de votre projet, ajoutez ces variables d'environnement :

- `NEXTAUTH_URL` : https://votre-domaine.com
- `NEXTAUTH_SECRET` : [secret généré]
- `ADMIN_USERNAME` : [votre username]
- `ADMIN_PASSWORD` : [mot de passe fort]

## Architecture technique

### Fichiers créés

- `src/lib/auth.ts` - Configuration NextAuth
- `src/lib/auth-helpers.ts` - Helper `requireAuth()` pour protéger les routes
- `src/app/api/auth/[...nextauth]/route.ts` - Route NextAuth

### Fonctionnement

1. L'utilisateur se connecte via NextAuth avec username/password
2. Un token JWT est généré et stocké dans un cookie httpOnly
3. Chaque requête vers `/api/admin/*` vérifie la présence d'une session valide
4. Si la session est invalide ou absente, une erreur 401 est retournée

### Sessions

- **Durée** : 24 heures
- **Stratégie** : JWT (stateless)
- **Storage** : Cookie httpOnly sécurisé

## Améliorations futures possibles

- Ajouter un système de rôles (admin, éditeur, etc.)
- Implémenter une authentification à deux facteurs (2FA)
- Ajouter un journal d'audit des actions admin
- Créer une interface de gestion des utilisateurs admin
- Limiter le nombre de tentatives de connexion
