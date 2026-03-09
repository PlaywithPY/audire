'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

const blockTypes = [
  { value: 'title', label: '📝 Titre', icon: 'H1' },
  { value: 'text', label: '📄 Texte', icon: 'T' },
  { value: 'html', label: '🔧 HTML', icon: '</>' },
  { value: 'image', label: '🖼️ Image', icon: '🖼️' },
  { value: 'button', label: '🔘 Bouton', icon: 'BTN' },
];

const pages = [
  { key: 'home', label: '🏠 Accueil' },
  { key: 'contact', label: '📞 Contact' },
  { key: 'faq', label: '❓ FAQ' },
  { key: 'solutions-auditives', label: '👂 Solutions auditives' },
  { key: 'test-auditif-gratuit', label: '🔊 Test auditif gratuit' },
  { key: 'notre-accompagnement', label: '🤝 Notre accompagnement' },
  { key: 'remboursements', label: '💶 Remboursements' },
  { key: 'partenaires-pharmaciens', label: '💊 Partenaires pharmaciens' },
];

export default function ContentEditor() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [selectedPage, setSelectedPage] = useState('home');
  const [loading, setLoading] = useState(true);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [showNewBlockForm, setShowNewBlockForm] = useState(false);

  // Nouveau bloc vide
  const [newBlock, setNewBlock] = useState({
    pageKey: 'home',
    blockKey: '',
    blockType: 'text',
    content: '',
    order: 0,
    isVisible: true,
  });

  useEffect(() => {
    fetchBlocks();
  }, [selectedPage]);

  async function fetchBlocks() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blocks?pageKey=${selectedPage}`);
      const data = await res.json();
      setBlocks(data);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveBlock(block: ContentBlock) {
    try {
      await fetch('/api/admin/blocks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(block),
      });
      alert('✅ Bloc sauvegardé !');
      setEditingBlock(null);
      fetchBlocks();
    } catch (error) {
      console.error('Error saving block:', error);
      alert('❌ Erreur lors de la sauvegarde');
    }
  }

  async function createBlock() {
    if (!newBlock.blockKey) {
      alert('⚠️ Le blockKey est obligatoire !');
      return;
    }

    try {
      await fetch('/api/admin/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newBlock, pageKey: selectedPage }),
      });
      alert('✅ Bloc créé !');
      setShowNewBlockForm(false);
      setNewBlock({
        pageKey: selectedPage,
        blockKey: '',
        blockType: 'text',
        content: '',
        order: 0,
        isVisible: true,
      });
      fetchBlocks();
    } catch (error) {
      console.error('Error creating block:', error);
      alert('❌ Erreur lors de la création');
    }
  }

  async function deleteBlock(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce bloc ?')) return;

    try {
      await fetch(`/api/admin/blocks?id=${id}`, {
        method: 'DELETE',
      });
      alert('✅ Bloc supprimé !');
      fetchBlocks();
    } catch (error) {
      console.error('Error deleting block:', error);
      alert('❌ Erreur lors de la suppression');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🖊️ Éditeur de contenu WYSIWYG</h1>
          <div className="flex gap-2">
            <Link
              href="/admin"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
            >
              ← Dashboard
            </Link>
            <Link
              href="/"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Voir le site
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Sélecteur de page */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">📄 Sélectionnez une page</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {pages.map((page) => (
              <button
                key={page.key}
                onClick={() => setSelectedPage(page.key)}
                className={`px-4 py-3 rounded font-semibold transition ${
                  selectedPage === page.key
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {page.label}
              </button>
            ))}
          </div>
        </section>

        {/* Liste des blocs */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              🧱 Blocs de contenu - {pages.find((p) => p.key === selectedPage)?.label}
            </h2>
            <button
              onClick={() => setShowNewBlockForm(!showNewBlockForm)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              + Nouveau bloc
            </button>
          </div>

          {/* Formulaire nouveau bloc */}
          {showNewBlockForm && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-bold mb-3">Créer un nouveau bloc</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Identifiant (blockKey)</label>
                  <input
                    type="text"
                    value={newBlock.blockKey}
                    onChange={(e) => setNewBlock({ ...newBlock, blockKey: e.target.value })}
                    placeholder="ex: hero-title"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Type de bloc</label>
                  <select
                    value={newBlock.blockType}
                    onChange={(e) => setNewBlock({ ...newBlock, blockType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  >
                    {blockTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Contenu</label>
                  <textarea
                    value={newBlock.content}
                    onChange={(e) => setNewBlock({ ...newBlock, content: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={createBlock}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  ✅ Créer
                </button>
                <button
                  onClick={() => setShowNewBlockForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Liste des blocs */}
          {loading ? (
            <p>Chargement...</p>
          ) : blocks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun bloc sur cette page. Créez-en un !
            </p>
          ) : (
            <div className="space-y-4">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  {editingBlock?.id === block.id ? (
                    // Mode édition
                    <div>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Type: {blockTypes.find((t) => t.value === block.blockType)?.label}
                          </label>
                          <select
                            value={editingBlock.blockType}
                            onChange={(e) =>
                              setEditingBlock({ ...editingBlock, blockType: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                          >
                            {blockTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editingBlock.isVisible}
                              onChange={(e) =>
                                setEditingBlock({ ...editingBlock, isVisible: e.target.checked })
                              }
                              className="w-5 h-5"
                            />
                            <span>Visible</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Contenu</label>
                        <textarea
                          value={editingBlock.content}
                          onChange={(e) =>
                            setEditingBlock({ ...editingBlock, content: e.target.value })
                          }
                          rows={5}
                          className="w-full px-3 py-2 border border-gray-300 rounded font-mono"
                        />
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => saveBlock(editingBlock)}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          💾 Sauvegarder
                        </button>
                        <button
                          onClick={() => setEditingBlock(null)}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Mode affichage
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg">
                            {blockTypes.find((t) => t.value === block.blockType)?.icon}{' '}
                            {block.blockKey}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Type: {blockTypes.find((t) => t.value === block.blockType)?.label} •
                            {block.isVisible ? ' Visible' : ' Masqué'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingBlock(block)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            onClick={() => deleteBlock(block.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {block.content.length > 200
                            ? block.content.substring(0, 200) + '...'
                            : block.content}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
