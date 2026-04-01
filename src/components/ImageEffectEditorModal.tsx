'use client';

import { useState, useEffect } from 'react';
import ImageUploadModal from './ImageUploadModal';

type ImageEffect = {
  id?: number;
  imageUrl: string;
  effectType: 'parallax' | 'zoom' | 'fade' | 'slide' | 'fixed' | 'none';
  effectSpeed: number;
  effectScale: number;
  effectDirection: 'up' | 'down' | 'left' | 'right';
  effectIntensity: number;
  imagePosition: string;
  pageKey: string;
  sectionKey: string;
  order: number;
  isVisible: boolean;
  alt: string | null;
  overlayColor: string | null;
  minHeight: string;
};

type ImageEffectEditorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (effect: ImageEffect) => Promise<void>;
  currentEffect?: ImageEffect;
  pageKey: string;
  sectionKey: string;
};

const effectTypes = [
  { value: 'none', label: '📷 Aucun effet (image simple)', description: 'Image statique sans effet' },
  { value: 'parallax', label: '🌊 Parallax', description: 'L\'image défile plus lentement que le contenu' },
  { value: 'zoom', label: '🔍 Zoom au scroll', description: 'L\'image se zoome progressivement au scroll' },
  { value: 'fade', label: '✨ Fade in/out', description: 'L\'image apparaît/disparaît au scroll' },
  { value: 'fixed', label: '📌 Fixed (attachment)', description: 'L\'image reste fixe pendant le scroll' },
  { value: 'slide', label: '➡️ Slide latéral', description: 'L\'image glisse latéralement au scroll' },
];

