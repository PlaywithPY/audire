'use client';

import { useEffect, useState } from 'react';
import { getAllPages } from '@/lib/card-definitions';
import ImageUploadModal from '@/components/ImageUploadModal';

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

export default function FeatureCardsSection() {
  const [cardImages, setCardImages] = useState<CardImage[]>([]);
  const [editingCard, setEditingCard] = useState<CardImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadingForCard, setUploadingForCard] = useState<CardImage | null>(null);

  const pages = getAllPages();

  useEffect(() => {
    fetchCardImages();
  }, []);

  async function fetchCardImages() {
    try {
      const res = await fetch('/api/admin/card-images');
      if (!res.ok) {
        setCardImages([]);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setCardImages(data);
      } else {
        setCardImages([]);
      }
    } catch (error) {
      console.error('Error fetching card images:', error);
      setCardImages([]);
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-gray-600">Chargement des cards...</p>
      </div>
    );
  }

  const activePage = pages.find(p => p.pageKey === activeTab);
  const activePageGroups = activePage?.groups || [];

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

  const renderCard = (cardDef: any, layout: string) => {
    const existing = cardImages.find(
      c => c.pageKey === activeTab && c.cardKey === cardDef.cardKey
    );

    return (
      <div
        key={cardDef.cardKey}
        className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg">{cardDef.title}</h3>
          <span className="text-2xl">{cardDef.fallbackEmoji}</span>
        </div>

        <p className="text-xs text-gray-500 mb-3">
          <code className="bg-gray-100 px-2 py-1 rounded">{cardDef.cardKey}</code>
        </p>

        {existing ? (
          <>
            {existing.imageUrl && (
              <div className="mb-3 relative h-24 bg-gray-100 rounded overflow-hidden">
                <img
                  src={existing.imageUrl}
                  alt={existing.imageAlt || cardDef.title}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: existing.imagePosition }}
                />
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setEditingCard(existing)}
                className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
              >
                ✏️ Modifier
              </button>
              <button
                onClick={() => {
                  setUploadingForCard(existing);
                  setUploadModalOpen(true);
                }}
                className="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
              >
                📸
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => createCard(activeTab, cardDef.cardKey, cardDef)}
            disabled={saving}
            className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
          >
            ➕ Créer
          </button>
        )}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">🎨 Gestion des Feature Cards</h2>

      {/* Page tabs */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {pages.map((page) => (
            <button
              key={page.pageKey}
              onClick={() => setActiveTab(page.pageKey)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === page.pageKey
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page.pageLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Cards display */}
      {activePageGroups.length > 0 ? (
        <div className="space-y-8">
          {activePageGroups.map((group) => (
            <div key={group.groupKey} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4 text-primary">{group.groupLabel}</h3>
              <div className={getLayoutClass(group.layout)}>
                {group.cards.map((cardDef) => renderCard(cardDef, group.layout))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePage?.cards.map((cardDef) => renderCard(cardDef, 'grid-3'))}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <ImageUploadModal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setUploadingForCard(null);
        }}
        onImageSelected={(imageUrl) => {
          if (uploadingForCard) {
            const updatedCard = { ...uploadingForCard, imageUrl };
            saveCard(updatedCard);
          }
          setUploadModalOpen(false);
          setUploadingForCard(null);
        }}
      />

      {/* Edit Modal */}
      {editingCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">✏️ Modifier la card</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Preview */}
              <div>
                <h3 className="font-bold mb-3">👁️ Prévisualisation</h3>
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-primary-light/20 overflow-hidden relative">
                      {editingCard.imageUrl && (
                        <img
                          src={editingCard.imageUrl}
                          alt={editingCard.imageAlt || ''}
                          className="w-full h-full object-cover"
                          style={{ objectPosition: editingCard.imagePosition }}
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-lg mb-2">{editingCard.title}</h4>
                      <p className="text-gray-600 text-sm">{editingCard.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2 text-sm">URL de l'image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingCard.imageUrl}
                      onChange={(e) => setEditingCard({ ...editingCard, imageUrl: e.target.value })}
                      className="flex-1 border rounded px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => {
                        setUploadingForCard(editingCard);
                        setUploadModalOpen(true);
                      }}
                      className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                    >
                      📸
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-sm">Position</label>
                  <input
                    type="text"
                    value={editingCard.imagePosition}
                    onChange={(e) => setEditingCard({ ...editingCard, imagePosition: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-sm">Titre</label>
                  <input
                    type="text"
                    value={editingCard.title || ''}
                    onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-sm">Description</label>
                  <textarea
                    value={editingCard.description || ''}
                    onChange={(e) => setEditingCard({ ...editingCard, description: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => saveCard(editingCard)}
                    disabled={saving}
                    className="flex-1 bg-primary text-white px-4 py-2 rounded font-semibold hover:bg-primary-dark"
                  >
                    {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
                  </button>
                  <button
                    onClick={() => setEditingCard(null)}
                    className="flex-1 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
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
