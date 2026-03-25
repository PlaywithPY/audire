# 📝 Guide d'édition des contenus du site Audire

Ce guide vous explique comment **modifier facilement** tous les textes et contenus de votre site.

## 🎯 Deux méthodes simples

### Méthode 1 : Modifier le fichier JSON (RECOMMANDÉ ✅)

**Le plus simple !** Un seul fichier contient tous les textes principaux.

**Fichier :** `/content/textes.json`

```json
{
  "hero": {
    "title": "Mieux entendre, simplement.",
    "subtitle": "Chez Audire, on commence par..."
  }
}
```

**Comment faire :**
1. Ouvrez `/content/textes.json` dans un éditeur de texte
2. Modifiez les textes entre guillemets
3. Sauvegardez le fichier
4. Les changements seront visibles sur le site

⚠️ **Attention :** Respectez bien la syntaxe JSON (guillemets, virgules, accolades)

---

### Méthode 2 : Modifier les fichiers HTML directement

Pour des modifications plus avancées, éditez les fichiers HTML.

## 📄 Où modifier quoi ?

### 🏠 Page d'accueil (`/index.html`)

#### Hero (haut de page)
- **Ligne 81** : Badge "Centre auditif indépendant..."
- **Ligne 84** : Titre principal "Mieux entendre, simplement."
- **Lignes 86-88** : Sous-titre (paragraphe de présentation)
- **Lignes 91-94** : Les 4 chips (avantages)
- **Ligne 112** : Note "Vous hésitez ?..."

#### Section "Pourquoi Audire"
- **Ligne 150** : Tag "Notre approche"
- **Ligne 151** : Titre "Pourquoi choisir Audire ?"
- **Lignes 152-154** : Sous-titre
- **Lignes 159-210** : Les 6 feature boxes (icône + titre + description)

#### Section "Comment ça se passe"
- **Ligne 219** : Tag "Le processus"
- **Ligne 220** : Titre
- **Lignes 228-269** : Les 4 étapes du processus

#### Section Solutions
- **Ligne 285** : Tag "Solutions"
- **Ligne 286** : Titre "Nos solutions auditives"
- **Lignes 294-321** : Cards Oticon et Bernafon

#### Section Remboursements
- **Ligne 340** : Tag
- **Ligne 341** : Titre "Combien ça coûte vraiment ?"
- **Lignes 342-346** : Description des prix

---

### 🧪 Page Test auditif (`/test-auditif-gratuit/index.html`)

#### Hero
- **Ligne ~75** : Titre principal
- **Lignes ~78-80** : Description

#### Les 4 étapes du test
- **Lignes ~134-169** : Entretien initial, Audiométrie, Explications, Conseils

---

### 🤝 Page Notre accompagnement (`/notre-accompagnement/index.html`)

#### Les étapes d'accompagnement
- Cherchez les sections avec class="step"
- Modifiez les titres `<h3>` et descriptions `<p>`

---

### 🎧 Page Solutions auditives (`/solutions-auditives/index.html`)

#### Présentation Oticon/Bernafon
- Cherchez les cards avec les noms de marque
- Modifiez les descriptions et listes de caractéristiques

---

### 💰 Page Remboursements (`/remboursements/index.html`)

#### Informations INAMI
- Modifiez les montants et conditions
- Mettez à jour les exemples de calcul

---

### ❓ Page FAQ (`/faq/index.html`)

#### Questions-Réponses
Cherchez les balises `<details>` :

```html
<details>
  <summary>Question ici</summary>
  <p>Réponse ici</p>
</details>
```

**Pour ajouter une question :**
1. Copiez un bloc `<details>...</details>` existant
2. Collez-le où vous voulez
3. Modifiez la question et la réponse

---

### 📍 Page Contact (`/contact/index.html`)

Les informations de contact sont gérées via `/js/config.js` (voir section suivante)

---

## ⚙️ Informations de contact (partout sur le site)

**Fichier :** `/js/config.js`

```javascript
window.AUDIRE_CONFIG = {
  contact: {
    phone: {
      display: "04 233 61 25",        // ← Modifier ici
      href: "+3242336125"              // ← Et ici (format international)
    },
    email: "centre.audire@gmail.com",  // ← Modifier ici
    address: {
      street: "30, rue Grand-Vinâve",  // ← Modifier ici
      postalCode: "4101",
      city: "Jemeppe-sur-Meuse",
      region: "Province de Liège"
    }
  },

  hours: {
    monday: "13h00 – 18h00",           // ← Modifier ici
    tuesdayToSaturday: "09h30 – 18h00"
  }
}
```

**Ces informations s'appliquent automatiquement partout :** header, footer, page contact, etc.

---

## 🎨 Modifier les couleurs

**Fichier :** `/css/styles.css` (lignes 3-9)

```css
:root {
  --primary: #FF8C42;        /* ← Orange principal */
  --primary-light: #FFA059;  /* ← Orange clair */
  --primary-dark: #E67A2E;   /* ← Orange foncé */
}
```

---

## 📸 Changer le logo

1. Remplacez le fichier `/images/logo.png` par votre nouveau logo
2. Le logo doit être carré (ex: 500x500px) en PNG avec fond transparent
3. Le changement sera automatique sur tout le site

---

## ✅ Checklist après modification

- [ ] Vérifiez que les textes s'affichent correctement
- [ ] Testez sur mobile et desktop
- [ ] Relisez pour les fautes d'orthographe
- [ ] Vérifiez les liens (s'il y en a)
- [ ] Commit et push sur GitHub

---

## 🆘 Besoin d'aide ?

### Problèmes courants

**Le site ne se met pas à jour ?**
- Videz le cache : Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
- Attendez quelques minutes (GitHub Pages peut prendre 2-5 min)

**Erreur JSON ?**
- Vérifiez les guillemets `"`
- Vérifiez les virgules `,`
- Utilisez un validateur JSON en ligne : https://jsonlint.com/

**Texte coupé ou bizarre ?**
- Vérifiez que vous n'avez pas supprimé de balises HTML
- Les balises vont par paires : `<p>...</p>`, `<h2>...</h2>`

---

## 🎓 Astuces

### Modifier plusieurs textes rapidement

Utilisez la fonction "Rechercher/Remplacer" de votre éditeur :
- VSCode : Ctrl+H
- Sublime : Ctrl+H
- Notepad++ : Ctrl+H

Exemple : Remplacer "04 233 61 25" par votre nouveau numéro partout

### Sauvegarder avant de modifier

Faites toujours une copie du fichier avant de le modifier :
- Dupliquez : `index.html` → `index.backup.html`
- Ou utilisez Git pour revenir en arrière si besoin

---

**C'est tout ! Vous êtes maintenant prêt à modifier le site facilement. 🎉**
