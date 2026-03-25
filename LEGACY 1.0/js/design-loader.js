(async () => {
  try {
    const url = '/audire/content/design.json?t=' + Date.now();
    const d   = await fetch(url).then(r => r.json());
    const root = document.documentElement.style;

    const c = d.colors   || {};
    const r = d.radius   || {};
    const t = d.typography || {};
    const b = d.branding || {};

    // Couleurs
    if (c.primary)      root.setProperty('--primary',      c.primary.value);
    if (c.primaryLight) root.setProperty('--primary-light',c.primaryLight.value);
    if (c.primaryDark)  root.setProperty('--primary-dark', c.primaryDark.value);
    if (c.secondary)    root.setProperty('--secondary',    c.secondary.value);
    if (c.bg)           root.setProperty('--bg',           c.bg.value);
    if (c.bgAlt)        root.setProperty('--bg-alt',       c.bgAlt.value);
    if (c.panel)        root.setProperty('--panel',        c.panel.value);
    if (c.text)         root.setProperty('--text',         c.text.value);
    if (c.textLight)    root.setProperty('--text-light',   c.textLight.value);
    if (c.textMuted)    root.setProperty('--text-muted',   c.textMuted.value);
    if (c.border)       root.setProperty('--border',       c.border.value);

    // Rayons
    if (r.sm) root.setProperty('--radius-sm', r.sm.value);
    if (r.md) root.setProperty('--radius-md', r.md.value);
    if (r.lg) root.setProperty('--radius-lg', r.lg.value);
    if (r.xl) root.setProperty('--radius-xl', r.xl.value);

    // Typographie — recharge Google Fonts si changé
    const bodyFont    = t.fontBody?.value    || 'Inter';
    const headingFont = t.fontHeading?.value || 'Playfair Display';

    const defaults = { body: 'Inter', heading: 'Playfair Display' };
    if (bodyFont !== defaults.body || headingFont !== defaults.heading) {
      const link = document.createElement('link');
      link.rel  = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(bodyFont)}:wght@300;400;500;600;700;800&family=${encodeURIComponent(headingFont)}:wght@700;800&display=swap`;
      document.head.appendChild(link);
    }

    root.setProperty('--font-body',    `"${bodyFont}", -apple-system, sans-serif`);
    root.setProperty('--font-heading', `"${headingFont}", Georgia, serif`);

    // Branding
    if (b.logoSize) root.setProperty('--logo-size', b.logoSize.value);

    // ===== BACKGROUNDS =====
    // Appliquer les images de fond selon la page
    const backgrounds = d.backgrounds || {};
    const path = window.location.pathname;
    let currentPage = '';

    if (path.includes('/index.html') || path === '/audire/' || path === '/audire/index.html' || path === '/audire') {
      currentPage = 'home';
    } else if (path.includes('/accompagnement/')) {
      currentPage = 'accompagnement';
    } else if (path.includes('/remboursements/')) {
      currentPage = 'remboursements';
    } else if (path.includes('/contact/')) {
      currentPage = 'contact';
    } else if (path.includes('/pharmaciens/') || path.includes('/partenaires-pharmaciens/')) {
      currentPage = 'pharmaciens';
    } else if (path.includes('/faq/')) {
      currentPage = 'faq';
    }

    if (currentPage && backgrounds[currentPage]) {
      const pageBackgrounds = backgrounds[currentPage];

      // Attendre que le DOM soit chargé
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => applyBackgrounds(pageBackgrounds, currentPage));
      } else {
        applyBackgrounds(pageBackgrounds, currentPage);
      }
    }

    document.dispatchEvent(new CustomEvent('designLoaded', { detail: d }));
  } catch (e) {
    // En cas d'erreur, les valeurs par défaut du CSS restent actives
  }
})();

function applyBackgrounds(pageBackgrounds, currentPage) {
  // Mapping des sections par index (plus simple et fiable)
  const sectionMappings = {
    'home': {
      'hero': () => document.querySelector('.hero'),
      'whyAudire': () => document.querySelectorAll('.section')[0],
      'process': () => document.querySelectorAll('.section')[1],
      'solutions': () => document.querySelectorAll('.section')[2]
    },
    'accompagnement': {
      'hero': () => document.querySelector('.hero'),
      'processus': () => document.querySelectorAll('.section')[0]
    },
    'remboursements': {
      'hero': () => document.querySelector('.hero'),
      'inami': () => document.querySelectorAll('.section')[0]
    },
    'contact': {
      'hero': () => document.querySelector('.hero')
    },
    'pharmaciens': {
      'hero': () => document.querySelector('.hero')
    },
    'faq': {
      'hero': () => document.querySelector('.hero')
    }
  };

  const mappings = sectionMappings[currentPage] || {};

  Object.keys(pageBackgrounds).forEach(sectionKey => {
    const bgUrl = pageBackgrounds[sectionKey];
    if (!bgUrl) return;

    const elementGetter = mappings[sectionKey];
    if (!elementGetter) return;

    const element = elementGetter();
    if (!element) return;

    // Appliquer l'image de fond avec un overlay pour la lisibilité
    element.style.backgroundImage = `linear-gradient(rgba(255, 140, 66, 0.85), rgba(255, 140, 66, 0.85)), url('${bgUrl}')`;
    element.style.backgroundSize = 'cover';
    element.style.backgroundPosition = 'center';
    element.style.backgroundRepeat = 'no-repeat';

    // Ajuster les couleurs du texte pour la lisibilité
    element.style.color = 'white';

    // Ajuster les titres, paragraphes, et autres éléments
    const textElements = element.querySelectorAll('h1, h2, h3, h4, h5, h6, p, .lead, .section-tag, .section-title, .section-subtitle, .kicker');
    textElements.forEach(el => {
      el.style.color = 'white';
      el.style.textShadow = '0 2px 8px rgba(0,0,0,0.3)';
    });

    // Ajuster les chips et boutons
    const chips = element.querySelectorAll('.chip');
    chips.forEach(chip => {
      chip.style.background = 'rgba(255,255,255,0.2)';
      chip.style.color = 'white';
      chip.style.backdropFilter = 'blur(10px)';
    });
  });
}
