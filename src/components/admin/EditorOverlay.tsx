'use client';

// src/components/admin/EditorOverlay.tsx
// Reçoit les drafts du parent au chargement et les applique pour que l'utilisateur
// VOIE ses modifs non publiées dans l'iframe.

import { useEffect } from 'react';

export default function EditorOverlay() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!new URLSearchParams(window.location.search).has('edit')) return;
    if (window.parent === window) return;

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
      // Petite pastille bleue si déjà modifié
      postSelect(target);
    }
    function onLinkClick(e: MouseEvent) {
      const link = (e.target as HTMLElement)?.closest('a, button');
      if (!link) return;
      e.preventDefault();
    }

    function applyTextToBlock(blockKey: string, text: string) {
      const el = document.querySelector<HTMLElement>(`[data-edit-block="${CSS.escape(blockKey)}"]`);
      if (el) {
        el.innerText = text;
        el.setAttribute('data-edit-dirty', 'true');
      }
    }

    function onMessage(e: MessageEvent) {
      const msg = e.data;
      if (!msg || typeof msg !== 'object') return;

      if (msg.type === 'editor:apply-text') {
        applyTextToBlock(msg.blockKey, msg.text);
      } else if (msg.type === 'editor:apply-drafts') {
        // Reçoit toutes les drafts et les applique d'un coup
        const drafts = msg.drafts as {
          pageTexts: Record<string, string>;
          faqItems: Record<string, { question?: string; answer?: string }>;
          categories: Record<string, { name?: string; description?: string; imageUrl?: string }>;
        };
        Object.entries(drafts.pageTexts || {}).forEach(([k, v]) => applyTextToBlock(k, v));
        Object.entries(drafts.faqItems || {}).forEach(([id, fields]) => {
          if (fields.question !== undefined) applyTextToBlock(`faq-item:${id}:question`, fields.question);
          if (fields.answer   !== undefined) applyTextToBlock(`faq-item:${id}:answer`,   fields.answer);
        });
        Object.entries(drafts.categories || {}).forEach(([id, fields]) => {
          if (fields.name        !== undefined) applyTextToBlock(`faq-category:${id}:name`, fields.name);
          if (fields.description !== undefined) applyTextToBlock(`faq-category:${id}:description`, fields.description);
        });
      } else if (msg.type === 'editor:reset-blocks') {
        document.querySelectorAll<HTMLElement>('[data-edit-dirty]').forEach((el) => {
          el.removeAttribute('data-edit-dirty');
        });
      }
    }

    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);
    document.addEventListener('click', onClick, true);
    document.addEventListener('click', onLinkClick, false);
    window.addEventListener('message', onMessage);

    const style = document.createElement('style');
    style.textContent = `
      [data-edit-block] { cursor: pointer; transition: outline-color .12s; position: relative; }
      [data-edit-block] * { pointer-events: none; }
      [data-edit-dirty]::after {
        content: ''; position: absolute; top: -6px; right: -6px;
        width: 8px; height: 8px; border-radius: 50%;
        background: #f59e0b; box-shadow: 0 0 0 2px white;
      }
    `;
    document.head.appendChild(style);

    // Annonce ready APRÈS avoir branché les listeners
    window.parent.postMessage({ type: 'editor:ready' }, '*');

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
        el.removeAttribute('data-edit-dirty');
      });
    };
  }, []);

  return null;
}
