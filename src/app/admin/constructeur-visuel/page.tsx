'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';
import VisualPageBuilder from '@/components/VisualPageBuilder';
import {
  Plus, X, Save, Image, Type, AlignLeft, MousePointer, CreditCard, Code,
} from 'lucide-react';

type ContentBlock = {
  id: number;
  pageKey: string;
  blockKey: string;
  blockType: string;
  content: string;
  metadata: string | null;
  order: number;
  isVisible: boolean;
  updatedAt: string;
};

const BLOCK_TYPES = [
  { type: 'title',  label: 'Titre',      icon: Type,          description: 'Titre H2 en grand' },
  { type: 'text',   label: 'Texte',      icon: AlignLeft,     description: 'Paragraphe de texte' },
  { type: 'button', label: 'Bouton',     icon: MousePointer,  description: 'Bouton avec lien' },
  { type: 'card',   label: 'Carte',      icon: CreditCard,    description: 'Carte avec image et texte' },
  { type: 'image',  label: 'Image',      icon: Image,         description: 'Image pleine largeur' },
  { type: 'html',   label: 'HTML libre', icon: Code,          description: 'Code HTML personnalisé' },
];

const PREDEFINED_PAGES = [
  { key: 'home',            label: 'Accueil',         icon: '🏠' },
  { key: 'solutions',       label: 'Solutions',       icon: '🎯' },
  { key: 'remboursements',  label: 'Remboursements',  icon: '💶' },
  { key: 'accompagnement',  label: 'Accompagnement',  icon: '🤝' },
  { key: 'test-auditif',    label: 'Test Auditif',    icon: '🦻' },
  { key: 'contact',         label: 'Contact',         icon: '📬' },
  { key: 'faq',             label: 'FAQ',             icon: '❓' },
  { key: 'partenaires',     label: 'Partenaires',     icon: '🤲' },
];

const DEFAULT_CONTENT: Record<string, string> = {
  title:  'Nouveau titre',
  text:   'Votre texte ici...',
  button: 'Cliquez ici|#',
  card:   'Titre de la carte',
  image:  '',
  html:   '<p>Votre HTML ici</p>',
};

