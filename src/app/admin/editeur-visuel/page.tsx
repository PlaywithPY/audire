'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Plus,
  Pencil,
  Eye,
  EyeOff,
  Trash2,
  Type,
  AlignLeft,
  MousePointer,
  CreditCard,
  ImageIcon,
  Code,
  ExternalLink,
  X,
  Check,
  ChevronRight,
} from 'lucide-react';
import AdminHeader from '@/components/AdminHeader';
import MediaPicker from '@/components/MediaPicker';
import Link from 'next/link';
import HomePanel from './HomePanel';

type ContentBlock = {
  id: number;
  pageKey: string;
  blockKey: string;
  blockType: string;
  content: string;
  metadata: string | null;
  order: number;
  isVisible: boolean;
};

type Page = {
  key: string;
  label: string;
  icon: string;
  path: string;
};

const PREDEFINED_PAGES: Page[] = [
  { key: 'home',                    label: 'Accueil',              icon: '🏠', path: '/' },
  { key: 'solutions-auditives',     label: 'Solutions auditives',  icon: '🎯', path: '/solutions-auditives' },
  { key: 'remboursements',          label: 'Remboursements',       icon: '💶', path: '/remboursements' },
  { key: 'notre-accompagnement',    label: 'Notre accompagnement', icon: '🤝', path: '/notre-accompagnement' },
  { key: 'notre-histoire',          label: 'Notre histoire',       icon: '📖', path: '/notre-histoire' },
  { key: 'partenaires-pharmaciens', label: 'Partenaires',          icon: '🤲', path: '/partenaires-pharmaciens' },
  { key: 'faq',                     label: 'FAQ',                  icon: '❓', path: '/faq' },
  { key: 'contact',                 label: 'Contact',              icon: '📬', path: '/contact' },
  { key: 'test-auditif-gratuit',    label: 'Test auditif gratuit', icon: '🦻', path: '/test-auditif-gratuit' },
];

const BLOCK_TYPES = [
  { type: 'title', label: 'Titre', icon: Type, description: 'Titre H2 en grand' },
  { type: 'text', label: 'Texte', icon: AlignLeft, description: 'Paragraphe de texte' },
  { type: 'button', label: 'Bouton', icon: MousePointer, description: 'Bouton avec lien' },
  { type: 'card', label: 'Carte', icon: CreditCard, description: 'Carte avec image et texte' },
  { type: 'image', label: 'Image', icon: ImageIcon, description: 'Image pleine largeur' },
  { type: 'html', label: 'HTML libre', icon: Code, description: 'Code HTML personnalisé' },
];

