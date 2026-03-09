# 🔍 Vérifier la DB sur Vercel

## Étape 1 : Vérifier que la DB est connectée

1. Dashboard Vercel → ton projet **audire**
2. **Settings** → **Environment Variables**
3. Vérifie qu'il y a bien : `DATABASE_URL` avec une valeur qui commence par `postgres://`

Si elle n'y est pas → retourne dans **Storage** et connecte la DB au projet.

## Étape 2 : Voir les logs d'erreur

1. **Deployments** → Clique sur le dernier deployment
2. **View Function Logs**
3. Cherche les erreurs contenant "Prisma" ou "Database"

**Erreur courante** :
```
Error: P1001: Can't reach database server
```
→ La DB n'est pas connectée

**Ou** :
```
Error: P3009: migrate.lock file should not be committed
```
→ Normal, on a supprimé les migrations SQLite

## Étape 3 : Forcer un nouveau build

Si la DB est bien connectée mais ça marche toujours pas :

1. **Deployments** → **Redeploy**
2. **⚠️ IMPORTANT : Décoche "Use existing Build Cache"**
3. Redeploy

Ça va regénérer Prisma avec PostgreSQL.
