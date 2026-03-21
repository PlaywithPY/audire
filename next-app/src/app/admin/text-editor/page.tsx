'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';

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
      { textKey: 'hero-title', label: 'Titre principal', defaultContent: 'Bienvenue chez Audire', type: 'text' },
      { textKey: 'hero-subtitle', label: 'Sous-titre', defaultContent: 'Votre audition, notre priorité', type: 'text' },
      { textKey: 'hero-description', label: 'Description héro', defaultContent: 'Découvrez nos solutions auditives sur mesure', type: 'textarea', rows: 3 },
      { textKey: 'about-title', label: 'Titre À propos', defaultContent: 'À propos d\'Audire', type: 'text' },
      { textKey: 'about-description', label: 'Description À propos', defaultContent: 'Nous sommes des experts...', type: 'textarea', rows: 5 },
      { textKey: 'services-title', label: 'Titre Services', defaultContent: 'Nos Services', type: 'text' },
      { textKey: 'services-description', label: 'Description Services', defaultContent: 'Découvrez nos services...', type: 'textarea', rows: 3 },
    ]
  },
  {
    pageKey: 'about',
    pageLabel: '📖 À propos',
    texts: [
      { textKey: 'page-title', label: 'Titre de la page', defaultContent: 'À propos d\'Audire', type: 'text' },
      { textKey: 'intro', label: 'Introduction', defaultContent: 'Qui sommes-nous ?', type: 'textarea', rows: 5 },
      { textKey: 'mission-title', label: 'Titre Mission', defaultContent: 'Notre Mission', type: 'text' },
      { textKey: 'mission-description', label: 'Description Mission', defaultContent: 'Notre mission est de...', type: 'textarea', rows: 5 },
      { textKey: 'values-title', label: 'Titre Valeurs', defaultContent: 'Nos Valeurs', type: 'text' },
      { textKey: 'values-description', label: 'Description Valeurs', defaultContent: 'Nous croyons en...', type: 'textarea', rows: 5 },
    ]
  },
  {
    pageKey: 'solutions',
    pageLabel: '🎧 Solutions',
    texts: [
      { textKey: 'page-title', label: 'Titre de la page', defaultContent: 'Solutions Auditives', type: 'text' },
      { textKey: 'intro', label: 'Introduction', defaultContent: 'Découvrez nos solutions...', type: 'textarea', rows: 5 },
      { textKey: 'contour-title', label: 'Titre Contour', defaultContent: 'Le contour d\'oreille', type: 'text' },
      { textKey: 'contour-description', label: 'Description Contour', defaultContent: 'Description du contour...', type: 'textarea', rows: 5 },
      { textKey: 'intra-title', label: 'Titre Intra', defaultContent: 'L\'intra-auriculaire', type: 'text' },
      { textKey: 'intra-description', label: 'Description Intra', defaultContent: 'Description de l\'intra...', type: 'textarea', rows: 5 },
    ]
  },
  {
    pageKey: 'contact',
    pageLabel: '📞 Contact',
    texts: [
      { textKey: 'page-title', label: 'Titre de la page', defaultContent: 'Contactez-nous', type: 'text' },
      { textKey: 'intro', label: 'Introduction', defaultContent: 'N\'hésitez pas à nous contacter', type: 'textarea', rows: 3 },
      { textKey: 'address-title', label: 'Titre Adresse', defaultContent: 'Notre adresse', type: 'text' },
      { textKey: 'hours-title', label: 'Titre Horaires', defaultContent: 'Nos horaires', type: 'text' },
      { textKey: 'form-title', label: 'Titre Formulaire', defaultContent: 'Envoyez-nous un message', type: 'text' },
    ]
  },
  {
    pageKey: 'notre-accompagnement',
    pageLabel: '🤝 Notre accompagnement',
    texts: [
      { textKey: 'page-title', label: 'Titre de la page', defaultContent: 'Notre Accompagnement', type: 'text' },
      { textKey: 'intro', label: 'Introduction', defaultContent: 'Un accompagnement personnalisé', type: 'textarea', rows: 5 },
      { textKey: 'process-title', label: 'Titre Processus', defaultContent: 'Notre processus', type: 'text' },
      { textKey: 'process-description', label: 'Description Processus', defaultContent: 'Découvrez comment nous travaillons...', type: 'textarea', rows: 5 },
    ]
  }
];

