'use client';

// src/components/admin/useDrafts.ts
// Source de vérité unique : tous les changements en attente vivent ici.
// Étendu Phase 4 : créations, suppressions, et catégorie d'une FAQ.

import { useEffect, useState, useCallback } from 'react';

const KEY = 'audire-editor-drafts';

export type Drafts = {
  pageTexts: Record<string, string>;
  faqItems: Record<string, { question?: string; answer?: string; categoryId?: number | null }>;
  categories: Record<string, { name?: string; description?: string; imageUrl?: string }>;
  newFaqs: Array<{ tempId: string; question: string; answer: string; categoryId?: number | null }>;
  newCategories: Array<{ tempId: string; name: string; description?: string; imageUrl?: string }>;
  deletedFaqIds: number[];
  deletedCategoryIds: number[];
};

const empty: Drafts = {
  pageTexts: {}, faqItems: {}, categories: {},
  newFaqs: [], newCategories: [], deletedFaqIds: [], deletedCategoryIds: [],
};

function read(): Drafts {
  if (typeof window === 'undefined') return empty;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...JSON.parse(raw) };
  } catch { return empty; }
}

function write(d: Drafts) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(d));
  window.dispatchEvent(new CustomEvent('audire-drafts-changed'));
}

function update(fn: (d: Drafts) => Drafts) {
  write(fn(read()));
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
    update((d) => ({ ...d, pageTexts: { ...d.pageTexts, [blockKey]: value } }));
  }, []);

  const setFaqItem = useCallback((id: string, fields: Partial<Drafts['faqItems'][string]>) => {
    update((d) => ({ ...d, faqItems: { ...d.faqItems, [id]: { ...d.faqItems[id], ...fields } } }));
  }, []);

  const setCategory = useCallback((id: string, fields: Partial<Drafts['categories'][string]>) => {
    update((d) => ({ ...d, categories: { ...d.categories, [id]: { ...d.categories[id], ...fields } } }));
  }, []);

  const addFaq = useCallback((faq: Omit<Drafts['newFaqs'][number], 'tempId'>) => {
    const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    update((d) => ({ ...d, newFaqs: [...d.newFaqs, { ...faq, tempId }] }));
    return tempId;
  }, []);

  const updateNewFaq = useCallback((tempId: string, fields: Partial<Drafts['newFaqs'][number]>) => {
    update((d) => ({ ...d, newFaqs: d.newFaqs.map((f) => f.tempId === tempId ? { ...f, ...fields } : f) }));
  }, []);

  const removeNewFaq = useCallback((tempId: string) => {
    update((d) => ({ ...d, newFaqs: d.newFaqs.filter((f) => f.tempId !== tempId) }));
  }, []);

  const addCategory = useCallback((cat: Omit<Drafts['newCategories'][number], 'tempId'>) => {
    const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    update((d) => ({ ...d, newCategories: [...d.newCategories, { ...cat, tempId }] }));
    return tempId;
  }, []);

  const updateNewCategory = useCallback((tempId: string, fields: Partial<Drafts['newCategories'][number]>) => {
    update((d) => ({ ...d, newCategories: d.newCategories.map((c) => c.tempId === tempId ? { ...c, ...fields } : c) }));
  }, []);

  const removeNewCategory = useCallback((tempId: string) => {
    update((d) => ({ ...d, newCategories: d.newCategories.filter((c) => c.tempId !== tempId) }));
  }, []);

  const deleteFaq = useCallback((id: number) => {
    update((d) => ({ ...d, deletedFaqIds: [...new Set([...d.deletedFaqIds, id])] }));
  }, []);

  const undeleteFaq = useCallback((id: number) => {
    update((d) => ({ ...d, deletedFaqIds: d.deletedFaqIds.filter((x) => x !== id) }));
  }, []);

  const deleteCategory = useCallback((id: number) => {
    update((d) => ({ ...d, deletedCategoryIds: [...new Set([...d.deletedCategoryIds, id])] }));
  }, []);

  const undeleteCategory = useCallback((id: number) => {
    update((d) => ({ ...d, deletedCategoryIds: d.deletedCategoryIds.filter((x) => x !== id) }));
  }, []);

  const clear = useCallback(() => write(empty), []);

  const count =
    Object.keys(drafts.pageTexts).length +
    Object.keys(drafts.faqItems).length +
    Object.keys(drafts.categories).length +
    drafts.newFaqs.length +
    drafts.newCategories.length +
    drafts.deletedFaqIds.length +
    drafts.deletedCategoryIds.length;

  return {
    drafts, count, clear,
    setPageText, setFaqItem, setCategory,
    addFaq, updateNewFaq, removeNewFaq,
    addCategory, updateNewCategory, removeNewCategory,
    deleteFaq, undeleteFaq, deleteCategory, undeleteCategory,
  };
}

export const draftsStore = { read, write, clear: () => write(empty) };
