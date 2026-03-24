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
      { textKey: 'hero-kicker', label: '1️⃣ Badge/Kicker hero', defaultContent: 'Centre auditif indépendant • Province de Liège', type: 'text' },
      { textKey: 'hero-title', label: '2️⃣ Titre principal (H1)', defaultContent: 'Mieux entendre, simplement.', type: 'text' },
      { textKey: 'description-1', label: '3️⃣ Description hero', defaultContent: 'Chez Audire, on commence par comprendre votre quotidien et vos difficultés. Puis on vous propose une suite claire et sans pression. Test auditif gratuit, explications pédagogiques, réglages et suivi dans la durée.', type: 'textarea', rows: 5 },
      { textKey: 'section-1-title', label: '4️⃣ Titre section "Pourquoi Audire"', defaultContent: 'Pourquoi choisir Audire ?', type: 'text' },
      { textKey: 'description-2', label: '5️⃣ Description section "Pourquoi Audire"', defaultContent: 'Parce que bien entendre, ce n\'est pas qu\'une question d\'appareil. C\'est une question d\'accompagnement, d\'écoute et de suivi dans la durée.', type: 'textarea', rows: 5 },
      { textKey: 'section-2-title', label: '6️⃣ Titre section CTA', defaultContent: 'Prêt à mieux entendre ?', type: 'text' },
      { textKey: 'description-3', label: '7️⃣ Description CTA', defaultContent: 'Prenez rendez-vous pour un test auditif gratuit et sans engagement.', type: 'textarea', rows: 3 },
    ]
  },
  {
    pageKey: 'test-auditif-gratuit',
    pageLabel: '👂 Test Auditif Gratuit',
    texts: [
      { textKey: 'hero-title', label: '1️⃣ Titre principal (H1)', defaultContent: 'Test auditif gratuit', type: 'text' },
      { textKey: 'description-1', label: '2️⃣ Description hero', defaultContent: 'Un test complet de 30 minutes pour comprendre votre audition. Gratuit, sans engagement, et expliqué avec des mots simples.', type: 'textarea', rows: 3 },
      { textKey: 'section-1-title', label: '3️⃣ Titre section 1 (Pourquoi)', defaultContent: 'Pourquoi faire un test auditif ?', type: 'text' },
      { textKey: 'description-2', label: '4️⃣ Description section 1', defaultContent: 'La perte auditive est progressive et souvent difficile à détecter soi-même.', type: 'textarea', rows: 3 },
      { textKey: 'section-2-title', label: '5️⃣ Titre section 2 (Déroulement)', defaultContent: 'Comment se déroule le test ?', type: 'text' },
      { textKey: 'description-3', label: '6️⃣ Description section 2', defaultContent: 'Un test simple, indolore et complet en 30 minutes.', type: 'textarea', rows: 3 },
      { textKey: 'section-3-title', label: '7️⃣ Titre section 3 (Réservation)', defaultContent: 'Réservez votre test gratuit', type: 'text' },
      { textKey: 'description-4', label: '8️⃣ Description section 3', defaultContent: 'Remplissez le formulaire ci-dessous et nous vous recontactons rapidement pour fixer un rendez-vous.', type: 'textarea', rows: 3 },
      { textKey: 'section-4-title', label: '9️⃣ Titre section 4 (Contact)', defaultContent: 'Ou contactez-nous directement', type: 'text' },
      { textKey: 'description-5', label: '🔟 Description section 4', defaultContent: 'Vous préférez nous appeler ? Nous sommes là pour vous.', type: 'textarea', rows: 3 },
    ]
  },
  {
    pageKey: 'notre-accompagnement',
    pageLabel: '🤝 Notre Accompagnement',
    texts: [
      { textKey: 'hero-title', label: '1️⃣ Titre principal (H1)', defaultContent: 'Notre accompagnement', type: 'text' },
      { textKey: 'description-1', label: '2️⃣ Description hero', defaultContent: 'Chez Audire, vous n\'êtes pas un numéro. Nous prenons le temps de comprendre votre quotidien, vos difficultés et vos attentes pour vous proposer un accompagnement vraiment personnalisé.', type: 'textarea', rows: 5 },
      { textKey: 'section-1-title', label: '3️⃣ Titre section 1 (Processus)', defaultContent: 'Comment ça se passe ?', type: 'text' },
      { textKey: 'description-2', label: '4️⃣ Description section 1', defaultContent: 'Un accompagnement en plusieurs étapes, à votre rythme et sans pression.', type: 'textarea', rows: 3 },
      { textKey: 'section-2-title', label: '5️⃣ Titre section 2 (Différences)', defaultContent: 'Ce qui nous différencie', type: 'text' },
      { textKey: 'description-3', label: '6️⃣ Description section 2', defaultContent: 'Pourquoi nos clients nous recommandent à leurs proches ?', type: 'textarea', rows: 3 },
      { textKey: 'section-3-title', label: '7️⃣ Titre section 3 (CTA)', defaultContent: 'Prêt à commencer ?', type: 'text' },
      { textKey: 'description-4', label: '8️⃣ Description section 3', defaultContent: 'Prenez rendez-vous pour un test auditif gratuit et sans engagement.', type: 'textarea', rows: 3 },
    ]
  },
  {
    pageKey: 'solutions-auditives',
    pageLabel: '🎧 Solutions Auditives',
    texts: [
      { textKey: 'hero-title', label: '1️⃣ Titre principal (H1)', defaultContent: 'Solutions auditives', type: 'text' },
      { textKey: 'description-1', label: '2️⃣ Description hero', defaultContent: 'Chez Audire, nous proposons des solutions Oticon et Bernafon, deux marques reconnues pour leur qualité et leur innovation. Nos appareils sont discrets, performants et adaptés à votre quotidien.', type: 'textarea', rows: 5 },
      { textKey: 'section-1-title', label: '3️⃣ Titre section 1 (Marques)', defaultContent: 'Oticon & Bernafon', type: 'text' },
      { textKey: 'description-2', label: '4️⃣ Description section 1', defaultContent: 'Deux marques de référence, reconnues dans le monde entier pour leur innovation et leur qualité.', type: 'textarea', rows: 3 },
      { textKey: 'section-2-title', label: '5️⃣ Titre section 2 (Types)', defaultContent: 'Types d\'appareils', type: 'text' },
      { textKey: 'description-3', label: '6️⃣ Description section 2', defaultContent: 'Cliquez sur une carte pour découvrir tous les détails de chaque solution auditive.', type: 'textarea', rows: 3 },
      { textKey: 'section-3-title', label: '7️⃣ Titre section 3 (CTA)', defaultContent: 'Trouvez votre solution', type: 'text' },
      { textKey: 'description-4', label: '8️⃣ Description section 3', defaultContent: 'Chaque personne est unique. Nous prenons le temps de comprendre vos besoins pour vous proposer la solution la plus adaptée.', type: 'textarea', rows: 3 },
    ]
  },
  {
    pageKey: 'remboursements',
    pageLabel: '💰 Remboursements',
    texts: [
      { textKey: 'hero-title', label: '1️⃣ Titre principal (H1)', defaultContent: 'Remboursements', type: 'text' },
      { textKey: 'description-1', label: '2️⃣ Description hero', defaultContent: 'Chez Audire, nous vous accompagnons dans toutes les démarches administratives. Vous comprenez exactement ce que vous allez payer, sans surprise.', type: 'textarea', rows: 5 },
      { textKey: 'section-1-title', label: '3️⃣ Titre section 1 (Fonctionnement)', defaultContent: 'Comment ça marche ?', type: 'text' },
      { textKey: 'description-2', label: '4️⃣ Description section 1', defaultContent: 'Le système de remboursement belge est parfois complexe. Nous vous expliquons tout, étape par étape.', type: 'textarea', rows: 3 },
      { textKey: 'section-2-title', label: '5️⃣ Titre section 2 (INAMI)', defaultContent: 'Interventions INAMI', type: 'text' },
      { textKey: 'description-3', label: '6️⃣ Description section 2', defaultContent: 'L\'INAMI intervient différemment selon votre âge et votre situation.', type: 'textarea', rows: 3 },
      { textKey: 'section-3-title', label: '7️⃣ Titre section 3 (CTA)', defaultContent: 'Une question sur les remboursements ?', type: 'text' },
      { textKey: 'description-4', label: '8️⃣ Description section 3', defaultContent: 'Nous sommes là pour vous aider. Prenez rendez-vous et nous vous expliquerons tout en détail.', type: 'textarea', rows: 3 },
    ]
  },
  {
    pageKey: 'faq',
    pageLabel: '❓ FAQ',
    texts: [
      { textKey: 'hero-title', label: '1️⃣ Titre principal (H1)', defaultContent: 'Questions fréquentes', type: 'text' },
      { textKey: 'description-1', label: '2️⃣ Description hero', defaultContent: 'Vous vous posez des questions sur les appareils auditifs, les remboursements ou notre accompagnement ? Vous trouverez ici les réponses aux questions les plus fréquentes.', type: 'textarea', rows: 5 },
      { textKey: 'section-1-title', label: '3️⃣ Titre section 1 (CTA)', defaultContent: 'Vous ne trouvez pas votre réponse ?', type: 'text' },
      { textKey: 'description-2', label: '4️⃣ Description section 1', defaultContent: 'Contactez-nous ! Nous sommes là pour répondre à toutes vos questions.', type: 'textarea', rows: 3 },
    ]
  },
  {
    pageKey: 'contact',
    pageLabel: '📍 Contact',
    texts: [
      { textKey: 'hero-title', label: '1️⃣ Titre principal (H1)', defaultContent: 'Contact', type: 'text' },
      { textKey: 'description-1', label: '2️⃣ Description hero', defaultContent: 'Une question ? Envie de prendre rendez-vous ? Nous sommes là pour vous accompagner.', type: 'textarea', rows: 3 },
      { textKey: 'section-1-title', label: '3️⃣ Titre section 1 (Horaires)', defaultContent: 'Horaires d\'ouverture', type: 'text' },
      { textKey: 'description-2', label: '4️⃣ Description section 1', defaultContent: 'Nous sommes ouverts du lundi au vendredi. Le samedi sur rendez-vous uniquement.', type: 'textarea', rows: 3 },
      { textKey: 'section-2-title', label: '5️⃣ Titre section 2 (Formulaire)', defaultContent: 'Envoyez-nous un message', type: 'text' },
      { textKey: 'description-3', label: '6️⃣ Description section 2', defaultContent: 'Vous avez une question ? Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.', type: 'textarea', rows: 3 },
    ]
  },
  {
    pageKey: 'partenaires-pharmaciens',
    pageLabel: '💊 Partenaires Pharmaciens',
    texts: [
      { textKey: 'hero-title', label: '1️⃣ Titre principal (H1)', defaultContent: 'Partenaires pharmaciens', type: 'text' },
      { textKey: 'description-1', label: '2️⃣ Description hero', defaultContent: 'Vous êtes pharmacien en province de Liège ? Orientez vos patients vers un accompagnement de qualité pour leurs besoins auditifs.', type: 'textarea', rows: 3 },
      { textKey: 'section-1-title', label: '3️⃣ Titre section 1 (Avantages)', defaultContent: 'Pourquoi nous recommander ?', type: 'text' },
      { textKey: 'description-2', label: '4️⃣ Description section 1', defaultContent: 'Un partenariat basé sur la confiance et l\'excellence du service.', type: 'textarea', rows: 3 },
      { textKey: 'section-2-title', label: '5️⃣ Titre section 2 (Processus)', defaultContent: 'Comment orienter vos patients ?', type: 'text' },
      { textKey: 'description-3', label: '6️⃣ Description section 2', defaultContent: 'Un processus simple et efficace pour vos patients.', type: 'textarea', rows: 3 },
      { textKey: 'section-3-title', label: '7️⃣ Titre section 3 (Matériel)', defaultContent: 'Matériel de communication', type: 'text' },
      { textKey: 'description-4', label: '8️⃣ Description section 3', defaultContent: 'Nous mettons à votre disposition du matériel pour informer vos patients.', type: 'textarea', rows: 3 },
      { textKey: 'section-4-title', label: '9️⃣ Titre section 4 (CTA)', defaultContent: 'Devenons partenaires', type: 'text' },
      { textKey: 'description-5', label: '🔟 Description section 4', defaultContent: 'Vous souhaitez devenir partenaire ou obtenir plus d\'informations ? Contactez-nous dès maintenant.', type: 'textarea', rows: 3 },
    ]
  },
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