const DEFAULT_CONTENT: Record<string, string> = {
  title: 'Nouveau titre',
  text: 'Votre texte ici...',
  button: 'Cliquez ici|#',
  card: 'Titre de la carte',
  image: '',
  html: '<p>Votre HTML ici</p>',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BLOCK_ICONS: Record<string, any> = {
  title: Type,
  text: AlignLeft,
  button: MousePointer,
  card: CreditCard,
  image: ImageIcon,
  html: Code,
};

function blockContentPreview(block: ContentBlock): string {
  if (!block.content) return '(vide)';
  if (block.blockType === 'image') {
    try {
      const meta = block.metadata ? JSON.parse(block.metadata) : {};
      return meta.imageUrl ? meta.imageUrl.split('/').pop() || 'image' : '(pas d\'image)';
    } catch { return '(image)'; }
  }
  return block.content.replace(/<[^>]*>/g, '').slice(0, 80) + (block.content.length > 80 ? '…' : '');
}

// Sortable block card component
function SortableBlockCard({
  block,
  onEdit,
  onToggle,
  onDelete,
}: {
  block: ContentBlock;
  onEdit: (b: ContentBlock) => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = BLOCK_ICONS[block.blockType] || AlignLeft;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-xl shadow-sm flex items-start gap-3 p-4 group transition-all ${
        isDragging ? 'shadow-xl ring-2 ring-primary/40' : 'hover:shadow-md hover:border-primary/30'
      } ${!block.isVisible ? 'opacity-60' : ''}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0"
        title="Glisser pour réordonner"
      >
        <GripVertical size={20} />
      </button>

      {/* Type badge + preview */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            <Icon size={11} />
            {block.blockType}
          </span>
          {!block.isVisible && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 font-medium">
              masqué
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 truncate">{blockContentPreview(block)}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(block)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
          title="Éditer"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => onToggle(block.id)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
          title={block.isVisible ? 'Masquer' : 'Afficher'}
        >
          {block.isVisible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
        <button
          onClick={() => onDelete(block.id)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Supprimer"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

// Edit modal
function EditModal({
  block,
  onSave,
  onClose,
  saving,
}: {
  block: ContentBlock;
  onSave: (content: string, metadata: Record<string, string>) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [content, setContent] = useState(block.content);
  const [meta, setMeta] = useState<Record<string, string>>(() => {
    try { return block.metadata ? JSON.parse(block.metadata) : {}; }
    catch { return {}; }
  });

  const setMetaField = (key: string, val: string) =>
    setMeta((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-gray-900 text-lg">
            Éditer le bloc — <span className="text-primary capitalize">{block.blockType}</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Content field */}
          {block.blockType !== 'image' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {block.blockType === 'button' ? 'Texte du bouton' : 'Contenu'}
              </label>
              <textarea
                className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                rows={block.blockType === 'html' ? 6 : block.blockType === 'text' ? 4 : 2}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          )}

          {/* Button: link */}
          {block.blockType === 'button' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lien (URL)</label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                placeholder="/prendre-rendez-vous"
                value={meta.link || ''}
                onChange={(e) => setMetaField('link', e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Note : le contenu du bouton peut aussi utiliser le format &quot;Texte|/lien&quot;
              </p>
            </div>
          )}

          {/* Card: subtitle + imageUrl */}
          {block.blockType === 'card' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sous-titre / description</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  rows={3}
                  value={meta.description || ''}
                  onChange={(e) => setMetaField('description', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de l&apos;image (optionnel)</label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  placeholder="https://..."
                  value={meta.imageUrl || ''}
                  onChange={(e) => setMetaField('imageUrl', e.target.value)}
                />
              </div>
            </>
          )}

          {/* Image: imageUrl + alt */}
          {block.blockType === 'image' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de l&apos;image</label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  placeholder="https://..."
                  value={meta.imageUrl || ''}
                  onChange={(e) => setMetaField('imageUrl', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texte alternatif</label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  placeholder="Description de l'image"
                  value={meta.alt || ''}
                  onChange={(e) => setMetaField('alt', e.target.value)}
                />
              </div>
              <a
                href="/admin/mediatheque"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink size={14} />
                Ouvrir la médiathèque pour copier une URL
              </a>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onSave(content, meta)}
            disabled={saving}
            className="px-5 py-2 text-sm rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? (
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
            ) : (
              <Check size={15} />
            )}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Shared FAQ types ──────────────────────────────────────────────────────────

interface FAQCategory {
  id: number;
  name: string;
  slug: string;
}

// ── Add Category Modal ────────────────────────────────────────────────────────

function AddCategoryModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (cat: FAQCategory) => void;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    );
  };

  const save = async () => {
    if (!name.trim() || !slug.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, description, imageUrl, order: 0, isVisible: true }),
      });
      if (res.ok) {
        const created = await res.json();
        onCreated(created);
      } else {
        const e = await res.json();
        alert(e.error || 'Erreur lors de la création');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-gray-900 text-lg">Nouvelle catégorie</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              placeholder="Ex : Remboursements"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              placeholder="remboursements"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400">(optionnel)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              placeholder="Courte description de la catégorie…"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image <span className="text-gray-400">(optionnel)</span></label>
            <div className="flex gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                placeholder="https://…"
              />
              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="flex-shrink-0 inline-flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 hover:text-primary hover:border-primary/40 transition-colors"
                title="Choisir depuis la médiathèque"
              >
                <ImageIcon size={15} />
                Médiathèque
              </button>
            </div>
            {imageUrl && (
              <img src={imageUrl} alt="aperçu" className="mt-2 w-20 h-20 object-cover rounded-lg border border-gray-200" />
            )}
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={save}
            disabled={saving || !name.trim()}
            className="px-5 py-2 text-sm rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {saving
              ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
              : <Check size={15} />}
            Créer la catégorie
          </button>
        </div>
      </div>
      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(url) => { setImageUrl(url); setShowMediaPicker(false); }}
        currentMedia={imageUrl}
        mediaType="image"
      />
    </div>
  );
}

// ── FAQ Panel ────────────────────────────────────────────────────────────────

interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
  isVisible: boolean;
  category: string | null;
  categoryId: number | null;
  faqCategory?: { id: number; name: string };
}

function FAQPanel() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [form, setForm] = useState({
    question: '',
    answer: '',
    order: 0,
    isVisible: true,
    category: '',
    categoryId: null as number | null,
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/faqs').then((r) => r.json()),
      fetch('/api/admin/categories').then((r) => r.json()),
    ]).then(([f, c]) => {
      setFaqs(Array.isArray(f) ? f : []);
      setCategories(Array.isArray(c) ? c : []);
      setLoading(false);
    });
  }, []);

  const reloadCategories = () =>
    fetch('/api/admin/categories').then((r) => r.json()).then((c) => setCategories(Array.isArray(c) ? c : []));

  const openCreate = () => {
    setIsCreating(true);
    setEditingFAQ(null);
    setForm({ question: '', answer: '', order: faqs.length, isVisible: true, category: '', categoryId: null });
  };

  const openEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    setIsCreating(false);
    setForm({ question: faq.question, answer: faq.answer, order: faq.order, isVisible: faq.isVisible, category: faq.category || '', categoryId: faq.categoryId });
  };

  const cancelForm = () => { setEditingFAQ(null); setIsCreating(false); };

  const reload = () =>
    fetch('/api/admin/faqs').then((r) => r.json()).then((f) => setFaqs(Array.isArray(f) ? f : []));

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) return alert('Question et réponse sont obligatoires');
    const method = editingFAQ ? 'PUT' : 'POST';
    const body = editingFAQ ? { id: editingFAQ.id, ...form } : form;
    const res = await fetch('/api/admin/faqs', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) { cancelForm(); reload(); }
    else { const e = await res.json(); alert(e.error || 'Erreur'); }
  };

  const deleteFAQ = async (id: number) => {
    if (!confirm('Supprimer cette FAQ ?')) return;
    await fetch(`/api/admin/faqs?id=${id}`, { method: 'DELETE' });
    reload();
  };

  const toggleVisibility = async (faq: FAQ) => {
    await fetch('/api/admin/faqs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: faq.id, question: faq.question, answer: faq.answer, order: faq.order, isVisible: !faq.isVisible, category: faq.category }),
    });
    reload();
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-400">
      <div className="animate-spin w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full mr-3" />
      Chargement…
    </div>
  );

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto">
      <div className="flex justify-end mb-5">
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus size={16} />
          Nouvelle FAQ
        </button>
      </div>

      {/* FAQ Form Modal */}
      {(isCreating || editingFAQ) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
              <h2 className="font-bold text-gray-900 text-lg">
                {editingFAQ ? 'Modifier la FAQ' : 'Nouvelle FAQ'}
              </h2>
              <button onClick={cancelForm} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                <input
                  type="text"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  autoFocus
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  placeholder="Quelle est votre question ?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Réponse *</label>
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  rows={6}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  placeholder="La réponse..."
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordre</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    value={form.categoryId ?? ''}
                    onChange={(e) => {
                      if (e.target.value === '__new__') {
                        setShowAddCategoryModal(true);
                        return;
                      }
                      setForm({
                        ...form,
                        categoryId: e.target.value ? parseInt(e.target.value) : null,
                        category: e.target.value ? categories.find((c) => c.id === parseInt(e.target.value))?.name || '' : '',
                      });
                    }}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="">-- Aucune --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                    <option value="__new__">＋ Ajouter une catégorie…</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visible</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isVisible}
                      onChange={(e) => setForm({ ...form, isVisible: e.target.checked })}
                      className="w-4 h-4 rounded accent-primary"
                    />
                    <span className="text-sm text-gray-600">Afficher</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={cancelForm}
                className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={save}
                className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                <Check size={15} /> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ list */}
      {faqs.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">❓</div>
          <p className="text-gray-500 font-medium">Aucune FAQ pour le moment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className={`bg-white border border-gray-200 rounded-xl p-5 group transition-all hover:shadow-md ${!faq.isVisible ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">#{faq.order}</span>
                    {faq.faqCategory && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{faq.faqCategory.name}</span>
                    )}
                    {!faq.isVisible && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">masquée</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{faq.question}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(faq)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Modifier"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => toggleVisibility(faq)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                    title={faq.isVisible ? 'Masquer' : 'Afficher'}
                  >
                    {faq.isVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button
                    onClick={() => deleteFAQ(faq.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddCategoryModal && (
        <AddCategoryModal
          onClose={() => setShowAddCategoryModal(false)}
          onCreated={(newCat) => {
            setCategories((prev) => [...prev, newCat]);
            setForm((prev) => ({ ...prev, categoryId: newCat.id, category: newCat.name }));
            setShowAddCategoryModal(false);
            reloadCategories();
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// Add block modal
function AddBlockModal({
  onAdd,
  onClose,
  saving,
}: {
  onAdd: (type: string) => void;
  onClose: () => void;
  saving: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-gray-900 text-lg">Ajouter un bloc</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-3">
          {BLOCK_TYPES.map(({ type, label, icon: Icon, description }) => (
            <button
              key={type}
              onClick={() => onAdd(type)}
              disabled={saving}
              className="flex flex-col items-start gap-2 p-4 border rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left disabled:opacity-60"
            >
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Icon size={18} />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900">{label}</div>
                <div className="text-xs text-gray-500">{description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EditeurVisuelPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [pages, setPages] = useState<Page[]>(PREDEFINED_PAGES);
  const [activePage, setActivePage] = useState<Page>(PREDEFINED_PAGES[0]);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showAddBlock, setShowAddBlock] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);

  const [showAddPage, setShowAddPage] = useState(false);
  const [newPageKey, setNewPageKey] = useState('');
  const [newPageLabel, setNewPageLabel] = useState('');

  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  // Discover custom pages
  useEffect(() => {
    fetch('/api/admin/blocks')
      .then((r) => r.json())
      .then((all: ContentBlock[]) => {
        const predefinedKeys = new Set(PREDEFINED_PAGES.map((p) => p.key));
        const customKeys = [...new Set(all.map((b) => b.pageKey))].filter(
          (k) => !predefinedKeys.has(k)
        );
        if (customKeys.length > 0) {
          const customPages: Page[] = customKeys.map((k) => ({
            key: k,
            label: k.charAt(0).toUpperCase() + k.slice(1).replace(/-/g, ' '),
            icon: '📄',
            path: `/${k}`,
          }));
          setPages([...PREDEFINED_PAGES, ...customPages]);
        }
      })
      .catch(() => {});
  }, []);

  const loadBlocks = useCallback(async (pageKey: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blocks?pageKey=${pageKey}`);
      const data = await res.json();
      setBlocks(Array.isArray(data) ? data : []);
    } catch {
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') loadBlocks(activePage.key);
  }, [status, activePage, loadBlocks]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  // Drag & drop reorder
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    const reordered = arrayMove(blocks, oldIndex, newIndex);
    setBlocks(reordered);

    // Persist new order
    await Promise.all(
      reordered.map((block, index) =>
        fetch('/api/admin/blocks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: block.id, order: index }),
        })
      )
    );
    showToast('success', 'Ordre mis à jour');
  };

  const handleAddBlock = async (blockType: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageKey: activePage.key,
          blockKey: `${blockType}-${Date.now()}`,
          blockType,
          content: DEFAULT_CONTENT[blockType] ?? '',
          order: blocks.length,
          isVisible: true,
        }),
      });
      if (res.ok) {
        await loadBlocks(activePage.key);
        setShowAddBlock(false);
        showToast('success', 'Bloc ajouté');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (content: string, metadata: Record<string, string>) => {
    if (!editingBlock) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/blocks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingBlock.id,
          content,
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        }),
      });
      if (res.ok) {
        await loadBlocks(activePage.key);
        setEditingBlock(null);
        showToast('success', 'Bloc mis à jour');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (blockId: number) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    await fetch('/api/admin/blocks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: blockId, isVisible: !block.isVisible }),
    });
    await loadBlocks(activePage.key);
  };

  const handleDelete = async (blockId: number) => {
    if (!confirm('Supprimer ce bloc définitivement ?')) return;
    await fetch(`/api/admin/blocks?id=${blockId}`, { method: 'DELETE' });
    await loadBlocks(activePage.key);
    showToast('success', 'Bloc supprimé');
  };

  const handleAddPage = () => {
    const key = newPageKey.trim().toLowerCase().replace(/\s+/g, '-');
    const label = newPageLabel.trim() || key;
    if (!key) return;
    const alreadyExists = pages.some((p) => p.key === key);
    if (alreadyExists) {
      showToast('error', 'Cette page existe déjà');
      return;
    }
    const newPage: Page = { key, label, icon: '📄', path: `/${key}` };
    setPages((prev) => [...prev, newPage]);
    setActivePage(newPage);
    setNewPageKey('');
    setNewPageLabel('');
    setShowAddPage(false);
    showToast('success', `Page "${label}" créée`);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader currentPage="editeur-visuel" title="✨ Éditeur Visuel" />

      <div className="flex h-[calc(100vh-73px)]">
        {/* ── Sidebar gauche ── */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pages</h2>
          </div>
          <nav className="flex-1 overflow-y-auto py-2">
            {pages.map((page) => (
              <button
                key={page.key}
                onClick={() => setActivePage(page)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                  activePage.key === page.key
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-base">{page.icon}</span>
                <span className="flex-1 truncate">{page.label}</span>
                {activePage.key === page.key && <ChevronRight size={14} className="text-primary" />}
              </button>
            ))}
          </nav>

          {/* Add page */}
          <div className="border-t border-gray-100 p-3">
            {showAddPage ? (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Nom de la page"
                  value={newPageLabel}
                  onChange={(e) => setNewPageLabel(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <input
                  type="text"
                  placeholder="Clé URL (ex: promo-ete)"
                  value={newPageKey}
                  onChange={(e) => setNewPageKey(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPage()}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddPage}
                    className="flex-1 bg-primary text-white text-xs rounded-lg py-1.5 font-semibold hover:bg-primary-dark transition-colors"
                  >
                    Créer
                  </button>
                  <button
                    onClick={() => { setShowAddPage(false); setNewPageKey(''); setNewPageLabel(''); }}
                    className="flex-1 border border-gray-200 text-gray-600 text-xs rounded-lg py-1.5 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddPage(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                <Plus size={14} />
                Nouvelle page
              </button>
            )}
          </div>
        </aside>

        {/* ── Canvas principal ── */}
        <main className="flex-1 overflow-y-auto">
          {/* Canvas header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {activePage.icon} {activePage.label}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {activePage.key === 'faq'
                  ? 'Questions / Réponses'
                  : `${blocks.length} bloc${blocks.length !== 1 ? 's' : ''} — drag pour réordonner`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={activePage.path}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary border border-gray-200 rounded-lg px-3 py-1.5 hover:border-primary/40 transition-colors"
              >
                <ExternalLink size={14} />
                Voir la page
              </Link>
              {activePage.key !== 'faq' && (
                <button
                  onClick={() => setShowAddBlock(true)}
                  className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
                >
                  <Plus size={16} />
                  Ajouter un bloc
                </button>
              )}
            </div>
          </div>

          {/* Page-specific panel or block canvas */}
          {activePage.key === 'home' ? (
            <HomePanel />
          ) : activePage.key === 'faq' ? (
            <FAQPanel />
          ) : (
          <div className="px-6 py-6 max-w-2xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-gray-400">
                <div className="animate-spin w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full mr-3" />
                Chargement…
              </div>
            ) : blocks.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-gray-500 font-medium mb-2">Aucun bloc sur cette page</p>
                <p className="text-gray-400 text-sm mb-6">
                  Ajoutez votre premier bloc pour commencer à construire cette page.
                </p>
                <button
                  onClick={() => setShowAddBlock(true)}
                  className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-colors"
                >
                  <Plus size={16} />
                  Ajouter un bloc
                </button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={blocks.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {blocks.map((block) => (
                      <SortableBlockCard
                        key={block.id}
                        block={block}
                        onEdit={setEditingBlock}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {blocks.length > 0 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowAddBlock(true)}
                  className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary border border-dashed border-gray-300 hover:border-primary/40 rounded-xl px-5 py-3 transition-colors"
                >
                  <Plus size={15} />
                  Ajouter un bloc
                </button>
              </div>
            )}
          </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showAddBlock && (
        <AddBlockModal
          onAdd={handleAddBlock}
          onClose={() => setShowAddBlock(false)}
          saving={saving}
        />
      )}
      {editingBlock && (
        <EditModal
          block={editingBlock}
          onSave={handleSaveEdit}
          onClose={() => setEditingBlock(null)}
          saving={saving}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.type === 'success' ? '✓ ' : '✗ '}{toast.text}
        </div>
      )}
    </div>
  );
}
