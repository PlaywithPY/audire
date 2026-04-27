'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Eye, EyeOff, Trash2, Check, X, Star, ImageIcon } from 'lucide-react';
import MediaPicker from '@/components/MediaPicker';

// ── Types ────────────────────────────────────────────────────────────────────

interface HomeTexts { [key: string]: string; }

interface CardData {
  cardKey: string;
  imageSrc: string;
  title: string;
  description: string;
  imageAlt: string;
  href: string;
  imagePosition: string;
  fallbackEmoji: string;
}

interface Testimonial {
  id: number;
  name: string;
  text: string;
  rating: number;
  location: string | null;
  isVisible: boolean;
  isFeatured: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionCard({ title, icon, children, action }: {
  title: string; icon: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-5">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
        <span className="font-semibold text-sm text-gray-700">{icon} {title}</span>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function EditBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary border border-gray-200 hover:border-primary/40 rounded-lg px-2.5 py-1.5 transition-colors">
      <Pencil size={12} /> Éditer
    </button>
  );
}

// ── CardModal ─────────────────────────────────────────────────────────────────

function CardModal({ card, onClose, onSave }: {
  card: CardData | null;
  onClose: () => void;
  onSave: (data: Partial<CardData>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: card?.title ?? '',
    description: card?.description ?? '',
    imageSrc: card?.imageSrc ?? '',
    imageAlt: card?.imageAlt ?? '',
    href: card?.href ?? '',
    fallbackEmoji: card?.fallbackEmoji ?? '🎯',
  });
  const [saving, setSaving] = useState(false);
  const [mediaPicker, setMediaPicker] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  }

  const field = (key: keyof typeof form, label: string) => (
    <div key={key}>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      <input
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">{card ? 'Modifier la carte' : 'Nouvelle carte'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
          {field('title', 'Titre')}
          {field('description', 'Description')}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Image</label>
            <div className="flex gap-2">
              <input
                value={form.imageSrc}
                onChange={e => setForm(f => ({ ...f, imageSrc: e.target.value }))}
                placeholder="URL de l'image"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={() => setMediaPicker(true)}
                className="flex items-center gap-1 text-xs border border-gray-200 rounded-lg px-2.5 py-2 text-gray-600 hover:bg-gray-50"
              >
                <ImageIcon size={13} /> Médiathèque
              </button>
            </div>
            {form.imageSrc && (
              <img src={form.imageSrc} alt="" className="mt-2 h-20 w-full object-cover rounded-lg border border-gray-200" />
            )}
          </div>
          {field('imageAlt', 'Texte alternatif (alt)')}
          {field('href', 'Lien (href)')}
          {field('fallbackEmoji', 'Emoji de remplacement')}
        </div>
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary-dark disabled:opacity-50"
          >
            {saving ? 'Enregistrement…' : <><Check size={14} className="inline mr-1" />Enregistrer</>}
          </button>
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
            Annuler
          </button>
        </div>
      </div>
      {mediaPicker && (
        <MediaPicker
          isOpen={mediaPicker}
          onClose={() => setMediaPicker(false)}
          onSelect={(url) => { setForm(f => ({ ...f, imageSrc: url })); setMediaPicker(false); }}
          mediaType="image"
        />
      )}
    </div>
  );
}

// ── TestimonialModal ───────────────────────────────────────────────────────────

function TestimonialModal({ testimonial, onClose, onSave }: {
  testimonial: Testimonial | null;
  onClose: () => void;
  onSave: (data: Partial<Testimonial>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: testimonial?.name ?? '',
    text: testimonial?.text ?? '',
    rating: testimonial?.rating ?? 5,
    location: testimonial?.location ?? '',
    isVisible: testimonial?.isVisible ?? true,
    isFeatured: testimonial?.isFeatured ?? false,
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">{testimonial ? 'Modifier le témoignage' : 'Nouveau témoignage'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Nom</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Témoignage</label>
            <textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Ville / Localité</label>
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Note</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <button key={i} onClick={() => setForm(f => ({ ...f, rating: i }))}>
                  <Star size={22} className={i <= form.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 hover:text-amber-300'} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={form.isVisible} onChange={e => setForm(f => ({ ...f, isVisible: e.target.checked }))} className="w-4 h-4 rounded" />
              Visible
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="w-4 h-4 rounded" />
              Mis en avant
            </label>
          </div>
        </div>
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary-dark disabled:opacity-50">
            {saving ? 'Enregistrement…' : <><Check size={14} className="inline mr-1" />Enregistrer</>}
          </button>
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Stars display ─────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={13} className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
      ))}
    </span>
  );
}

