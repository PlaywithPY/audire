'use client';

import { useEffect, useState } from 'react';
import ImageUploadModal from '@/components/ImageUploadModal';

type ImageEffect = {
  id: number;
  imageUrl: string;
  effectType: 'parallax' | 'zoom' | 'fade' | 'slide' | 'fixed' | 'none';
  pageKey: string;
  sectionKey: string;
  order: number;
  isVisible: boolean;
  alt: string | null;
  imagePosition: string;
};

const pages = [
  { key: 'home', label: '🏠 Accueil' },
  { key: 'solutions-auditives', label: '🦻 Solutions auditives' },
  { key: 'test-auditif-gratuit', label: '🔊 Test auditif' },
  { key: 'notre-accompagnement', label: '🤝 Accompagnement' },
  { key: 'remboursements', label: '💰 Remboursements' },
  { key: 'faq', label: '❓ FAQ' },
  { key: 'contact', label: '📞 Contact' },
];

export default function ImageEffectsSection() {
  const [imageEffects, setImageEffects] = useState<ImageEffect[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState('home');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editingEffect, setEditingEffect] = useState<ImageEffect | null>(null);

  useEffect(() => {
    fetchImageEffects();
  }, [selectedPage]);

  async function fetchImageEffects() {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/image-effects?pageKey=${selectedPage}`);
      if (!res.ok) {
        setImageEffects([]);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setImageEffects(data);
      } else {
        setImageEffects([]);
      }
    } catch (error) {
      console.error('Error fetching image effects:', error);
      setImageEffects([]);
    } finally {
      setLoading(false);
    }
  }

  async function saveEffect(effect: ImageEffect) {
    try {
      await fetch('/api/admin/image-effects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(effect),
      });
      await fetchImageEffects();
      setEditingEffect(null);
    } catch (error) {
      console.error('Error saving effect:', error);
      alert('Erreur lors de la sauvegarde');
    }
  }

  async function toggleVisibility(effect: ImageEffect) {
    try {
      await fetch('/api/admin/image-effects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...effect, isVisible: !effect.isVisible }),
      });
      await fetchImageEffects();
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-gray-600">Chargement des images...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">🖼️ Gestion des Images & Effets</h2>

      {/* Page selector */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <label className="block text-sm font-semibold mb-2">Sélectionner une page:</label>
        <div className="flex gap-2 flex-wrap">
          {pages.map((page) => (
            <button
              key={page.key}
              onClick={() => setSelectedPage(page.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPage === page.key
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page.label}
            </button>
          ))}
        </div>
      </div>

      {/* Image effects list */}
      <div className="space-y-4">
        {imageEffects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Aucun effet d'image pour cette page</p>
            <p className="text-xs text-gray-400 mt-2">
              Utilisez la page complète "Images & Effets" pour ajouter de nouveaux effets
            </p>
          </div>
        ) : (
          imageEffects.map((effect) => (
            <div
              key={effect.id}
              className={`bg-white rounded-lg shadow p-6 ${!effect.isVisible ? 'opacity-50' : ''}`}
            >
              <div className="flex gap-4">
                {/* Image preview */}
                <div className="w-32 h-32 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {effect.imageUrl && (
                    <img
                      src={effect.imageUrl}
                      alt={effect.alt || ''}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: effect.imagePosition }}
                    />
                  )}
                </div>

                {/* Effect details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{effect.sectionKey}</code>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {effect.effectType}
                    </span>
                    {!effect.isVisible && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                        Masqué
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Ordre:</strong> {effect.order} • <strong>Position:</strong> {effect.imagePosition}
                  </p>
                  {effect.alt && (
                    <p className="text-xs text-gray-500">Alt: {effect.alt}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setEditingEffect(effect)}
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => toggleVisibility(effect)}
                    className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded hover:bg-yellow-200 text-sm"
                  >
                    {effect.isVisible ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      <ImageUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onImageSelected={(imageUrl) => {
          if (editingEffect) {
            setEditingEffect({ ...editingEffect, imageUrl });
          }
          setUploadModalOpen(false);
        }}
      />

      {/* Edit Modal */}
      {editingEffect && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">✏️ Modifier l'effet d'image</h2>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2 text-sm">URL de l'image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingEffect.imageUrl}
                    onChange={(e) => setEditingEffect({ ...editingEffect, imageUrl: e.target.value })}
                    className="flex-1 border rounded px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => setUploadModalOpen(true)}
                    className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                  >
                    📸
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-sm">Position de l'image</label>
                <input
                  type="text"
                  value={editingEffect.imagePosition}
                  onChange={(e) => setEditingEffect({ ...editingEffect, imagePosition: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-sm">Texte alternatif</label>
                <input
                  type="text"
                  value={editingEffect.alt || ''}
                  onChange={(e) => setEditingEffect({ ...editingEffect, alt: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => saveEffect(editingEffect)}
                  className="flex-1 bg-primary text-white px-4 py-2 rounded font-semibold"
                >
                  💾 Sauvegarder
                </button>
                <button
                  onClick={() => setEditingEffect(null)}
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
          Pour une gestion complète (création, suppression, effets avancés)
        </p>
        <a
          href="/admin/image-effects"
          target="_blank"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Ouvrir la page complète →
        </a>
      </div>
    </div>
  );
}
