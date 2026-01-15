/**
 * Content Loader pour Audire
 * Charge les contenus depuis /content/*.json et met à jour le DOM
 * À charger AVANT components.js et main.js
 */

(function() {
  'use strict';

  // Cache pour les contenus chargés
  const contentCache = {};

  // Charge un fichier JSON
  async function loadJSON(path) {
    if (contentCache[path]) {
      return contentCache[path];
    }

    try {
      const response = await fetch(path);
      if (!response.ok) {
        console.warn(`Failed to load content: ${path}`);
        return null;
      }
      const data = await response.json();
      contentCache[path] = data;
      return data;
    } catch (error) {
      console.error(`Error loading content ${path}:`, error);
      return null;
    }
  }

  // Applique les contenus de contact (téléphone, email, adresse)
  async function applyContactContent() {
    const contact = await loadJSON('/content/contact.json');
    if (!contact) return;

    // Mise à jour du téléphone
    document.querySelectorAll('[data-tel]').forEach(el => {
      el.setAttribute('href', `tel:${contact.phoneHref}`);
    });
    document.querySelectorAll('[data-tel-text]').forEach(el => {
      el.textContent = contact.phoneDisplay;
    });

    // Mise à jour de l'email
    document.querySelectorAll('[data-mail]').forEach(el => {
      el.setAttribute('href', `mailto:${contact.email}`);
    });
    document.querySelectorAll('[data-mail-text]').forEach(el => {
      el.textContent = contact.email;
    });

    // Mise à jour des adresses
    document.querySelectorAll('[data-address-street]').forEach(el => {
      el.textContent = contact.street;
    });
    document.querySelectorAll('[data-address-city]').forEach(el => {
      el.textContent = contact.city;
    });
    document.querySelectorAll('[data-address-zip]').forEach(el => {
      el.textContent = contact.zip;
    });
    document.querySelectorAll('[data-address-full]').forEach(el => {
      el.textContent = `${contact.street}, ${contact.zip} ${contact.city}`;
    });

    // Mise à jour de la province
    document.querySelectorAll('[data-province]').forEach(el => {
      el.textContent = contact.province;
    });

    // Mise à jour du JSON-LD
    document.querySelectorAll('script[type="application/ld+json"][data-mail-json]').forEach(script => {
      script.textContent = script.textContent.replace(/__AUDIRE_EMAIL__/g, contact.email);
    });

    console.log('✅ Contact content loaded');
  }

  // Applique les contenus de la page d'accueil
  async function applyHomepageContent() {
    // Vérifie qu'on est sur la page d'accueil
    if (window.location.pathname !== '/' && !window.location.pathname.endsWith('/index.html')) {
      return;
    }

    const homepage = await loadJSON('/content/pages/homepage.json');
    if (!homepage) return;

    // Mise à jour du titre H1
    const h1 = document.querySelector('h1[data-content="title"]');
    if (h1) h1.textContent = homepage.title;

    // Mise à jour du sous-titre
    const subtitle = document.querySelector('.lead[data-content="subtitle"]');
    if (subtitle) subtitle.textContent = homepage.subtitle;

    // Mise à jour du kicker
    const kicker = document.querySelector('.kicker span:last-child[data-content="kicker"]');
    if (kicker) kicker.textContent = homepage.kicker;

    // Mise à jour des chips
    const chipsContainer = document.querySelector('.chips[data-content="chips"]');
    if (chipsContainer && homepage.chips) {
      chipsContainer.innerHTML = homepage.chips
        .map(chip => `<span class="chip">${chip}</span>`)
        .join('');
    }

    // Mise à jour de la section "Ce qu'on fait"
    if (homepage.whatWeDo) {
      const sectionTitle = document.querySelector('[data-content="whatWeDo-title"]');
      if (sectionTitle) sectionTitle.textContent = homepage.whatWeDo.title;

      const sectionDesc = document.querySelector('[data-content="whatWeDo-description"]');
      if (sectionDesc) sectionDesc.textContent = homepage.whatWeDo.description;
    }

    console.log('✅ Homepage content loaded');
  }

  // Fonction principale
  async function loadAllContent() {
    await Promise.all([
      applyContactContent(),
      applyHomepageContent()
    ]);

    // Dispatch un événement pour signaler que les contenus sont chargés
    document.dispatchEvent(new CustomEvent('contentLoaded'));
    console.log('✅ All content loaded and applied');
  }

  // IMPORTANT: Attendre que les composants soient chargés AVANT d'appliquer les contenus
  // Sinon, les éléments du header/footer n'existent pas encore !
  document.addEventListener('componentsLoaded', () => {
    console.log('🔄 Components loaded, now loading content...');
    loadAllContent();
  });

  // Fallback si l'événement componentsLoaded a déjà été dispatché
  // (cas où content-loader.js se charge après components.js)
  setTimeout(() => {
    if (!document.querySelector('[data-tel]')) {
      console.warn('⚠️ Retrying content load (components may have loaded before listener)');
      loadAllContent();
    }
  }, 500);
})();
