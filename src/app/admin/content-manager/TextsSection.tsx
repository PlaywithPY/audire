'use client';

import { useEffect, useState } from 'react';

type PageText = {
  id: number;
  pageKey: string;
  textKey: string;
  content: string;
  label: string | null;
  updatedAt: string;
};

type PageDefinition = {
  pageKey: string;
  pageLabel: string;
  texts: {
    textKey: string;
    label: string;
    defaultContent: string;
    type?: 'text' | 'textarea';
    rows?: number;
  }[];
};

const pageDefinitions: PageDefinition[] = [
  {
    pageKey: 'home',
    pageLabel: '🏠 Accueil',
    texts: [
      { textKey: 'hero-title', label: 'Titre principal', defaultContent: 'Mieux entendre, simplement.', type: 'text' },
      { textKey: 'description-1', label: 'Description hero', defaultContent: 'Chez Audire...', type: 'textarea', rows: 3 },
    ]
  },
  {
    pageKey: 'solutions-auditives',
    pageLabel: '🎧 Solutions Auditives',
    texts: [
      { textKey: 'hero-title', label: 'Titre principal', defaultContent: 'Solutions auditives', type: 'text' },
      { textKey: 'description-1', label: 'Description', defaultContent: 'Chez Audire...', type: 'textarea', rows: 3 },
    ]
  },
  {
    pageKey: 'faq',
    pageLabel: '❓ FAQ',
    texts: [
      { textKey: 'hero-title', label: 'Titre principal', defaultContent: 'Questions fréquentes', type: 'text' },
      { textKey: 'description-1', label: 'Description', defaultContent: 'Vous vous posez des questions...', type: 'textarea', rows: 3 },
    ]
  },
];

export default function TextsSection() {
  const [pageTexts, setPageTexts] = useState<PageText[]>([]);
  const [editingText, setEditingText] = useState<PageText | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPage, setSelectedPage] = useState<string>('home');

  useEffect(() => {
    fetchPageTexts();
  }, []);

  async function fetchPageTexts() {
    try {
      const res = await fetch('/api/admin/page-texts');
      if (!res.ok) {
        setPageTexts([]);
        return;
      }
      const data = await res.json();
      setPageTexts(data);
    } catch (error) {
      console.error('Error fetching page texts:', error);
      setPageTexts([]);
    } finally {
      setLoading(false);
    }
  }

  async function saveText(text: PageText) {
    setSaving(true);
    try {
      await fetch('/api/admin/page-texts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(text),
      });
      await fetchPageTexts();
      setEditingText(null);
    } catch (error) {
      console.error('Error saving text:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  async function createText(pageKey: string, textKey: string, defaultData: any) {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/page-texts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageKey,
          textKey,
          content: defaultData.defaultContent,
          label: defaultData.label,
        }),
      });
      if (res.ok) {
        await fetchPageTexts();
      }
    } catch (error) {
      console.error('Error creating text:', error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-gray-600">Chargement des textes...</p>
      </div>
    );
  }

  const activePage = pageDefinitions.find(p => p.pageKey === selectedPage);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📝 Gestion des Textes</h2>

      {/* Page selector */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <label className="block text-sm font-semibold mb-2">Sélectionner une page:</label>
        <div className="flex gap-2 flex-wrap">
          {pageDefinitions.map((page) => (
            <button
              key={page.pageKey}
              onClick={() => setSelectedPage(page.pageKey)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPage === page.pageKey
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page.pageLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Texts list */}
      <div className="space-y-4">
        {activePage?.texts.map((textDef) => {
          const existing = pageTexts.find(
            t => t.pageKey === selectedPage && t.textKey === textDef.textKey
          );

          return (
            <div key={textDef.textKey} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{textDef.label}</h3>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{textDef.textKey}</code>
                </div>
              </div>

              {existing ? (
                <>
                  <div className="mb-3 p-3 bg-gray-50 rounded text-sm">
                    {existing.content.length > 200
                      ? existing.content.substring(0, 200) + '...'
                      : existing.content || <span className="text-gray-400 italic">{textDef.defaultContent}</span>}
                  </div>
                  <button
                    onClick={() => setEditingText({
                      ...existing,
                      content: existing.content || textDef.defaultContent
                    })}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    ✏️ Modifier
                  </button>
                </>
              ) : (
                <button
                  onClick={() => createText(selectedPage, textDef.textKey, textDef)}
                  disabled={saving}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  ➕ Créer
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingText && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">✏️ Modifier le texte</h2>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2 text-sm">
                  {editingText.label || editingText.textKey}
                </label>
                <textarea
                  value={editingText.content}
                  onChange={(e) => setEditingText({ ...editingText, content: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                  rows={8}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => saveText(editingText)}
                  disabled={saving}
                  className="flex-1 bg-primary text-white px-4 py-2 rounded font-semibold"
                >
                  {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
                </button>
                <button
                  onClick={() => setEditingText(null)}
                  className="flex-1 bg-gray-200 px-4 py-2 rounded"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link to full page */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-sm text-blue-800 mb-2">
          Pour voir toutes les pages et tous les textes disponibles
        </p>
        <a
          href="/admin/text-editor"
          target="_blank"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Ouvrir la page complète →
        </a>
      </div>
    </div>
  );
}
