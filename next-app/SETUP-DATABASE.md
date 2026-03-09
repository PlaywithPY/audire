# 🗄️ Configuration de la base de données PostgreSQL

Le site Audire utilise **PostgreSQL** pour stocker les paramètres (couleurs, horaires, etc.).

---

## 📦 Options pour PostgreSQL

### **Option 1 : Vercel Postgres** ⭐ RECOMMANDÉ pour Vercel
**Gratuit jusqu'à 256 MB**

1. Va sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionne ton projet **audire**
3. Onglet **Storage** → **Create Database**
4. Choisis **Postgres**
5. Copie la variable `DATABASE_URL` (commence par `postgres://`)
6. **Ajoute-la dans les variables d'environnement de ton projet Vercel**
   - Settings → Environment Variables
   - Nom: `DATABASE_URL`
   - Valeur: (colle l'URL)
   - Environnements: Production, Preview, Development

**C'est tout ! Vercel s'occupe du reste.**

---

### **Option 2 : Neon** 🚀 Serverless PostgreSQL
**Gratuit jusqu'à 512 MB**

1. Va sur [Neon.tech](https://neon.tech)
2. Crée un compte (gratuit)
3. Crée un nouveau projet : **audire**
4. Copie la connection string (commence par `postgresql://`)
5. Configure sur Vercel :
   - Settings → Environment Variables
   - `DATABASE_URL` = (colle l'URL Neon)

---

### **Option 3 : Supabase** 🔥 PostgreSQL + Features
**Gratuit jusqu'à 500 MB**

1. Va sur [Supabase.com](https://supabase.com)
2. Crée un nouveau projet : **audire**
3. Va dans **Settings** → **Database**
4. Copie la **Connection String** (mode "Session")
5. Configure sur Vercel (même process)

---

### **Option 4 : Prisma Data Platform** 💎
**Tu as déjà créé un compte !**

1. Va sur [Prisma Data Platform](https://cloud.prisma.io)
2. Connecte ton projet GitHub
3. Active **Accelerate** (gratuit)
4. Copie l'URL Accelerate (commence par `prisma://`)
5. Configure sur Vercel

**Bonus** : Prisma Accelerate ajoute un cache automatique ultra-rapide ! ⚡

---

## 🛠️ Configuration en local (développement)

### 1. Crée un fichier `.env` :
```bash
cd next-app
cp .env.example .env
```

### 2. Édite `.env` et mets ton URL PostgreSQL :
```
DATABASE_URL="postgresql://..."
```

### 3. Crée les tables dans la DB :
```bash
npx prisma migrate dev --name init
```

### 4. Peuple la DB avec les données par défaut :
```bash
npx tsx prisma/seed.ts
```

### 5. Lance le site :
```bash
npm run dev
```

---

## 🎯 Vérifier que ça marche

1. **Dashboard admin** : http://localhost:3000/admin
2. Change une couleur et sauvegarde
3. Vérifie que c'est enregistré (recharge la page)

✅ Si ça marche → tout est bon !

---

## 📊 Voir les données (optionnel)

```bash
npx prisma studio
```

Ouvre une interface graphique pour voir/modifier la DB : http://localhost:5555

---

## ❓ Aide

**Erreur "Can't reach database" ?**
- Vérifie que ton URL est correcte dans `.env`
- Vérifie que la DB existe sur ton provider

**Erreur de migration ?**
- Supprime `prisma/migrations`
- Relance `npx prisma migrate dev --name init`

**Le dashboard admin ne sauvegarde pas ?**
- Ouvre la console du navigateur (F12)
- Vérifie les erreurs dans l'onglet Network

---

**Besoin d'aide ? Dis-le moi !** 😊
