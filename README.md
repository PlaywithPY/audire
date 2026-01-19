# Site Web Audire - Centre Auditif

Site web complet pour Audire, centre auditif indépendant à Jemeppe-sur-Meuse (Province de Liège).

## Table des matières

- [Structure du site](#structure-du-site)
- [Comment modifier le contenu](#comment-modifier-le-contenu)
- [Pages du site](#pages-du-site)
- [Configuration centralisée](#configuration-centralisée)
- [Design system](#design-system)
- [Composants réutilisables](#composants-réutilisables)
- [SEO et référencement](#seo-et-référencement)
- [Formulaires et interactions](#formulaires-et-interactions)
- [Déploiement](#déploiement)
- [Support et maintenance](#support-et-maintenance)

---

## Structure du site

```
audire/
├── index.html                          # Page d'accueil
├── 404.html                            # Page d'erreur 404
├── robots.txt                          # Fichier pour les moteurs de recherche
├── sitemap.xml                         # Sitemap XML pour le SEO
├── README.md                           # Ce fichier
│
├── css/
│   └── styles.css                      # Design system complet
│
├── js/
│   ├── config.js                       # Configuration centralisée (MODIFIEZ ICI)
│   ├── components.js                   # Chargeur de composants
│   └── main.js                         # Scripts principaux
│
├── components/
│   ├── header.html                     # En-tête du site
│   ├── footer.html                     # Pied de page
│   └── modal.html                      # Modal de rendez-vous
│
├── test-auditif-gratuit/
│   └── index.html                      # Page Test auditif gratuit
│
├── notre-accompagnement/
│   └── index.html                      # Page Notre accompagnement
│
├── solutions-auditives/
│   └── index.html                      # Page Solutions auditives
│
├── remboursements/
│   └── index.html                      # Page Remboursements
│
├── faq/
│   └── index.html                      # Page FAQ
│
├── contact/
│   └── index.html                      # Page Contact
│
├── partenaires-pharmaciens/
│   └── index.html                      # Page B2B Partenariats
│
├── mentions-legales/
│   └── index.html                      # Mentions légales
│
├── confidentialite/
│   └── index.html                      # Politique de confidentialité
│
└── sitemap/
    └── index.html                      # Plan du site HTML
```

---

## Comment modifier le contenu

### 1. Modifier les informations de contact (téléphone, email, adresse...)

**IMPORTANT : Pour modifier toutes les informations de contact sur TOUT le site, éditez UN SEUL fichier :**

📁 **Fichier à modifier : `/js/config.js`**

```javascript
window.AUDIRE_CONFIG = {
  contact: {
    phone: {
      display: "04 233 61 25",        // ← Changez ici
      href: "+3242336125"              // ← Et ici
    },
    email: "centre.audire@gmail.com",  // ← Changez ici
    address: {
      street: "30, rue Grand-Vinâve",  // ← Changez ici
      postalCode: "4101",
      city: "Jemeppe-sur-Meuse",
      region: "Province de Liège",
      country: "Belgique"
    }
  },
  hours: {
    monday: "13h00 – 18h00",           // ← Changez ici
    tuesdayToSaturday: "09h30 – 18h00",
    sunday: "Fermé",
    note: "Sur rendez-vous uniquement"
  },
  // ... etc
};
```

**Les modifications seront automatiquement appliquées sur toutes les pages** : header, footer, pages de contact, etc.

### 2. Modifier le contenu d'une page

Ouvrez le fichier HTML de la page concernée et éditez le texte directement.

**Exemple : Modifier le titre de la page d'accueil**

📁 Fichier : `/index.html`

Cherchez :
```html
<h1>Mieux entendre, simplement.</h1>
```

Remplacez par :
```html
<h1>Votre nouveau titre</h1>
```

### 3. Modifier le header (menu de navigation)

📁 Fichier : `/components/header.html`

Vous pouvez modifier :
- Les liens du menu
- Les textes des liens
- Les boutons d'action

### 4. Modifier le footer (pied de page)

📁 Fichier : `/components/footer.html`

Vous pouvez modifier :
- Les liens
- Les colonnes
- Les informations de contact

### 5. Modifier les couleurs et le design

📁 Fichier : `/css/styles.css`

En haut du fichier, modifiez les variables CSS :

```css
:root {
  /* Couleurs principales */
  --primary: #2d7a5f;           /* Vert principal */
  --primary-light: #3a9270;
  --primary-dark: #1f5742;
  --accent: #ffa552;            /* Orange accent */
  
  /* Modifier ici pour changer les couleurs du site */
}
```

---

## Pages du site

### Pages publiques

1. **Accueil** (`/index.html`)
   - Présentation du centre
   - Services principaux
   - Call-to-action

2. **Test auditif gratuit** (`/test-auditif-gratuit/`)
   - Déroulement du test
   - Signes de perte auditive
   - FAQ test auditif

3. **Notre accompagnement** (`/notre-accompagnement/`)
   - Parcours patient en 4 étapes
   - Philosophie du centre
   - Importance du suivi

4. **Solutions auditives** (`/solutions-auditives/`)
   - Marques Oticon & Bernafon
   - Types d'appareils
   - Fonctionnalités modernes
   - Prix et remboursements

5. **Remboursements** (`/remboursements/`)
   - Détails INAMI
   - Intervention mutuelles
   - Exemple de calcul
   - Démarches

6. **FAQ** (`/faq/`)
   - Questions/réponses par thème
   - Test auditif
   - Appareils
   - Remboursements
   - Centre

7. **Contact** (`/contact/`)
   - Coordonnées complètes
   - Formulaire de contact
   - Plan d'accès
   - Horaires

### Pages B2B

8. **Partenaires pharmaciens** (`/partenaires-pharmaciens/`)
   - Offre de partenariat
   - Conditions
   - Avantages pour l'officine

### Pages légales

9. **Mentions légales** (`/mentions-legales/`)
10. **Politique de confidentialité** (`/confidentialite/`)
11. **Plan du site** (`/sitemap/`)

### Pages utilitaires

12. **Page 404** (`/404.html`)
    - Page d'erreur personnalisée

---

## Configuration centralisée

### Fichier : `/js/config.js`

Ce fichier contient TOUTES les informations modifiables du site :

- **Contact** : téléphone, email, adresse
- **Horaires** : jours et heures d'ouverture
- **Business** : nom, slogan, description, prix, marques
- **SEO** : couleur du thème, langue

**Avantage** : Modifier une information UNE SEULE FOIS pour qu'elle soit mise à jour PARTOUT sur le site.

---

## Design system

### Classes CSS disponibles

Le fichier `/css/styles.css` contient un design system complet avec des classes réutilisables :

#### Layout
- `.container` : Conteneur centré avec largeur maximale
- `.section` : Section avec padding vertical
- `.grid-2`, `.grid-3`, `.grid-4` : Grilles responsives

#### Boutons
- `.btn` : Bouton de base
- `.btn-primary` : Bouton principal (vert)
- `.btn-secondary` : Bouton secondaire (blanc)
- `.btn-outline` : Bouton contour
- `.btn-lg`, `.btn-sm` : Tailles de boutons

#### Cards
- `.card` : Carte avec ombre et bordure
- `.info-card` : Carte d'information
- `.feature-box` : Boîte de fonctionnalité

#### Typography
- `.section-title` : Titre de section
- `.section-subtitle` : Sous-titre de section
- `.lead` : Texte d'introduction
- `.text-muted` : Texte atténué

#### Animations
- `.animate-on-scroll` : Animation au défilement
- Ajoutez cette classe à un élément pour qu'il s'anime quand il entre dans le viewport

#### Helpers
- `.text-center` : Centrer le texte
- `.mb-1` à `.mb-5` : Marges bottom
- `.mt-1` à `.mt-5` : Marges top

---

## Composants réutilisables

### Header (`/components/header.html`)

Le header contient :
- Logo et nom du centre
- Menu de navigation
- Boutons d'action (téléphone, rendez-vous)
- Menu mobile

### Footer (`/components/footer.html`)

Le footer contient :
- 4 colonnes d'informations
- Liens vers toutes les pages
- Informations de contact
- Horaires
- Copyright

### Modal (`/components/modal.html`)

Modal de prise de rendez-vous avec :
- Formulaire complet
- Validation
- Message de confirmation
- Sticky CTA mobile

### Comment ils fonctionnent ?

Les composants sont chargés automatiquement via `/js/components.js` sur toutes les pages.

Dans chaque page HTML :
```html
<!-- Header -->
<div id="app-header"></div>

<!-- Votre contenu -->
<main>...</main>

<!-- Footer -->
<div id="app-footer"></div>

<!-- Modal -->
<div id="app-modal"></div>

<!-- Scripts -->
<script src="/js/config.js"></script>
<script src="/js/components.js"></script>
<script src="/js/main.js"></script>
```

---

## SEO et référencement

### Meta tags

Chaque page contient :
- `<title>` unique et descriptif
- `<meta name="description">` de 150-160 caractères
- `<meta name="keywords">` avec mots-clés pertinents
- `<link rel="canonical">` pour éviter le duplicate content
- Open Graph pour les réseaux sociaux

### Schema.org (JSON-LD)

Les pages importantes contiennent des données structurées :
- Page d'accueil : `LocalBusiness`
- Test auditif : `MedicalTest`
- FAQ : `FAQPage`

### Fichiers SEO

1. **`/robots.txt`** : Instructions pour les robots des moteurs de recherche
2. **`/sitemap.xml`** : Liste de toutes les pages pour Google
3. **`/sitemap/index.html`** : Plan du site HTML pour les utilisateurs

### Optimisation

- Images : Utilisez des formats modernes (WebP) et compressez-les
- Performance : Le site est optimisé pour le chargement rapide
- Mobile-first : Design responsive sur tous les écrans
- Accessibilité : Attributs ARIA, navigation au clavier

---

## Formulaires et interactions

### Formulaire de rendez-vous

📁 Fichier : `/components/modal.html` + `/js/main.js`

**Mode actuel : DEMO**

Le formulaire affiche un message de confirmation mais n'envoie rien.

**Pour le rendre fonctionnel :**

Option 1 : Email simple (FormSubmit, Formspree...)
```html
<form action="https://formsubmit.co/votre-email@gmail.com" method="POST">
  <!-- Champs du formulaire -->
</form>
```

Option 2 : Backend personnalisé
Modifiez `/js/main.js` ligne 166 pour envoyer à votre API.

Option 3 : Service tiers (Calendly, Acuity Scheduling...)
Intégrez un widget de prise de rendez-vous.

### Formulaire de contact

📁 Fichier : `/contact/index.html`

Même principe que le formulaire de rendez-vous.

---

## Déploiement

### 1. Hébergement recommandé

Le site est statique (HTML/CSS/JS), vous pouvez l'héberger sur :

- **Netlify** (gratuit, facile, recommandé)
- **Vercel** (gratuit, performant)
- **GitHub Pages** (gratuit)
- **OVH** (payant, hébergement belge)
- **Infomaniak** (payant, hébergement suisse écologique)

### 2. Déployer sur Netlify (gratuit)

1. Créez un compte sur [netlify.com](https://netlify.com)
2. Glissez-déposez le dossier `audire/` dans Netlify
3. Votre site est en ligne en 30 secondes !
4. Configurez un nom de domaine personnalisé (audire.be)

### 3. Configuration DNS

Pour utiliser votre nom de domaine (audire.be) :

1. Chez votre registrar (OVH, Gandi...), ajoutez ces enregistrements DNS :
   ```
   Type: A
   Name: @
   Value: [IP de votre hébergeur]

   Type: CNAME
   Name: www
   Value: [domaine de votre hébergeur]
   ```

2. Activez HTTPS (gratuit avec Let's Encrypt sur Netlify/Vercel)

### 4. Mise à jour du site

Après modification :
1. Uploadez les fichiers modifiés sur votre hébergeur
2. Ou utilisez Git pour déployer automatiquement

---

## Support et maintenance

### Modifications courantes

#### Changer le numéro de téléphone
📁 `/js/config.js` → Modifiez `phone.display` et `phone.href`

#### Changer l'email
📁 `/js/config.js` → Modifiez `email`

#### Changer les horaires
📁 `/js/config.js` → Modifiez `hours`

#### Ajouter une page
1. Créez un dossier `/ma-nouvelle-page/`
2. Créez `/ma-nouvelle-page/index.html`
3. Copiez la structure d'une page existante
4. Ajoutez le lien dans le header (`/components/header.html`)
5. Ajoutez l'URL dans `/sitemap.xml`

#### Modifier les prix
📁 `/js/config.js` → Modifiez `pricing`

#### Modifier les mentions légales
📁 `/mentions-legales/index.html`
⚠️ Complétez les informations manquantes (numéro d'entreprise, hébergeur...)

### Outils utiles

- **Validation HTML** : [validator.w3.org](https://validator.w3.org/)
- **Test responsive** : [responsivedesignchecker.com](https://responsivedesignchecker.com/)
- **Test vitesse** : [pagespeed.web.dev](https://pagespeed.web.dev/)
- **Test SEO** : [search.google.com/test/mobile-friendly](https://search.google.com/test/mobile-friendly)

### Checklist avant la mise en ligne

- [ ] Remplacez toutes les informations de contact dans `/js/config.js`
- [ ] Complétez les mentions légales (numéro d'entreprise, hébergeur)
- [ ] Testez tous les formulaires
- [ ] Vérifiez tous les liens internes
- [ ] Optimisez les images
- [ ] Testez sur mobile et desktop
- [ ] Configurez les formulaires pour envoyer des emails
- [ ] Ajoutez Google Analytics (optionnel)
- [ ] Configurez le domaine audire.be
- [ ] Activez HTTPS
- [ ] Soumettez le sitemap.xml à Google Search Console

---

## Contact et assistance

Si vous avez besoin d'aide pour modifier le site :

- **Documentation** : Relisez ce README
- **Questions** : Contactez votre développeur
- **Bugs** : Vérifiez la console JavaScript (F12 dans le navigateur)

---

## Crédits

- **Design** : Système de design moderne et accessible
- **Fonts** : Inter (sans-serif), Playfair Display (serif)
- **Icons** : Emojis natifs
- **Framework** : Vanilla HTML/CSS/JS (pas de framework lourd)
- **SEO** : Optimisé pour Google et les moteurs de recherche

---

**Version** : 1.0  
**Date** : Janvier 2026  
**Licence** : Propriétaire - Audire Centre Auditif

---

Bon travail avec votre nouveau site ! 🎉
