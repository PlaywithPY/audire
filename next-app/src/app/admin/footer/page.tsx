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

type FooterTextDefinition = {
  textKey: string;
  label: string;
  defaultContent: string;
  type?: 'text' | 'textarea';
  rows?: number;
};

const footerTextDefinitions: FooterTextDefinition[] = [
  { textKey: 'title', label: '📍 Titre du footer', defaultContent: 'Audire', type: 'text' },
  { textKey: 'description', label: '📄 Description', defaultContent: 'Centre auditif indépendant en province de Liège. Accompagnement humain et solutions de qualité.', type: 'textarea', rows: 3 },
  { textKey: 'quick-links-title', label: '🔗 Titre section liens rapides', defaultContent: 'Liens rapides', type: 'text' },
  { textKey: 'contact-title', label: '📞 Titre section contact', defaultContent: 'Contact', type: 'text' },
  { textKey: 'hours-title', label: '🕒 Titre section horaires', defaultContent: 'Horaires', type: 'text' },
  { textKey: 'copyright', label: '©️ Texte copyright', defaultContent: 'Audire. Tous droits réservés.', type: 'text' },
  { textKey: 'legal-link-1', label: '⚖️ Lien légal 1', defaultContent: 'Mentions légales', type: 'text' },
  { textKey: 'legal-link-2', label: '🔒 Lien légal 2', defaultContent: 'Politique de confidentialité', type: 'text' },
];

export default function FooterAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pageTexts, setPageTexts] = useState<PageText[]>([]);
  const [editingText, setEditingText] = useState<PageText | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      const res = await fetch('/api/admin/page-texts?pageKey=footer');
      if (!res.ok) {
        setPageTexts([]);
        return;
      }
      const data = await res.json();
      setPageTexts(data);
    } catch (error) {
      console.error('Error fetching footer texts:', error);
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

  async function createText(textKey: string, defaultData: FooterTextDefinition) {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/page-texts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageKey: 'footer',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminHeader currentPage="footer" title="🦶 Éditeur du Footer" />

      <div className="container mx-auto px-6 py-8">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold mb-2">📖 Mode d'emploi</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Modifiez les textes du footer directement ou créez-les s'ils n'existent pas encore</li>
            <li>• Les modifications sont sauvegardées immédiatement</li>
            <li>• Le footer apparaît sur toutes les pages du site</li>
            <li>• Les informations de contact (téléphone, email, adresse) sont gérées depuis le Dashboard</li>
          </ul>
        </div>

        {/* Liste des textes du footer */}
        <div className="space-y-4">
          {footerTextDefinitions.map((textDef) => {
            const existing = pageTexts.find(
              t => t.pageKey === 'footer' && t.textKey === textDef.textKey
            );

            return (
              <div key={textDef.textKey} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg text-gray-800">{textDef.label}</h3>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                      footer.{textDef.textKey}
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
                      onClick={() => createText(textDef.textKey, textDef)}
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
                  placeholder="Ex: Titre du footer"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Contenu</label>
                <textarea
                  value={editingText.content}
                  onChange={(e) => setEditingText({ ...editingText, content: e.target.value })}
                  className="w-full border border-gray-300 rounded px-4 py-2 font-mono text-sm"
                  rows={6}
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