export default function ConstructeurVisuelPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activePage, setActivePage] = useState('home');
  const [customPages, setCustomPages] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editMetadata, setEditMetadata] = useState<Record<string, string>>({});
  const [showAddPage, setShowAddPage] = useState(false);
  const [newPageKey, setNewPageKey] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  // Discover custom pages from existing ContentBlocks
  useEffect(() => {
    fetch('/api/admin/blocks')
      .then(r => r.json())
      .then((all: ContentBlock[]) => {
        const predefinedKeys = new Set(PREDEFINED_PAGES.map(p => p.key));
        const custom = [...new Set(all.map(b => b.pageKey))].filter(k => !predefinedKeys.has(k));
        setCustomPages(custom);
      })
      .catch(() => {});
  }, []);

  const loadBlocks = useCallback(async (pageKey: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blocks?pageKey=${pageKey}`);
      setBlocks(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlocks(activePage);
  }, [activePage, loadBlocks]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddBlock = async (blockType: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageKey: activePage,
          blockKey: `${blockType}-${Date.now()}`,
          blockType,
          content: DEFAULT_CONTENT[blockType] ?? '',
          order: blocks.length,
          isVisible: true,
        }),
      });
      if (res.ok) {
        await loadBlocks(activePage);
        setShowAddBlock(false);
        showToast('success', 'Bloc ajouté');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (block: ContentBlock) => {
    setEditingBlock(block);
    setEditContent(block.content);
    try {
      setEditMetadata(block.metadata ? JSON.parse(block.metadata) : {});
    } catch {
      setEditMetadata({});
    }
  };

  const handleSaveEdit = async () => {
    if (!editingBlock) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/blocks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingBlock.id,
          content: editContent,
          metadata: Object.keys(editMetadata).length > 0 ? editMetadata : undefined,
        }),
      });
      if (res.ok) {
        await loadBlocks(activePage);
        setEditingBlock(null);
        showToast('success', 'Bloc mis à jour');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (blockId: number) => {
    if (!confirm('Supprimer ce bloc définitivement ?')) return;
    await fetch(`/api/admin/blocks?id=${blockId}`, { method: 'DELETE' });
    await loadBlocks(activePage);
    showToast('success', 'Bloc supprimé');
  };

  const handleToggleVisibility = async (blockId: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    await fetch('/api/admin/blocks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: blockId, isVisible: !block.isVisible }),
    });
    await loadBlocks(activePage);
  };

  const handleReorder = async (reordered: ContentBlock[]) => {
    await Promise.all(
      reordered.map(block =>
        fetch('/api/admin/blocks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: block.id, order: block.order }),
        })
      )
    );
    showToast('success', 'Ordre sauvegardé');
  };

  const handleAddPage = () => {
    const key = newPageKey.trim();
    if (!key) return;
    setCustomPages(prev => [...prev, key]);
    setActivePage(key);
    setShowAddPage(false);
    setNewPageKey('');
  };

  const getPageMeta = (key: string) => {
    return PREDEFINED_PAGES.find(p => p.key === key) ?? { key, label: key, icon: '📄' };
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!session) return null;

  const allPages = [
    ...PREDEFINED_PAGES,
    ...customPages.map(k => ({ key: k, label: k, icon: '📄' })),
  ];

  const activeMeta = getPageMeta(activePage);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader currentPage="constructeur-visuel" title="🏗️ Constructeur de Pages" />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-20 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.type === 'success' ? '✅' : '❌'} {toast.text}
        </div>
      )}

      <div className="flex" style={{ height: 'calc(100vh - 80px)' }}>

        {/* ── Sidebar ── */}
        <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pages</span>
              <button
                onClick={() => setShowAddPage(true)}
                className="p-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                title="Nouvelle page"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-gray-400">Cliquez pour éditer</p>
          </div>

          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {allPages.map(page => (
              <button
                key={page.key}
                onClick={() => setActivePage(page.key)}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-all text-sm ${
                  activePage === page.key
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span>{page.icon}</span>
                <span className="flex-1 truncate">{page.label}</span>
                {activePage === page.key && (
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0" />
                )}
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-gray-100 bg-gray-50 text-[11px] text-gray-500 space-y-0.5">
            <p>Page : <span className="font-medium text-gray-700">{activeMeta.label}</span></p>
            <p>{blocks.length} bloc{blocks.length !== 1 ? 's' : ''}</p>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 overflow-y-auto flex flex-col">

          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <span className="text-xl">{activeMeta.icon}</span>
              <div>
                <h2 className="font-bold text-gray-900 text-sm leading-tight">{activeMeta.label}</h2>
                <p className="text-[11px] text-gray-400">/{activePage === 'home' ? '' : activePage}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`/${activePage === 'home' ? '' : activePage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                👁️ Voir la page
              </a>
              <button
                onClick={() => setShowAddBlock(true)}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter un bloc
              </button>
            </div>
          </div>

          {/* Blocks canvas */}
          <div className="flex-1 p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm">Chargement…</p>
              </div>
            ) : (
              <VisualPageBuilder
                blocks={blocks}
                onReorder={handleReorder}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleVisibility={handleToggleVisibility}
              />
            )}
          </div>
        </main>
      </div>

      {/* ── Add Block Panel (bottom sheet) ── */}
      {showAddBlock && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
          onClick={() => setShowAddBlock(false)}
        >
          <div
            className="bg-white rounded-t-2xl w-full max-w-xl p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-base text-gray-900">Quel type de bloc ?</h3>
              <button onClick={() => setShowAddBlock(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {BLOCK_TYPES.map(bt => {
                const Icon = bt.icon;
                return (
                  <button
                    key={bt.type}
                    onClick={() => handleAddBlock(bt.type)}
                    disabled={saving}
                    className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group disabled:opacity-50"
                  >
                    <div className="w-9 h-9 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-xs text-gray-800">{bt.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{bt.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Block Modal ── */}
      {editingBlock && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="font-bold text-base text-gray-900">
                Éditer — <span className="text-blue-600">{editingBlock.blockType}</span>
              </h3>
              <button onClick={() => setEditingBlock(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {editingBlock.blockType === 'title' && (
                <label className="block">
                  <span className="text-xs font-medium text-gray-700">Titre</span>
                  <input
                    type="text"
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              )}

              {editingBlock.blockType === 'text' && (
                <label className="block">
                  <span className="text-xs font-medium text-gray-700">Texte</span>
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    rows={7}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </label>
              )}

              {editingBlock.blockType === 'button' && (
                <>
                  <label className="block">
                    <span className="text-xs font-medium text-gray-700">Texte du bouton</span>
                    <input
                      type="text"
                      value={editContent.split('|')[0] ?? ''}
                      onChange={e => setEditContent(`${e.target.value}|${editContent.split('|')[1] ?? '#'}`)}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-gray-700">Lien (URL)</span>
                    <input
                      type="text"
                      value={editContent.split('|')[1] ?? ''}
                      onChange={e => setEditContent(`${editContent.split('|')[0] ?? ''}|${e.target.value}`)}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="/contact"
                    />
                  </label>
                </>
              )}

              {editingBlock.blockType === 'card' && (
                <>
                  <label className="block">
                    <span className="text-xs font-medium text-gray-700">Titre</span>
                    <input
                      type="text"
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-gray-700">Description</span>
                    <textarea
                      value={editMetadata.description ?? ''}
                      onChange={e => setEditMetadata(m => ({ ...m, description: e.target.value }))}
                      rows={3}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-gray-700">Icône (emoji)</span>
                    <input
                      type="text"
                      value={editMetadata.icon ?? ''}
                      onChange={e => setEditMetadata(m => ({ ...m, icon: e.target.value }))}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="🎯"
                    />
                  </label>
                </>
              )}

              {editingBlock.blockType === 'image' && (
                <label className="block">
                  <span className="text-xs font-medium text-gray-700">URL de l'image</span>
                  <input
                    type="text"
                    value={editMetadata.imageUrl ?? editContent}
                    onChange={e => {
                      setEditMetadata(m => ({ ...m, imageUrl: e.target.value }));
                      setEditContent(e.target.value);
                    }}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Copiez une URL depuis la{' '}
                    <a href="/admin/mediatheque" target="_blank" className="text-blue-600 underline">
                      Médiathèque
                    </a>
                  </p>
                </label>
              )}

              {editingBlock.blockType === 'html' && (
                <label className="block">
                  <span className="text-xs font-medium text-gray-700">HTML</span>
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    rows={9}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </label>
              )}

              <p className="text-[11px] text-gray-400">
                Clé : <code className="bg-gray-100 px-1 py-0.5 rounded">{editingBlock.blockKey}</code>
              </p>
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setEditingBlock(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Page Modal ── */}
      {showAddPage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="font-bold text-base text-gray-900 mb-4">Nouvelle page</h3>
            <label className="block mb-4">
              <span className="text-xs font-medium text-gray-700">URL de la page</span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm text-gray-400">/</span>
                <input
                  type="text"
                  value={newPageKey}
                  onChange={e =>
                    setNewPageKey(
                      e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9-]/g, '')
                    )
                  }
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ma-nouvelle-page"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleAddPage()}
                />
              </div>
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddPage(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleAddPage}
                disabled={!newPageKey.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold disabled:opacity-50"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