export default function TextEditorAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pageTexts, setPageTexts] = useState<PageText[]>([]);
  const [editingText, setEditingText] = useState<PageText | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPageTexts();
    }
  }, [status]);

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

  async function deleteText(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce texte ?')) {
      return;
    }
    setSaving(true);
    try {
      await fetch(`/api/admin/page-texts?id=${id}`, {
        method: 'DELETE',
      });
      await fetchPageTexts();
    } catch (error) {
      console.error('Error deleting text:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-text-light">Chargement...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const activePage = pageDefinitions.find(p => p.pageKey === activeTab);
  const activeTexts = activePage?.texts || [];

  // Filtrer les textes selon la recherche
  const filteredTexts = activeTexts.filter(textDef => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      textDef.label.toLowerCase().includes(query) ||
      textDef.textKey.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminHeader currentPage="text-editor" title="📝 Éditeur de Textes" />

      <div className="container mx-auto px-6 py-8">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold mb-2">📖 Mode d'emploi</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Sélectionnez une page dans les onglets ci-dessous</li>
            <li>• Modifiez les textes directement ou créez-les s'ils n'existent pas encore</li>
            <li>• Utilisez la barre de recherche pour trouver rapidement un texte</li>
            <li>• Les modifications sont sauvegardées immédiatement</li>
          </ul>
        </div>

        {/* Onglets des pages */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {pageDefinitions.map((page) => {
              const pageTextCount = pageTexts.filter(t => t.pageKey === page.pageKey).length;
              const totalTextCount = page.texts.length;
              return (
                <button
                  key={page.pageKey}
                  onClick={() => {
                    setActiveTab(page.pageKey);
                    setSearchQuery('');
                  }}
                  className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${
                    activeTab === page.pageKey
                      ? 'border-b-2 border-primary text-primary bg-blue-50'
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  {page.pageLabel}
                  <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded-full">
                    {pageTextCount}/{totalTextCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Rechercher un texte par nom ou clé..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Liste des textes de la page active */}
        <div className="space-y-4">
          {filteredTexts.length === 0 && searchQuery && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">Aucun texte trouvé pour "{searchQuery}"</p>
            </div>
          )}

          {filteredTexts.map((textDef) => {
            const existing = pageTexts.find(
              t => t.pageKey === activeTab && t.textKey === textDef.textKey
            );

            return (
              <div key={textDef.textKey} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg text-gray-800">{textDef.label}</h3>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                      {activeTab}.{textDef.textKey}
                    </code>
                  </div>
                  {existing && (
                    <button
                      onClick={() => deleteText(existing.id)}
                      disabled={saving}
                      className="ml-4 text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                      title="Supprimer ce texte"
                    >
                      🗑️
                    </button>
                  )}
                </div>

                {existing ? (
                  <div className="space-y-3">
                    <div className="bg-gray-50 border border-gray-200 rounded p-3">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {existing.content || <span className="text-gray-400 italic">Aucun contenu</span>}
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingText(existing)}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    >
                      ✏️ Modifier
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Contenu par défaut :</strong> {textDef.defaultContent}
                      </p>
                    </div>
                    <button
                      onClick={() => createText(activeTab, textDef.textKey, textDef)}
                      disabled={saving}
                      className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 transition"
                    >
                      ➕ Créer ce texte
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal d'édition */}
      {editingText && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">✏️ Modifier le texte</h2>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">Label (description)</label>
                <input
                  type="text"
                  value={editingText.label || ''}
                  onChange={(e) => setEditingText({ ...editingText, label: e.target.value })}
                  className="w-full border border-gray-300 rounded px-4 py-2"
                  placeholder="Ex: Titre de la section héro"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Contenu</label>
                <textarea
                  value={editingText.content}
                  onChange={(e) => setEditingText({ ...editingText, content: e.target.value })}
                  className="w-full border border-gray-300 rounded px-4 py-2 font-mono text-sm"
                  rows={10}
                  placeholder="Entrez le contenu du texte..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Vous pouvez utiliser des retours à la ligne pour formater le texte
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded p-4">
                <p className="text-xs text-gray-600">
                  <strong>Page :</strong> {editingText.pageKey} <br />
                  <strong>Clé :</strong> {editingText.textKey} <br />
                  <strong>Dernière modification :</strong> {new Date(editingText.updatedAt).toLocaleString('fr-FR')}
                </p>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => saveText(editingText)}
                  disabled={saving}
                  className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50"
                >
                  {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
                </button>
                <button
                  onClick={() => setEditingText(null)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
