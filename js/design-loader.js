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

    document.dispatchEvent(new CustomEvent('designLoaded', { detail: d }));
  } catch (e) {
    // En cas d'erreur, les valeurs par défaut du CSS restent actives
  }
})();
