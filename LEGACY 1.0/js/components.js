/**
 * Component Loader for Audire
 * Charge automatiquement header, footer et modal depuis /components/
 * Usage: Inclure AVANT main.js dans chaque page
 */

(function() {
  'use strict';

  // Détermine le chemin relatif vers /audire/components/ selon la profondeur de la page
  function getComponentsPath() {
    const path = window.location.pathname;
    const depth = path.split('/').filter(p => p).length;

    // Page racine (/) ou index.html à la racine
    if (depth === 0 || path === '/' || path === '/index.html') {
      return '/audire/components/';
    }

    // Pages dans un sous-dossier
    return '/audire/components/';
  }

  // Charge un composant HTML
  async function loadComponent(name, targetId) {
    try {
      const basePath = getComponentsPath();
      const response = await fetch(`${basePath}${name}.html`);

      if (!response.ok) {
        console.warn(`Failed to load component: ${name}`);
        return;
      }

      const html = await response.text();
      const target = document.getElementById(targetId);

      if (target) {
        target.innerHTML = html;
      } else {
        console.warn(`Target element #${targetId} not found for component ${name}`);
      }
    } catch (error) {
      console.error(`Error loading component ${name}:`, error);
    }
  }

  // Charge tous les composants dès que le DOM est prêt
  async function loadAllComponents() {
    // Charge en parallèle pour plus de performance
    await Promise.all([
      loadComponent('header', 'app-header'),
      loadComponent('footer', 'app-footer'),
      loadComponent('modal', 'app-modal')
    ]);

    // Dispatch un événement custom pour signaler que les composants sont chargés
    // Utile si d'autres scripts doivent attendre que les composants soient présents
    document.dispatchEvent(new CustomEvent('componentsLoaded'));
  }

  // Charge les composants dès que le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAllComponents);
  } else {
    // DOM déjà chargé
    loadAllComponents();
  }
})();
