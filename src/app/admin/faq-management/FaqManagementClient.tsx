'use client';

// src/app/admin/faq-management/FaqManagementClient.tsx
// Panneau B — gestion en lot des FAQ et catégories.
// Lit les drafts via useDrafts (même source que l'éditeur inline /admin/editor).
// Toutes les actions sont des drafts ; rien n'est envoyé en base avant Publier.

import { useEffect, useState, useMemo } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import PublishBar from '@/components/admin/PublishBar';
import { useDrafts, draftsStore } from '@/components/admin/useDrafts';
import { Plus, Trash2, RotateCcw, FolderOpen, HelpCircle } from 'lucide-react';

type FAQ = { id: number; question: string; answer: string; order: number; categoryId: number | null };
type Category = { id: number; name: string; description: string | null; imageUrl: string | null; faqs: FAQ[] };

export default function FaqManagementClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allFaqs, setAllFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<number | null | 'uncategorized'>(null);

  const d = useDrafts();

  // Charge les données live
  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.ok ? r.json() : []),
      fetch('/api/faqs').then((r) => r.ok ? r.json() : []),
    ]).then(([cats, faqs]) => {
      setCategories(cats);
      setAllFaqs(faqs);
      setLoading(false);
    });
  }, []);

  // Vues fusionnées (live + drafts)
  const mergedCategories = useMemo(() => {
    const live = categories
      .filter((c) => !d.drafts.deletedCategoryIds.includes(c.id))
      .map((c) => ({
        id: c.id as number | string,
        isNew: false,
        name:        d.drafts.categories[c.id]?.name        ?? c.name,
        description: d.drafts.categories[c.id]?.description ?? c.description ?? '',
        imageUrl:    d.drafts.categories[c.id]?.imageUrl    ?? c.imageUrl ?? '',
      }));
    const created = d.drafts.newCategories.map((c) => ({
      id: c.tempId, isNew: true,
      name: c.name, description: c.description ?? '', imageUrl: c.imageUrl ?? '',
    }));
    return [...live, ...created];
  }, [categories, d.drafts]);

  const mergedFaqs = useMemo(() => {
    const live = allFaqs
      .filter((f) => !d.drafts.deletedFaqIds.includes(f.id))
      .map((f) => ({
        id: f.id as number | string,
        isNew: false,
        question:   d.drafts.faqItems[f.id]?.question   ?? f.question,
        answer:     d.drafts.faqItems[f.id]?.answer     ?? f.answer,
        categoryId: d.drafts.faqItems[f.id]?.categoryId !== undefined
          ? d.drafts.faqItems[f.id].categoryId
          : f.categoryId,
      }));
    const created = d.drafts.newFaqs.map((f) => ({
      id: f.tempId, isNew: true,
      question: f.question, answer: f.answer, categoryId: f.categoryId ?? null,
    }));
    return [...live, ...created];
  }, [allFaqs, d.drafts]);

  const filteredFaqs = useMemo(() => {
    if (filter === null) return mergedFaqs;
    if (filter === 'uncategorized') return mergedFaqs.filter((f) => !f.categoryId);
    return mergedFaqs.filter((f) => f.categoryId === filter);
  }, [mergedFaqs, filter]);

  async function handlePublish() {
    const res = await fetch('/api/admin/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draftsStore.read()),
    });
    if (!res.ok) { alert('Erreur de publication'); return; }
    d.clear();
    // Recharge les données live
    const [cats, faqs] = await Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/faqs').then((r) => r.json()),
    ]);
    setCategories(cats);
    setAllFaqs(faqs);
  }

  function handleDiscard() { d.clear(); }

  return (
    <div className="flex flex-col h-screen">
      <AdminTopbar
        crumbs={[{ label: 'Site web' }, { label: 'FAQ — Gestion' }]}
        rightExtra={<PublishBar pendingCount={d.count} onPublish={handlePublish} onDiscard={handleDiscard} />}
      />

      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-6xl mx-auto p-8 space-y-10">
          {loading ? (
            <p className="text-gray-500">Chargement…</p>
          ) : (
            <>
              {/* CATÉGORIES */}
              <section>
                <header className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-gray-500" />
                    <h2 className="text-lg font-semibold">Catégories</h2>
                    <span className="text-sm text-gray-400">{mergedCategories.length}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => d.addCategory({ name: 'Nouvelle catégorie' })}
                    className="h-8 px-3 rounded-md bg-gray-900 text-white text-[13px] font-medium hover:bg-black flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Nouvelle catégorie
                  </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mergedCategories.map((c) => (
                    <CategoryCard
                      key={c.id} cat={c}
                      onUpdate={(fields: Partial<{ name: string; description: string; imageUrl: string }>) => {
                        if (c.isNew) d.updateNewCategory(c.id as string, fields);
                        else d.setCategory(String(c.id), fields);
                      }}
                      onDelete={() => {
                        if (c.isNew) d.removeNewCategory(c.id as string);
                        else d.deleteCategory(c.id as number);
                      }}
                    />
                  ))}
                  {d.drafts.deletedCategoryIds.map((id) => {
                    const c = categories.find((x) => x.id === id);
                    if (!c) return null;
                    return (
                      <div key={`del-${id}`} className="p-3 rounded-lg border border-red-200 bg-red-50/50 flex items-center justify-between">
                        <span className="text-[13px] text-red-700 line-through">{c.name}</span>
                        <button type="button" onClick={() => d.undeleteCategory(id)}
                          className="text-[12px] text-red-700 hover:underline flex items-center gap-1">
                          <RotateCcw className="w-3 h-3" /> Restaurer
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* FAQS */}
              <section>
                <header className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-gray-500" />
                    <h2 className="text-lg font-semibold">Questions</h2>
                    <span className="text-sm text-gray-400">{mergedFaqs.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={filter === null ? '' : String(filter)}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === '') setFilter(null);
                        else if (v === 'uncategorized') setFilter('uncategorized');
                        else setFilter(Number(v));
                      }}
                      className="h-8 px-2 text-[13px] border border-gray-200 rounded-md bg-white"
                    >
                      <option value="">Toutes les catégories</option>
                      <option value="uncategorized">Sans catégorie</option>
                      {mergedCategories.filter((c) => !c.isNew).map((c) => (
                        <option key={c.id} value={String(c.id)}>{c.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => d.addFaq({ question: 'Nouvelle question', answer: '', categoryId: typeof filter === 'number' ? filter : null })}
                      className="h-8 px-3 rounded-md bg-gray-900 text-white text-[13px] font-medium hover:bg-black flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Nouvelle question
                    </button>
                  </div>
                </header>

                <div className="space-y-2">
                  {filteredFaqs.map((f) => (
                    <FaqRow
                      key={f.id} faq={f} categories={mergedCategories.filter((c) => !c.isNew) as { id: number; name: string }[]}
                      onUpdate={(fields: Partial<{ question: string; answer: string; categoryId: number | null }>) => {
                        if (f.isNew) d.updateNewFaq(f.id as string, fields);
                        else d.setFaqItem(String(f.id), fields);
                      }}
                      onDelete={() => {
                        if (f.isNew) d.removeNewFaq(f.id as string);
                        else d.deleteFaq(f.id as number);
                      }}
                    />
                  ))}
                  {filteredFaqs.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-8">Aucune question</p>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ cat, onUpdate, onDelete }: any) {
  return (
    <div className={`p-3 rounded-lg border bg-white ${cat.isNew ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200'}`}>
      <div className="flex items-center gap-2 mb-2">
        <input
          value={cat.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="flex-1 text-[14px] font-semibold bg-transparent focus:outline-none"
        />
        <button type="button" onClick={onDelete} className="text-gray-400 hover:text-red-600">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <textarea
        value={cat.description}
        onChange={(e) => onUpdate({ description: e.target.value })}
        placeholder="Description (optionnelle)"
        rows={2}
        className="w-full text-[12px] p-1.5 border border-gray-100 rounded bg-gray-50 focus:outline-none focus:border-gray-300 resize-none"
      />
    </div>
  );
}

function FaqRow({ faq, categories, onUpdate, onDelete }: any) {
  const [open, setOpen] = useState<boolean>(Boolean(faq.isNew));
  return (
    <div className={`rounded-lg border bg-white ${faq.isNew ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200'}`}>
      <div className="flex items-center gap-2 p-3">
        <input
          value={faq.question}
          onChange={(e) => onUpdate({ question: e.target.value })}
          placeholder="Question"
          className="flex-1 text-[13px] font-medium bg-transparent focus:outline-none"
        />
        <select
          value={faq.categoryId ?? ''}
          onChange={(e) => onUpdate({ categoryId: e.target.value ? Number(e.target.value) : null })}
          className="text-[12px] px-2 py-1 border border-gray-200 rounded bg-white"
        >
          <option value="">Sans catégorie</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button type="button" onClick={() => setOpen((v) => !v)} className="text-[11px] text-gray-500 hover:text-gray-900 px-2">
          {open ? 'Réduire' : 'Réponse'}
        </button>
        <button type="button" onClick={onDelete} className="text-gray-400 hover:text-red-600">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {open && (
        <div className="px-3 pb-3">
          <textarea
            value={faq.answer}
            onChange={(e) => onUpdate({ answer: e.target.value })}
            placeholder="Réponse"
            rows={4}
            className="w-full text-[12px] p-2 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:border-gray-300 resize-y"
          />
        </div>
      )}
    </div>
  );
}
