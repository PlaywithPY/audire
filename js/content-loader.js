/**
 * Content Loader pour Audire
 * Charge textes.json et config.json et remplit automatiquement les pages
 * Utilise des attributs data-content-key pour identifier les éléments à remplacer
 */

(function() {
  'use strict';

  let textes = null;
  let config = null;
  let currentPage = null;

  // Détecte la page actuelle depuis l'URL
  function detectCurrentPage() {
    const path = window.location.pathname;

    if (path === '/' || path.endsWith('/index.html') || path === '/audire/' || path.endsWith('/audire/index.html')) {
      return 'home';
    }
    if (path.includes('/test-auditif-gratuit')) return 'test-auditif-gratuit';
    if (path.includes('/faq')) return 'faq';
    if (path.includes('/contact')) return 'contact';
    if (path.includes('/notre-accompagnement')) return 'notre-accompagnement';
    if (path.includes('/solutions-auditives')) return 'solutions-auditives';
    if (path.includes('/remboursements')) return 'remboursements';
    if (path.includes('/partenaires-pharmaciens')) return 'partenaires-pharmaciens';

    return null;
  }

  // Charge un fichier JSON
  async function loadJSON(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Failed to load ${url}: ${response.status}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error(`Error loading ${url}:`, error);
      return null;
    }
  }

  // Récupère une valeur depuis un objet en utilisant une clé avec notation pointée
  // Ex: "hero.title" => textes.home.hero.title
  function getValueByKey(obj, key) {
    const keys = key.split('.');
    let value = obj;
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return undefined;
      }
    }
    return value;
  }

  // Remplace le contenu des éléments avec data-content-key
  function replacePageContent() {
    if (!textes || !currentPage) return;

    const pageData = textes[currentPage];
    if (!pageData) {
      console.warn(`No data found for page: ${currentPage}`);
      return;
    }

    // Trouve tous les éléments avec data-content-key
    const elements = document.querySelectorAll('[data-content-key]');

    elements.forEach(element => {
      const key = element.getAttribute('data-content-key');
      const value = getValueByKey(pageData, key);

      if (value !== undefined && value !== null) {
        const type = element.getAttribute('data-content-type') || 'text';

        switch (type) {
          case 'html':
            element.innerHTML = value;
            break;
          case 'text':
            element.textContent = value;
            break;
          default:
            element.textContent = value;
        }
      }
    });

    // Gérer les chips (arrays de strings)
    replaceChips(pageData);

    console.log(`✅ Content loaded for page: ${currentPage}`);
  }

  // Injecte les chips dynamiquement
  function replaceChips(pageData) {
    // Trouver tous les conteneurs de chips dans la page
    const chipsContainers = document.querySelectorAll('.chips');

    chipsContainers.forEach(container => {
      // Déterminer quel array de chips charger en fonction du contexte
      // On cherche le conteneur .hero le plus proche pour détecter que c'est hero.chips
      const heroSection = container.closest('.hero');

      if (heroSection && pageData.hero?.chips) {
        // Injecter les chips depuis le JSON
        container.innerHTML = pageData.hero.chips
          .map(chip => `<span class="chip">${chip}</span>`)
          .join('');
      }
    });
  }

  // Remplace le contenu des éléments avec data-config-key
  function replaceConfigKeys() {
    if (!config) return;

    // Trouve tous les éléments avec data-config-key
    const elements = document.querySelectorAll('[data-config-key]');

    elements.forEach(element => {
      const key = element.getAttribute('data-config-key');
      const value = getValueByKey(config, key);

      if (value !== undefined && value !== null) {
        const type = element.getAttribute('data-content-type') || 'text';

        switch (type) {
          case 'html':
            element.innerHTML = value;
            break;
          case 'text':
            element.textContent = value;
            break;
          default:
            element.textContent = value;
        }
      }
    });
  }

  // Remplace les informations de configuration (téléphone, email, adresse, horaires)
  function replaceConfig() {
    if (!config) return;

    // Appliquer data-config-key
    replaceConfigKeys();

    // Téléphone
    if (config.contact?.phone) {
      document.querySelectorAll('[data-phone]').forEach(el => {
        el.textContent = config.contact.phone.display;
      });
      document.querySelectorAll('[data-phone-href]').forEach(el => {
        el.href = `tel:${config.contact.phone.href}`;
      });
      document.querySelectorAll('a[href^="tel:"]').forEach(el => {
        // Mettre à jour tous les liens tel: si pas de data-phone-href
        if (!el.hasAttribute('data-phone-href') && el.textContent.includes('04 ')) {
          el.href = `tel:${config.contact.phone.href}`;
          el.textContent = el.textContent.replace(/04\s*\d{3}\s*\d{2}\s*\d{2}/, config.contact.phone.display);
        }
      });
    }

    // Email
    if (config.contact?.email) {
      document.querySelectorAll('[data-email]').forEach(el => {
        el.textContent = config.contact.email;
        if (el.tagName === 'A') {
          el.href = `mailto:${config.contact.email}`;
        }
      });
      document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
        if (!el.hasAttribute('data-email')) {
          el.href = `mailto:${config.contact.email}`;
          if (el.textContent.includes('@')) {
            el.textContent = config.contact.email;
          }
        }
      });
    }

    // Adresse
    if (config.contact?.address) {
      const addr = config.contact.address;

      document.querySelectorAll('[data-address-street]').forEach(el => {
        el.textContent = addr.street;
      });

      document.querySelectorAll('[data-address-city]').forEach(el => {
        el.textContent = `${addr.postalCode} ${addr.city}`;
      });

      document.querySelectorAll('[data-address-full]').forEach(el => {
        el.textContent = `${addr.street}, ${addr.postalCode} ${addr.city}`;
      });

      document.querySelectorAll('[data-address-region]').forEach(el => {
        el.textContent = addr.region;
      });
    }

    console.log('✅ Configuration applied');
  }

  // Fonction principale d'initialisation
  async function init() {
    // Détecter la page actuelle
    currentPage = detectCurrentPage();

    if (!currentPage) {
      console.log('Content loader: No matching page detected');
      return;
    }

    console.log(`🔄 Loading content for page: ${currentPage}`);

    // Charger les JSON en parallèle
    const pageContent = await loadJSON(`/audire/content/pages/${currentPage}.json`);
    config = await loadJSON('/audire/content/config.json');

    // Créer un objet textes avec la page actuelle
    if (pageContent) {
      textes = { [currentPage]: pageContent };
    }

    // Appliquer les contenus
    replacePageContent();
    replaceConfig();

    // Dispatcher un événement pour signaler que le contenu est chargé
    document.dispatchEvent(new CustomEvent('contentLoaded', {
      detail: { page: currentPage }
    }));
  }

  // Attendre que les composants (header, footer) soient chargés
  // Puis charger le contenu
  if (document.addEventListener) {
    document.addEventListener('componentsLoaded', () => {
      console.log('🔄 Components loaded, loading content...');
      init();
    });

    // Fallback: Si componentsLoaded a déjà été dispatché ou n'existe pas
    setTimeout(() => {
      if (!textes) {
        console.log('🔄 Fallback: Loading content anyway...');
        init();
      }
    }, 1000);
  }

})();