// ── SectionTextModal ───────────────────────────────────────────────────────────

interface TextField { key: string; label: string; value: string; multiline?: boolean; }

function SectionTextModal({ title, fields, onClose, onSave }: {
  title: string;
  fields: TextField[];
  onClose: () => void;
  onSave: (values: Record<string, string>) => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map(f => [f.key, f.value]))
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(values);
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
              {f.multiline ? (
                <textarea
                  value={values[f.key]}
                  onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              ) : (
                <input
                  value={values[f.key]}
                  onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary-dark disabled:opacity-50"
          >
            {saving ? 'Enregistrement…' : <><Check size={14} className="inline mr-1" />Enregistrer</>}
          </button>
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// ── HomePanel ─────────────────────────────────────────────────────────────────

export default function HomePanel() {
  const [texts, setTexts] = useState<HomeTexts>({});
  const [cards, setCards] = useState<CardData[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [textModal, setTextModal] = useState<{ title: string; fields: TextField[] } | null>(null);
  const [cardModal, setCardModal] = useState<CardData | 'new' | null>(null);
  const [testimonialModal, setTestimonialModal] = useState<Testimonial | 'new' | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [tRes, cRes, tmRes] = await Promise.all([
      fetch('/api/page-texts?pageKey=home'),
      fetch('/api/card-images?pageKey=home'),
      fetch('/api/admin/testimonials'),
    ]);
    if (tRes.ok) setTexts(await tRes.json());
    if (cRes.ok) setCards(await cRes.json());
    if (tmRes.ok) setTestimonials(await tmRes.json());
    setLoading(false);
  }

  async function saveTexts(values: Record<string, string>) {
    await fetch('/api/admin/page-texts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageKey: 'home', texts: values }),
    });
    setTexts(t => ({ ...t, ...values }));
  }

  async function saveCard(data: Partial<CardData>) {
    const isNew = cardModal === 'new';
    if (isNew) {
      await fetch('/api/admin/card-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageKey: 'home', cardKey: `card-${Date.now()}`, ...data }),
      });
    } else {
      const existing = cardModal as CardData;
      await fetch('/api/admin/card-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageKey: 'home', cardKey: existing.cardKey, ...data }),
      });
    }
    await load();
  }

  async function deleteCard(cardKey: string) {
    if (!confirm('Supprimer cette carte ?')) return;
    await fetch(`/api/admin/card-images?pageKey=home&cardKey=${cardKey}`, { method: 'DELETE' });
    await load();
  }

  async function saveTestimonial(data: Partial<Testimonial>) {
    const isNew = testimonialModal === 'new';
    if (isNew) {
      await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      const existing = testimonialModal as Testimonial;
      await fetch('/api/admin/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: existing.id, ...data }),
      });
    }
    await load();
  }

  async function deleteTestimonial(id: number) {
    if (!confirm('Supprimer ce témoignage ?')) return;
    await fetch(`/api/admin/testimonials?id=${id}`, { method: 'DELETE' });
    await load();
  }

  async function toggleTestimonial(tm: Testimonial) {
    await fetch('/api/admin/testimonials', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tm.id, isVisible: !tm.isVisible }),
    });
    await load();
  }

  if (loading) return <div className="p-10 text-center text-gray-400">Chargement…</div>;

  const t = texts;

  return (
    <div className="p-6 space-y-2 max-w-3xl mx-auto">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Page d&apos;accueil</h2>

      {/* Hero */}
      <SectionCard title="Hero" icon="🏠" action={
        <EditBtn onClick={() => setTextModal({
          title: 'Section Hero',
          fields: [
            { key: 'hero-kicker', label: 'Kicker (badge)', value: t['hero-kicker'] || '' },
            { key: 'hero-title', label: 'Titre principal', value: t['hero-title'] || '' },
            { key: 'description-1', label: 'Description', value: t['description-1'] || '', multiline: true },
            { key: 'chip-1', label: 'Chip 1', value: t['chip-1'] || '' },
            { key: 'chip-2', label: 'Chip 2', value: t['chip-2'] || '' },
            { key: 'chip-3', label: 'Chip 3', value: t['chip-3'] || '' },
            { key: 'chip-4', label: 'Chip 4', value: t['chip-4'] || '' },
          ],
        })}
        />
      }>
        <div className="space-y-2">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{t['hero-kicker'] || <em>badge…</em>}</p>
          <p className="text-xl font-bold text-gray-800">{t['hero-title'] || <em>Titre…</em>}</p>
          <p className="text-sm text-gray-500 leading-relaxed">{t['description-1'] || <em>Description…</em>}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {['chip-1','chip-2','chip-3','chip-4'].map(k => t[k] ? (
              <span key={k} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">{t[k]}</span>
            ) : null)}
          </div>
        </div>
      </SectionCard>

      {/* Fonctionnalités */}
      <SectionCard title="Fonctionnalités" icon="🎯" action={
        <div className="flex gap-2">
          <EditBtn onClick={() => setTextModal({
            title: 'Titres Fonctionnalités',
            fields: [
              { key: 'section-1-title', label: 'Titre de section', value: t['section-1-title'] || '' },
              { key: 'description-2', label: 'Description', value: t['description-2'] || '', multiline: true },
            ],
          })} />
          <button onClick={() => setCardModal('new')}
            className="inline-flex items-center gap-1 text-xs text-primary border border-primary/30 rounded-lg px-2.5 py-1.5 hover:bg-primary/5">
            <Plus size={12} /> Carte
          </button>
        </div>
      }>
        <div className="space-y-1 mb-3">
          <p className="font-semibold text-gray-700">{t['section-1-title'] || <em>Titre section…</em>}</p>
          <p className="text-sm text-gray-500">{t['description-2'] || <em>Description…</em>}</p>
        </div>
        <div className="space-y-2">
          {cards.length === 0 && <p className="text-xs text-gray-400 italic">Aucune carte — cliquez &quot;+ Carte&quot;</p>}
          {cards.map(card => (
            <div key={card.cardKey} className="flex items-center gap-3 p-2.5 border border-gray-100 rounded-xl bg-gray-50">
              {card.imageSrc ? (
                <img src={card.imageSrc} alt="" className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xl flex-shrink-0">{card.fallbackEmoji}</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{card.title}</p>
                <p className="text-xs text-gray-500 truncate">{card.description}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => setCardModal(card)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg"><Pencil size={13} /></button>
                <button onClick={() => deleteCard(card.cardKey)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Témoignages */}
      <SectionCard title="Témoignages" icon="💬" action={
        <button onClick={() => setTestimonialModal('new')}
          className="inline-flex items-center gap-1 text-xs text-primary border border-primary/30 rounded-lg px-2.5 py-1.5 hover:bg-primary/5">
          <Plus size={12} /> Ajouter
        </button>
      }>
        <div className="space-y-2">
          {testimonials.length === 0 && <p className="text-xs text-gray-400 italic">Aucun témoignage</p>}
          {testimonials.map(tm => (
            <div key={tm.id} className={`flex items-start gap-3 p-2.5 border border-gray-100 rounded-xl bg-gray-50 ${!tm.isVisible ? 'opacity-50' : ''}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-gray-800">{tm.name}</span>
                  {tm.location && <span className="text-xs text-gray-400">{tm.location}</span>}
                  {tm.isFeatured && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">★ Mis en avant</span>}
                  {!tm.isVisible && <span className="text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">Masqué</span>}
                </div>
                <Stars rating={tm.rating} />
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{tm.text}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => toggleTestimonial(tm)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg" title={tm.isVisible ? 'Masquer' : 'Afficher'}>
                  {tm.isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
                <button onClick={() => setTestimonialModal(tm)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg"><Pencil size={13} /></button>
                <button onClick={() => deleteTestimonial(tm.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* CTA */}
      <SectionCard title="Appel à l'action" icon="📣" action={
        <EditBtn onClick={() => setTextModal({
          title: 'Section CTA',
          fields: [
            { key: 'section-2-title', label: 'Titre CTA', value: t['section-2-title'] || '' },
            { key: 'description-3', label: 'Description CTA', value: t['description-3'] || '', multiline: true },
          ],
        })} />
      }>
        <div className="space-y-1">
          <p className="font-semibold text-gray-700">{t['section-2-title'] || <em>Titre CTA…</em>}</p>
          <p className="text-sm text-gray-500">{t['description-3'] || <em>Description…</em>}</p>
        </div>
      </SectionCard>

      {/* Modals */}
      {textModal && (
        <SectionTextModal title={textModal.title} fields={textModal.fields}
          onClose={() => setTextModal(null)} onSave={saveTexts} />
      )}
      {cardModal !== null && (
        <CardModal card={cardModal === 'new' ? null : cardModal}
          onClose={() => setCardModal(null)} onSave={saveCard} />
      )}
      {testimonialModal !== null && (
        <TestimonialModal testimonial={testimonialModal === 'new' ? null : testimonialModal}
          onClose={() => setTestimonialModal(null)} onSave={saveTestimonial} />
      )}
    </div>
  );
}
