'use client';

// src/components/admin/useDrafts.ts
// Gère les modifications non publiées en localStorage (single source of truth client).
// Aucune écriture en base tant que l'utilisateur ne clique pas Publier.

import { useEffect, useState, useCallback } from 'react';

const KEY = 'audire-editor-drafts';

export type Drafts = {
  pageTexts: Record<string, string>;            // "faq.hero-title" → "Nouveau titre"
  faqItems: Record<string, { question?: string; answer?: string }>; // "42" → {...}
  categories: Record<string, { name?: string; description?: string; imageUrl?: string }>;
};

const empty: Drafts = { pageTexts: {}, faqItems: {}, categories: {} };

function read(): Drafts {
  if (typeof window === 'undefined') return empty;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    return { ...empty, ...parsed };
  } catch { return empty; }
}

function write(d: Drafts) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(d));
  window.dispatchEvent(new CustomEvent('audire-drafts-changed'));
}

export function useDrafts() {
  const [drafts, setDrafts] = useState<Drafts>(empty);

  useEffect(() => {
    setDrafts(read());
    const onChange = () => setDrafts(read());
    window.addEventListener('audire-drafts-changed', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('audire-drafts-changed', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const setPageText = useCallback((blockKey: string, value: string) => {
    const d = read();
    d.pageTexts[blockKey] = value;
    write(d);
  }, []);

  const setFaqItem = useCallback((id: string, field: 'question' | 'answer', value: string) => {
    const d = read();
    d.faqItems[id] = { ...d.faqItems[id], [field]: value };
    write(d);
  }, []);

  const setCategory = useCallback((id: string, field: 'name' | 'description' | 'imageUrl', value: string) => {
    const d = read();
    d.categories[id] = { ...d.categories[id], [field]: value };
    write(d);
  }, []);

  const clear = useCallback(() => write(empty), []);

  const count =
    Object.keys(drafts.pageTexts).length +
    Object.keys(drafts.faqItems).length +
    Object.keys(drafts.categories).length;

  return { drafts, setPageText, setFaqItem, setCategory, clear, count };
}

// Helper utilisable hors React (pour les listeners undo/redo)
export const draftsStore = {
  read,
  write,
  clear: () => write(empty),
};
