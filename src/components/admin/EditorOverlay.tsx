'use client';

// src/components/admin/EditorOverlay.tsx
// Composant à monter dans le layout root quand l'URL contient ?edit=1.
// - Détecte les éléments [data-edit-block] et les rend cliquables/sélectionnables
// - Notifie le parent (admin) via postMessage : ready / select / deselect
// - Reçoit du parent : updates (texte modifié dans l'inspecteur → applique en live)
//
// Intégration : dans src/app/layout.tsx (layout root du site public), à la fin du <body>.

import { useEffect } from 'react';

export default function EditorOverlay() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!new URLSearchParams(window.location.search).has('edit')) return;
    if (window.parent === window) return;

    window.parent.postMessage({ type: 'editor:ready' }, '*');

    let selected: HTMLElement | null = null;

    function postSelect(target: HTMLElement) {
      const rect = target.getBoundingClientRect();
      const data: Record<string, unknown> = {};
      Object.entries(target.dataset).forEach(([k, v]) => {
        if (k.startsWith('edit') && k !== 'editBlock') data[k.replace(/^edit/, '').replace(/^./, (c) => c.toLowerCase())] = v;
      });
      data.text = target.innerText;

      window.parent.postMessage({
        type: 'editor:select',
        blockKey: target.dataset.editBlock!,
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        data,
      }, '*');
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
        if (selected) {
          selected.style.outline = '';
          selected = null;
          window.parent.postMessage({ type: 'editor:deselect' }, '*');
        }
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      if (selected && selected !== target) selected.style.outline = '';
      selected = target;
      target.style.outline = '2px solid rgb(59,130,246)';
      target.style.outlineOffset = '4px';
      postSelect(target);
    }
    function onLinkClick(e: MouseEvent) {
      const link = (e.target as HTMLElement)?.closest('a, button');
      if (!link) return;
      e.preventDefault();
    }

    // Reçoit les messages du parent (admin)
    function onMessage(e: MessageEvent) {
      const msg = e.data;
      if (!msg || typeof msg !== 'object') return;

      if (msg.type === 'editor:apply-text') {
        // { blockKey, text } → trouve l'élément et met à jour son textContent
        const el = document.querySelector<HTMLElement>(`[data-edit-block="${msg.blockKey}"]`);
        if (el) el.innerText = msg.text;
      }
    }

    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);
    document.addEventListener('click', onClick, true);
    document.addEventListener('click', onLinkClick, false);
    window.addEventListener('message', onMessage);

    const style = document.createElement('style');
    style.textContent = `
      [data-edit-block] { cursor: pointer; transition: outline-color .12s; }
      [data-edit-block] * { pointer-events: none; }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('click', onLinkClick, false);
      window.removeEventListener('message', onMessage);
      style.remove();
      document.querySelectorAll<HTMLElement>('[data-edit-block]').forEach((el) => {
        el.style.outline = '';
        el.style.outlineOffset = '';
      });
    };
  }, []);

  return null;
}
