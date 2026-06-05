'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAllPages, PageCardsDefinition, CardGroup } from '@/lib/card-definitions';
import ImageUploadModal from '@/components/ImageUploadModal';
import AdminHeader from '@/components/AdminHeader';
import FocalField from '@/components/admin/FocalField';

type CardImage = {
  id: number;
  pageKey: string;
  cardKey: string;
  imageUrl: string;
  fallbackEmoji: string;
  imagePosition: string;
  href: string | null;
  title: string | null;
  description: string | null;
  imageAlt: string | null;
  updatedAt: string;
};

export default function FeatureCardsAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cardImages, setCardImages] = useState<CardImage[]>([]);
  const [editingCard, setEditingCard] = useState<CardImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadingForCard, setUploadingForCard] = useState<CardImage | null>(null);

  const pages = getAllPages();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCardImages();
    }
  }, [status]);

  async function fetchCardImages() {
    try {
      const res = await fetch('/api/admin/card-images');
      if (!res.ok) {
        console.error('API error:', res.status);
        setCardImages([]);
        setApiError(true);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setCardImages(data);
        setApiError(false);
      } else {
        console.error('API did not return an array:', data);
        setCardImages([]);
        setApiError(true);
      }
    } catch (error) {
      console.error('Error fetching card images:', error);
      setCardImages([]);
      setApiError(true);
    } finally {
      setLoading(false);
    }
  }

  async function saveCard(card: CardImage) {
    setSaving(true);
    try {
      await fetch('/api/admin/card-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(card),
      });
      await fetchCardImages();
      setEditingCard(null);
    } catch (error) {
      console.error('Error saving card:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  async function createCard(pageKey: string, cardKey: string, defaultData: any) {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/card-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageKey,
          cardKey,
          imageUrl: defaultData.imageSrc,
          fallbackEmoji: defaultData.fallbackEmoji,
          imagePosition: defaultData.imagePosition,
          href: defaultData.href,
          title: defaultData.title,
          description: defaultData.description,
          imageAlt: defaultData.imageAlt,
        }),
      });
      if (res.ok) {
        await fetchCardImages();
      }
    } catch (error) {
      console.error('Error creating card:', error);
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

  const activePage = pages.find(p => p.pageKey === activeTab);
  const activePageGroups = activePage?.groups || [];
  const hasGroups = activePageGroups.length > 0;

  // Fonction pour obtenir la classe CSS selon le layout
  const getLayoutClass = (layout: 'grid-3' | 'grid-2' | 'list') => {
    switch (layout) {
      case 'grid-3':
        return 'grid md:grid-cols-2 lg:grid-cols-3 gap-6';
      case 'grid-2':
        return 'grid md:grid-cols-2 gap-6';
      case 'list':
        return 'space-y-6';
      default:
        return 'grid md:grid-cols-2 lg:grid-cols-3 gap-6';
    }
  };

  // Fonction pour rendre une card
  const renderCard = (cardDef: any, layout: string) => {
    const existing = cardImages.find(
      c => c.pageKey === activeTab && c.cardKey === cardDef.cardKey
    );

    const isListLayout = layout === 'list';

    return (
      <div
        key={cardDef.cardKey}
        className={`border-2 border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all ${
          isListLayout ? 'flex gap-4 items-start' : ''
        }`}
      >
        {isListLayout && (
          <div className="flex-shrink-0 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold">
            {cardDef.fallbackEmoji}
          </div>
        )}

        <div className={isListLayout ? 'flex-grow' : ''}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg">{cardDef.title}</h3>
            <span className="text-2xl">{cardDef.fallbackEmoji}</span>
          </div>

          <p className="text-sm text-gray-600 mb-3">
            <code className="bg-gray-100 px-2 py-1 rounded text-xs">{cardDef.cardKey}</code>
          </p>

          {existing ? (
            <>
              <div className="mb-3 relative h-32 bg-gray-100 rounded overflow-hidden">
                <img
                  src={existing.imageUrl}
                  alt={existing.imageAlt || cardDef.title}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: existing.imagePosition }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 mb-3 space-y-1">
                <p><strong>Position:</strong> {existing.imagePosition}</p>
                <p><strong>Lien:</strong> {existing.href || 'Aucun'}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingCard(existing)}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => {
                    setUploadingForCard(existing);
                    setUploadModalOpen(true);
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  title="Uploader une nouvelle image"
                >
                  📸
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => createCard(activeTab, cardDef.cardKey, cardDef)}
              disabled={saving}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              ➕ Créer cette card
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminHeader currentPage="feature-cards" title="🎨 Gestion des Feature Cards" />

      <div className="container mx-auto px-6 py-8">
        {/* Erreur API */}
        {apiError && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold mb-3 text-red-800">⚠️ Migration SQL requise</h2>
            <p className="text-sm text-red-700 mb-4">
              L'API retourne une erreur. Vous devez probablement exécuter la migration SQL sur Neon.
            </p>
            <div className="bg-white rounded p-4 mb-3">
              <p className="text-xs font-semibold mb-2">Exécutez ce SQL sur Neon :</p>
              <code className="text-xs block whitespace-pre bg-gray-100 p-3 rounded overflow-x-auto">
{`-- Migration: Ajouter pageKey à CardImage
ALTER TABLE "CardImage"
ADD COLUMN IF NOT EXISTS "pageKey" TEXT NOT NULL DEFAULT 'home';

ALTER TABLE "CardImage"
DROP CONSTRAINT IF EXISTS "CardImage_cardKey_key";

ALTER TABLE "CardImage"
ADD CONSTRAINT "CardImage_pageKey_cardKey_key" UNIQUE ("pageKey", "cardKey");

CREATE INDEX IF NOT EXISTS "CardImage_pageKey_idx" ON "CardImage"("pageKey");`}
              </code>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold mb-2">📝 Mode d'emploi</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Sélectionnez une page dans les onglets ci-dessous</li>
            <li>• Les cards sont organisées <strong>exactement comme sur le site</strong></li>
            <li>• Cliquez sur ✏️ pour modifier les infos, ou 📸 pour uploader une image</li>
            <li>• <strong>Image Position</strong> : Contrôle la position de l'image (ex: "center 35%")</li>
          </ul>
        </div>

        {/* Onglets des pages */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {pages.map((page) => (
              <button
                key={page.pageKey}
                onClick={() => setActiveTab(page.pageKey)}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${
                  activeTab === page.pageKey
                    ? 'border-b-2 border-primary text-primary bg-blue-50'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`}
              >
                {page.pageLabel}
                <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded-full">
                  {page.cards.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Cards de la page active - Par groupes */}
        {hasGroups ? (
          <div className="space-y-12">
            {activePageGroups.map((group) => (
              <div key={group.groupKey} className="bg-white rounded-lg shadow-md p-8">
                <div className="mb-6 pb-4 border-b-2 border-gray-200">
                  <h2 className="text-2xl font-bold text-primary mb-2">{group.groupLabel}</h2>
                  <p className="text-sm text-gray-500">
                    Layout: <span className="font-semibold">{group.layout}</span> • {group.cards.length} card(s)
                  </p>
                </div>
                <div className={getLayoutClass(group.layout)}>
                  {group.cards.map((cardDef) => renderCard(cardDef, group.layout))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Fallback si pas de groupes définis
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-bold mb-6">
              Cards de "{activePage?.pageLabel}"
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePage?.cards.map((cardDef) => renderCard(cardDef, 'grid-3'))}
            </div>
          </div>
        )}
      </div>

      {/* Modal d'upload d'image */}
      <ImageUploadModal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setUploadingForCard(null);
        }}
        onImageSelected={(imageUrl) => {
          if (uploadingForCard) {
            // Mettre à jour directement la card avec la nouvelle image
            const updatedCard = { ...uploadingForCard, imageUrl };
            saveCard(updatedCard);
          }
          setUploadModalOpen(false);
          setUploadingForCard(null);
        }}
      />

      {/* Modal d'édition */}
      {editingCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">✏️ Modifier la card</h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Colonne gauche : Prévisualisation */}
              <div>
                <h3 className="font-bold text-lg mb-3">👁️ Prévisualisation</h3>
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Image avec le centrage réel */}
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-primary-light/20 overflow-hidden relative">
                      {editingCard.imageUrl ? (
                        <img
                          src={editingCard.imageUrl}
                          alt={editingCard.imageAlt || editingCard.title || 'Preview'}
                          className="w-full h-full object-cover"
                          style={{ objectPosition: editingCard.imagePosition }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-6xl animate-float">{editingCard.fallbackEmoji}</span>
                        </div>
                      )}
                    </div>
                    {/* Contenu de la card */}
                    <div className="p-6">
                      <h4 className="font-bold text-xl mb-2">{editingCard.title || 'Titre'}</h4>
                      <p className="text-gray-600 text-sm">{editingCard.description || 'Description'}</p>
                    </div>
                  </div>

                  {/* Info sur la position */}
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                    <p className="font-semibold mb-1">💡 Position actuelle :</p>
                    <code className="text-xs bg-white px-2 py-1 rounded">{editingCard.imagePosition}</code>
                    <p className="text-xs text-gray-600 mt-2">
                      Modifiez la position à droite pour voir le changement en temps réel
                    </p>
                  </div>
                </div>
              </div>

              {/* Colonne droite : Formulaire */}
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2">URL de l'image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingCard.imageUrl}
                      onChange={(e) => setEditingCard({ ...editingCard, imageUrl: e.target.value })}
                      className="flex-1 border border-gray-300 rounded px-4 py-2"
                      placeholder="/images/mon-image.jpg"
                    />
                    <button
                      onClick={() => {
                        setUploadingForCard(editingCard);
                        setUploadModalOpen(true);
                      }}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      title="Uploader une nouvelle image"
                    >
                      📸
                    </button>
                    <button
                      onClick={() => setEditingCard({ ...editingCard, imageUrl: '' })}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      title="Enlever l'image et utiliser l'emoji"
                    >
                      🗑️
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Cliquez sur 🗑️ pour enlever l'image et afficher l'emoji à la place
                  </p>
                </div>

                <div>
                  <label className="block font-semibold mb-2">Position de l'image (point focal)</label>
                  <p className="text-xs text-gray-500 mb-2">
                    Glissez le point sur la zone à garder visible — l'aperçu à gauche se met à jour en temps réel.
                  </p>
                  <FocalField
                    imageUrl={editingCard.imageUrl}
                    value={editingCard.imagePosition}
                    onChange={(pos) => setEditingCard({ ...editingCard, imagePosition: pos })}
                    aspect="video"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">Titre</label>
                  <input
                    type="text"
                    value={editingCard.title || ''}
                    onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                    className="w-full border border-gray-300 rounded px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">Description</label>
                  <textarea
                    value={editingCard.description || ''}
                    onChange={(e) => setEditingCard({ ...editingCard, description: e.target.value })}
                    className="w-full border border-gray-300 rounded px-4 py-2"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">Lien (href)</label>
                  <input
                    type="text"
                    value={editingCard.href || ''}
                    onChange={(e) => setEditingCard({ ...editingCard, href: e.target.value })}
                    className="w-full border border-gray-300 rounded px-4 py-2"
                    placeholder="/page-destination"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">Texte alternatif (alt)</label>
                  <input
                    type="text"
                    value={editingCard.imageAlt || ''}
                    onChange={(e) => setEditingCard({ ...editingCard, imageAlt: e.target.value })}
                    className="w-full border border-gray-300 rounded px-4 py-2"
                  />
                </div>

                <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => saveCard(editingCard)}
                    disabled={saving}
                    className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50"
                  >
                    {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
                  </button>
                  <button
                    onClick={() => setEditingCard(null)}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