export default function ImageEffectEditorModal({
  isOpen,
  onClose,
  onSave,
  currentEffect,
  pageKey,
  sectionKey,
}: ImageEffectEditorModalProps) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [effect, setEffect] = useState<ImageEffect>({
    imageUrl: '',
    effectType: 'none',
    effectSpeed: 0.5,
    effectScale: 1.2,
    effectDirection: 'down',
    effectIntensity: 1.0,
    imagePosition: 'center center',
    pageKey: pageKey,
    sectionKey: sectionKey,
    order: 0,
    isVisible: true,
    alt: null,
    overlayColor: null,
    minHeight: '400px',
  });

  useEffect(() => {
    if (isOpen) {
      if (currentEffect) {
        setEffect(currentEffect);
      } else {
        // Reset au valeur par défaut
        setEffect({
          imageUrl: '',
          effectType: 'none',
          effectSpeed: 0.5,
          effectScale: 1.2,
          effectDirection: 'down',
          effectIntensity: 1.0,
          imagePosition: 'center center',
          pageKey: pageKey,
          sectionKey: sectionKey,
          order: 0,
          isVisible: true,
          alt: null,
          overlayColor: null,
          minHeight: '400px',
        });
      }
    }
  }, [isOpen, currentEffect, pageKey, sectionKey]);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(effect);
      onClose();
    } catch (error) {
      console.error('Error saving effect:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              🖼️ Édition d'image avec effets
            </h2>
            <p className="text-gray-600">
              Configurez l'image et ses effets visuels
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-4xl hover:rotate-90 transition-all transform hover:scale-110"
          >
            ×
          </button>
        </div>

        {/* Preview de l'image */}
        {effect.imageUrl && (
          <div className="mb-6 rounded-lg overflow-hidden border-2 border-gray-200">
            <div className="relative" style={{ height: effect.minHeight }}>
              <img
                src={effect.imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                style={{ objectPosition: effect.imagePosition }}
              />
              {effect.overlayColor && (
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: effect.overlayColor }}
                />
              )}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Colonne gauche : Configuration de base */}
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-2">🖼️ Image</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={effect.imageUrl}
                  onChange={(e) => setEffect({ ...effect, imageUrl: e.target.value })}
                  className="flex-1 border border-gray-300 rounded px-4 py-2"
                  placeholder="/audire/images/..."
                />
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  title="Choisir une image"
                >
                  📸
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2">✨ Type d'effet</label>
              <select
                value={effect.effectType}
                onChange={(e) => setEffect({ ...effect, effectType: e.target.value as ImageEffect['effectType'] })}
                className="w-full border border-gray-300 rounded px-4 py-2"
              >
                {effectTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {effectTypes.find(t => t.value === effect.effectType)?.description}
              </p>
            </div>

            <div>
              <label className="block font-semibold mb-2">🧭 Direction de l'effet</label>
              <select
                value={effect.effectDirection}
                onChange={(e) => setEffect({ ...effect, effectDirection: e.target.value as ImageEffect['effectDirection'] })}
                className="w-full border border-gray-300 rounded px-4 py-2"
              >
                <option value="down">⬇️ Vers le bas</option>
                <option value="up">⬆️ Vers le haut</option>
                <option value="left">⬅️ Vers la gauche</option>
                <option value="right">➡️ Vers la droite</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-2">
                💪 Intensité de l'effet: {effect.effectIntensity}
              </label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={effect.effectIntensity}
                onChange={(e) => setEffect({ ...effect, effectIntensity: parseFloat(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                0.1 = très subtil, 1.0 = normal, 2.0 = très prononcé
              </p>
            </div>

            <div>
              <label className="block font-semibold mb-2">🎯 Position de l'image</label>
              <input
                type="text"
                value={effect.imagePosition}
                onChange={(e) => setEffect({ ...effect, imagePosition: e.target.value })}
                className="w-full border border-gray-300 rounded px-4 py-2"
                placeholder="center center"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {['center center', 'center 30%', 'center top', 'center bottom', 'left center', 'right center'].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setEffect({ ...effect, imagePosition: pos })}
                    className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne droite : Configuration avancée */}
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-2">📏 Hauteur minimale</label>
              <input
                type="text"
                value={effect.minHeight}
                onChange={(e) => setEffect({ ...effect, minHeight: e.target.value })}
                className="w-full border border-gray-300 rounded px-4 py-2"
                placeholder="400px"
              />
              <div className="flex gap-2 mt-2">
                {['300px', '400px', '500px', '50vh', '60vh', '80vh'].map((height) => (
                  <button
                    key={height}
                    onClick={() => setEffect({ ...effect, minHeight: height })}
                    className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                  >
                    {height}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2">🎨 Couleur overlay (optionnel)</label>
              <input
                type="text"
                value={effect.overlayColor || ''}
                onChange={(e) => setEffect({ ...effect, overlayColor: e.target.value || null })}
                className="w-full border border-gray-300 rounded px-4 py-2"
                placeholder="rgba(0,0,0,0.3)"
              />
              <div className="flex gap-2 mt-2">
                {[
                  { label: 'Noir 30%', value: 'rgba(0,0,0,0.3)' },
                  { label: 'Noir 50%', value: 'rgba(0,0,0,0.5)' },
                  { label: 'Bleu 20%', value: 'rgba(30,64,175,0.2)' },
                  { label: 'Aucun', value: '' },
                ].map((overlay) => (
                  <button
                    key={overlay.label}
                    onClick={() => setEffect({ ...effect, overlayColor: overlay.value || null })}
                    className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                  >
                    {overlay.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2">📝 Texte alternatif (alt)</label>
              <input
                type="text"
                value={effect.alt || ''}
                onChange={(e) => setEffect({ ...effect, alt: e.target.value || null })}
                className="w-full border border-gray-300 rounded px-4 py-2"
                placeholder="Description de l'image"
              />
              <p className="text-xs text-gray-500 mt-1">
                Important pour l'accessibilité et le SEO
              </p>
            </div>

            <div>
              <label className="block font-semibold mb-2">👁️ Visibilité</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={effect.isVisible}
                  onChange={(e) => setEffect({ ...effect, isVisible: e.target.checked })}
                  className="w-5 h-5"
                />
                <span>Image visible sur le site</span>
              </label>
            </div>

            <div>
              <label className="block font-semibold mb-2">🔢 Ordre d'affichage</label>
              <input
                type="number"
                value={effect.order}
                onChange={(e) => setEffect({ ...effect, order: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded px-4 py-2"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Position dans la page (0 = premier, 1 = deuxième, etc.)
              </p>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-4 mt-8 pt-6 border-t-2 border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving || !effect.imageUrl}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <span className="text-2xl">{saving ? '⏳' : '💾'}</span>
            <span>{saving ? 'Sauvegarde en cours...' : 'Sauvegarder'}</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 px-8 py-4 rounded-2xl font-bold hover:from-gray-400 hover:to-gray-500 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <span className="text-2xl">❌</span>
            <span>Annuler</span>
          </button>
        </div>
      </div>

      {/* Modal de sélection d'image */}
      <ImageUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onImageSelected={(imageUrl) => {
          setEffect({ ...effect, imageUrl });
          setUploadModalOpen(false);
        }}
      />
    </div>
  );
}
