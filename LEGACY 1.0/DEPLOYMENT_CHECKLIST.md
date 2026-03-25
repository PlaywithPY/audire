# 🚀 Checklist de déploiement final - Audire

## ✅ Étapes à compléter

### 1. Configuration Vercel (URGENT)

#### Variables d'environnement
Sur https://vercel.com → Votre projet → Settings → Environment Variables

Ajouter ces 4 variables :

| Variable | Valeur | Comment |
|----------|--------|---------|
| `NEXTAUTH_URL` | `https://votre-domaine.vercel.app` | URL de production |
| `NEXTAUTH_SECRET` | [générer] | `openssl rand -base64 32` |
| `ADMIN_USERNAME` | `admin` | Votre choix |
| `ADMIN_PASSWORD` | [choisir] | Mot de passe fort |

**Puis** : Redéployer l'application

---

### 2. Configuration de la base de données

Une fois le build réussi, exécuter les migrations :

```bash
# Option A : Via Vercel CLI (recommandé)
vercel login
vercel link
vercel env pull .env.local
cd next-app
npm run db:setup

# Option B : Via Neon Dashboard
# Voir DATABASE_SETUP.md pour les instructions SQL
```

---

### 3. Premier accès admin

1. Aller sur : `https://votre-site.vercel.app/admin/login`
2. Se connecter avec vos identifiants
3. Vérifier que tout fonctionne

---

### 4. Import du contenu initial

Dans l'admin :
1. Aller à l'onglet **"Contenu éditorial"**
2. Cliquer sur **"📥 Importer le contenu maintenant"**
3. Les cards et blocs seront créés dans la DB

---

### 5. Personnalisation du contenu

#### A. Modifier les cards de la page d'accueil
1. Dans l'admin → Onglet "Contenu éditorial"
2. Sélectionner la page "🏠 Accueil"
3. Modifier les blocs :
   - `hero-title` : Titre principal
   - `hero-subtitle` : Sous-titre
   - `hero-cta-primary` : Bouton principal
   - etc.

#### B. Modifier les informations des centres
1. Onglet "Paramètres & Infos"
2. Sélectionner le centre dans la liste déroulante
3. Modifier : téléphone, email, adresse, horaires

#### C. Modifier les couleurs
1. Onglet "Paramètres & Infos"
2. Section "Couleurs du thème"
3. Modifier primary, secondary, etc.

#### D. Gérer les témoignages
1. Onglet "Témoignages"
2. Ajouter/modifier/supprimer des avis

---

### 6. Vérifications finales

- [ ] Le logo est visible et à la bonne taille
- [ ] Le footer affiche les bonnes infos du centre
- [ ] Les horaires sont corrects
- [ ] Le formulaire de contact fonctionne
- [ ] La page admin est accessible uniquement après login
- [ ] Les témoignages s'affichent correctement
- [ ] Toutes les pages sont accessibles
- [ ] Les images se chargent correctement
- [ ] Les boutons CTA fonctionnent

---

### 7. SEO et performance (optionnel)

- [ ] Vérifier les meta descriptions
- [ ] Ajouter un sitemap.xml
- [ ] Configurer Google Analytics (si souhaité)
- [ ] Tester la vitesse sur PageSpeed Insights
- [ ] Vérifier l'accessibilité

---

## 📚 Documentation disponible

- `VERCEL_SETUP.md` : Configuration des variables d'environnement
- `DATABASE_SETUP.md` : Configuration de la base de données
- `ADMIN_SECURITY.md` : Sécurité et authentification
- `README.md` : Documentation générale (à créer si nécessaire)

---

## 🆘 Besoin d'aide ?

Si vous rencontrez des problèmes :

1. **Build échoue** → Vérifier les logs Vercel
2. **Impossible de se connecter** → Vérifier les variables d'environnement
3. **DB vide** → Exécuter `npm run db:setup`
4. **Contenu ne s'affiche pas** → Importer le contenu via l'admin

---

## ✨ Projet terminé !

Une fois toutes ces étapes complétées :
- ✅ Site déployé et fonctionnel
- ✅ Admin sécurisé et opérationnel
- ✅ Contenu éditable facilement
- ✅ Multi-centres géré
- ✅ Footer et infos dynamiques

**Félicitations ! 🎉**
