'use client';

// src/components/admin/EditorOverlay.tsx
// Composant à monter dans le layout root quand l'URL contient ?edit=1.
// Rend chaque [data-edit-block] cliquable et notifie le parent (admin) via postMessage.
//
// Intégration : dans src/app/layout.tsx (layout root du site public), ajouter :
//
//   import EditorOverlay from '@/components/admin/EditorOverlay';
//   ...
//   <body>
//     {children}
//     <EditorOverlay />
//   </body>
//
// Le composant détecte ?edit=1 lui-même et ne s'active que dans ce cas.
// En production sans le flag, il n'a aucun effet (return null).

import { useEffect } from 'react';

export default function EditorOverlay() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!new URLSearchParams(window.location.search).has('edit')) return;
    if (window.parent === window) return; // pas dans un iframe → on ignore

    // Notifie le parent qu'on est prêt
    window.parent.postMessage({ type: 'editor:ready' }, '*');

    let selected: HTMLElement | null = null;

    function clearOutlines() {
      document.querySelectorAll<HTMLElement>('[data-edit-block]').forEach((el) => {
        el.style.outline = '';
        el.style.outlineOffset = '';
      });
    }

    function onMouseOver(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest<HTMLElement>('[data-edit-block]');
      if (!target || target === selected) return;
      target.style.outline = '1px dashed rgba(59,130,246,0.6)';
      target.style.outlineOffset = '4px';
    }

    function onMouseOut(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest<HTMLElement>('[data-edit-block]');
      if (!target || target === selected) return;
      target.style.outline = '';
      target.style.outlineOffset = '';
    }

    function onClick(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest<HTMLElement>('[data-edit-block]');
      if (!target) {
        // Click hors d'un bloc → désélection
        if (selected) {
          selected.style.outline = '';
          selected = null;
          window.parent.postMessage({ type: 'editor:deselect' }, '*');
        }
        return;
      }
      e.preventDefault();
      e.stopPropagation();

      if (selected && selected !== target) {
        selected.style.outline = '';
      }
      selected = target;
      target.style.outline = '2px solid rgb(59,130,246)';
      target.style.outlineOffset = '4px';

      const rect = target.getBoundingClientRect();
      const data: Record<string, unknown> = {};
      Object.entries(target.dataset).forEach(([k, v]) => {
        if (k.startsWith('edit') && k !== 'editBlock') data[k.replace(/^edit/, '').replace(/^./, (c) => c.toLowerCase())] = v;
      });
      data.text = target.innerText.slice(0, 200);

      window.parent.postMessage({
        type: 'editor:select',
        blockKey: target.dataset.editBlock!,
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        data,
      }, '*');
    }

    // Bloque la navigation des liens en mode édition
    function onLinkClick(e: MouseEvent) {
      const link = (e.target as HTMLElement)?.closest('a');
      if (!link) return;
      e.preventDefault();
    }

    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);
    document.addEventListener('click', onClick, true);
    document.addEventListener('click', onLinkClick, false);

    // Style global pour cursor pointer sur les blocs éditables
    const style = document.createElement('style');
    style.textContent = `
      [data-edit-block] { cursor: pointer; transition: outline-color .12s; }
      [data-edit-block] * { pointer-events: none; }
      [data-edit-block] a, [data-edit-block] button { pointer-events: none !important; }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('click', onLinkClick, false);
      style.remove();
      clearOutlines();
    };
  }, []);

  return null;
}
