'use client';

// src/components/EditorNavSync.tsx
// Sprint 4 — composant client à monter dans le RootLayout (ou un Layout commun
// englobant toutes les pages publiques) pour que la nav iframe soit synchronisée
// avec le dropdown du parent.
//
// 1) Au mount, poste le pathname courant.
// 2) Intercepte tous les clics sur des liens internes et poste le pathname avant que la nav se fasse.
// 3) Aussi : écoute les changements via popstate.
//
// Conditions : ne s'active que si on est dans une iframe (window !== window.parent)
// ET si on a `?edit=1` dans l'URL → ne perturbe jamais l'expérience publique normale.

import { useEffect } from 'react';

export default function EditorNavSync() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window === window.parent) return; // pas dans une iframe
    const params = new URLSearchParams(window.location.search);
    if (params.get('edit') !== '1') return;

    const post = (path: string) => {
      try { window.parent.postMessage({ type: 'editor:navigate', path }, '*'); } catch {}
    };

    // 1) état initial
    post(window.location.pathname);

    // 2) intercepte les clics sur <a>
    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement)?.closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return; // lien externe → on ne touche pas
        // On poste tout de suite, et on s'assure que le ?edit=1 est conservé pour la nav réelle.
        post(url.pathname);
      } catch { /* href bizarre */ }
    }
    document.addEventListener('click', onClick, true);

    // 3) popstate (back/forward dans l'iframe)
    function onPop() { post(window.location.pathname); }
    window.addEventListener('popstate', onPop);

    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  return null;
}
