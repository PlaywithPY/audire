'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';
import ImageUploadModal from '@/components/ImageUploadModal';
import VisualSectionSelector from '@/components/VisualSectionSelector';

type ImageEffect = {
  id: number;
  imageUrl: string;
  effectType: 'parallax' | 'zoom' | 'fade' | 'slide' | 'fixed' | 'none';
  effectSpeed: number; // 0.1 à 1.0 pour parallax
  effectScale: number; // 1.0 à 1.5 pour zoom
  effectDirection: 'up' | 'down' | 'left' | 'right'; // direction de l'effet
  effectIntensity: number; // 0.1 à 2.0 - intensité de l'effet
  imagePosition: string; // position de l'image (object-position CSS)
  pageKey: string;
  sectionKey: string; // identifiant de la section (ex: "hero-services", "about-team")
  order: number; // ordre d'affichage dans la page
  isVisible: boolean;
  alt: string | null;
  overlayColor: string | null; // couleur de l'overlay (ex: "rgba(0,0,0,0.3)")
  minHeight: string; // hauteur minimale (ex: "400px", "50vh")
  updatedAt: string;
};

export default function ImageEffectsAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [imageEffects, setImageEffects] = useState<ImageEffect[]>([]);
  const [editingEffect, setEditingEffect] = useState<ImageEffect | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [sectionSelectorOpen, setSectionSelectorOpen] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedPage, setSelectedPage] = useState('home');
  const [allPageKeys, setAllPageKeys] = useState<string[]>([]);

  const pages = [
    { key: 'home', label: '🏠 Accueil' },
    { key: 'solutions-auditives', label: '🦻 Solutions auditives' },
    { key: 'test-auditif-gratuit', label: '🔊 Test auditif' },
    { key: 'notre-accompagnement', label: '🤝 Accompagnement' },
    { key: 'remboursements', label: '💰 Remboursements' },
    { key: 'faq', label: '❓ FAQ' },
    { key: 'contact', label: '📞 Contact' },
    { key: 'partenaires-pharmaciens', label: '💊 Partenaires' },
  ];

  const effectTypes = [
    { value: 'none', label: '📷 Aucun effet (image simple)', description: 'Image statique sans effet' },
    { value: 'parallax', label: '🌊 Parallax', description: 'L\'image défile plus lentement que le contenu' },
    { value: 'zoom', label: '🔍 Zoom au scroll', description: 'L\'image se zoome progressivement au scroll' },
    { value: 'fade', label: '✨ Fade in/out', description: 'L\'image apparaît/disparaît au scroll' },
    { value: 'fixed', label: '📌 Fixed (attachment)', description: 'L\'image reste fixe pendant le scroll' },
    { value: 'slide', label: '➡️ Slide latéral', description: 'L\'image glisse latéralement au scroll' },
  ];

  const newEffectTemplate: Omit<ImageEffect, 'id' | 'updatedAt'> = {
    imageUrl: '',
    effectType: 'parallax',
    effectSpeed: 0.5,
    effectScale: 1.2,
    effectDirection: 'down',
    effectIntensity: 1.0,
    imagePosition: 'center center',
    pageKey: selectedPage,
    sectionKey: '',
    order: 0,
    isVisible: true,
    alt: null,
    overlayColor: null,
    minHeight: '400px',
  };

  const [newEffect, setNewEffect] = useState(newEffectTemplate);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchImageEffects();
      fetchAllPageKeys();
    }
  }, [status, selectedPage]);

  // Réinitialiser le formulaire quand on change de page
  useEffect(() => {
    setNewEffect({
      imageUrl: '',
      effectType: 'parallax',
      effectSpeed: 0.5,
      effectScale: 1.2,
      effectDirection: 'down',
      effectIntensity: 1.0,
      imagePosition: 'center center',
      pageKey: selectedPage,
      sectionKey: '',
      order: 0,
      isVisible: true,
      alt: null,
      overlayColor: null,
      minHeight: '400px',
    });
    setShowNewForm(false);
    setEditingEffect(null);
  }, [selectedPage]);

  async function fetchAllPageKeys() {
    try {
      const res = await fetch('/api/admin/image-effects/all-pages');
      if (res.ok) {
        const data = await res.json();
        setAllPageKeys(data.pageKeys || []);
      }
    } catch (error) {
      console.error('Error fetching all page keys:', error);
    }
  }

  async function fetchImageEffects() {
    try {
      console.log('🔍 Fetching image effects for pageKey:', selectedPage);
      const res = await fetch(`/api/admin/image-effects?pageKey=${selectedPage}`);
      if (!res.ok) {
        console.error('❌ API error:', res.status);
        setImageEffects([]);
        return;
      }
      const data = await res.json();
      console.log('📦 Received image effects data:', data);
      if (Array.isArray(data)) {
        console.log(`✅ Found ${data.length} image effect(s) for page "${selectedPage}"`);
        setImageEffects(data);
      } else {
        console.warn('⚠️ Data is not an array:', data);
        setImageEffects([]);
      }
    } catch (error) {
      console.error('💥 Error fetching image effects:', error);
      setImageEffects([]);
    } finally {
      setLoading(false);
    }
  }

  async function saveEffect(effect: ImageEffect) {
    setSaving(true);
    try {
      await fetch('/api/admin/image-effects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(effect),
      });
      await fetchImageEffects();
      setEditingEffect(null);
      alert('✅ Effet sauvegardé !');
    } catch (error) {
      console.error('Error saving effect:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  async function createEffect() {
    if (!newEffect.sectionKey) {
      alert('⚠️ Le sectionKey est obligatoire !');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/image-effects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEffect),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 400 && errorData.error) {
          alert(`❌ ${errorData.error}\n\nVérifiez que:\n• Le pageKey correspond bien à "${selectedPage}"\n• Le sectionKey "${newEffect.sectionKey}" n'existe pas déjà\n• Utilisez le bouton "🔧 Diagnostic" pour corriger les incohérences`);
        } else {
          alert('❌ Erreur lors de la création');
        }
        setSaving(false);
        return;
      }

      await fetchImageEffects();
      setShowNewForm(false);
      setNewEffect({ ...newEffectTemplate, pageKey: selectedPage });
      alert('✅ Effet créé !');
    } catch (error) {
      console.error('Error creating effect:', error);
      alert('❌ Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  }

  async function deleteEffect(id: number) {
    if (!confirm('Supprimer cet effet d\'image ?')) return;

    try {
      await fetch(`/api/admin/image-effects?id=${id}`, {
        method: 'DELETE',
      });
      await fetchImageEffects();
      alert('✅ Effet supprimé !');
    } catch (error) {
      console.error('Error deleting effect:', error);
      alert('❌ Erreur lors de la suppression');
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

  const currentEffect = editingEffect || (showNewForm ? newEffect : null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminHeader currentPage="image-effects" title="🖼️ Gestion des Images & Effets" />

      <div className="container mx-auto px-6 py-8">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-3">📝 Mode d'emploi</h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Ajoutez des <strong>images avec effets CSS</strong> entre chaque section de page</li>
                <li>• Les effets disponibles : Parallax, Zoom au scroll, Fade, Fixed, Slide</li>
                <li>• Utilisez le <strong>sectionKey</strong> pour identifier où placer l'image (ex: "hero-services")</li>
                <li>• L'ordre détermine la position dans la page (0 = premier, 1 = deuxième, etc.)</li>
                <li>• Vous pouvez ajouter un overlay de couleur pour améliorer la lisibilité du texte</li>
              </ul>
            </div>
            <button
              onClick={() => router.push('/admin/fix-image-effects')}
              className="ml-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 whitespace-nowrap text-sm font-semibold"
              title="Diagnostiquer et corriger les incohérences"
            >
              🔧 Diagnostic
            </button>
          </div>
        </div>

        {/* Sélecteur de page */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">📄 Sélectionnez une page</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {pages.map((page) => (
              <button
                key={page.key}
                onClick={() => setSelectedPage(page.key)}
                className={`px-4 py-3 rounded font-semibold transition ${
                  selectedPage === page.key
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {page.label}
              </button>
            ))}
          </div>
          {allPageKeys.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-xs font-semibold text-blue-900 mb-1">🔍 PageKeys dans la base de données:</p>
              <p className="text-xs text-blue-700">
                {allPageKeys.join(', ') || 'Aucun'}
              </p>
            </div>
          )}
        </div>

        {/* Liste des effets */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              🎨 Effets d'images - {pages.find(p => p.key === selectedPage)?.label}
            </h2>
            <button
              onClick={() => {
                if (!showNewForm) {
                  // On ouvre le formulaire : le réinitialiser avec le bon pageKey
                  setNewEffect({ ...newEffectTemplate, pageKey: selectedPage });
                }
                setShowNewForm(!showNewForm);
                setEditingEffect(null);
              }}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              {showNewForm ? '❌ Annuler' : '➕ Nouvel effet'}
            </button>
          </div>

          {/* Formulaire nouveau/édition */}
          {(showNewForm || editingEffect) && currentEffect && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">
                  {editingEffect ? '✏️ Modifier l\'effet' : '➕ Créer un nouvel effet'}
                </h3>
                <div className="text-sm bg-white px-4 py-2 rounded-lg border-2 border-blue-400 font-semibold">
                  📄 Page: <span className="text-blue-700">{currentEffect.pageKey}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Colonne gauche : Configuration */}
                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold mb-2">🏷️ Section Key (identifiant)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={showNewForm ? newEffect.sectionKey : editingEffect?.sectionKey || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (showNewForm) {
                            setNewEffect({ ...newEffect, sectionKey: value });
                          } else if (editingEffect) {
                            setEditingEffect({ ...editingEffect, sectionKey: value });
                          }
                        }}
                        className="flex-1 border border-gray-300 rounded px-4 py-2"
                        placeholder="ex: hero-services, about-team"
                      />
                      <button
                        onClick={() => setSectionSelectorOpen(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        title="Choisir une section visuelle"
                      >
                        📐
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Identifiant unique pour cette section (ou cliquez sur 📐 pour choisir une section visuelle)
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">🖼️ Image</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={showNewForm ? newEffect.imageUrl : editingEffect?.imageUrl || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (showNewForm) {
                            setNewEffect({ ...newEffect, imageUrl: value });
                          } else if (editingEffect) {
                            setEditingEffect({ ...editingEffect, imageUrl: value });
                          }
                        }}
                        className="flex-1 border border-gray-300 rounded px-4 py-2"
                        placeholder="/audire/images/oticon-couple.jpg"
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
                      value={showNewForm ? newEffect.effectType : editingEffect?.effectType || 'none'}
                      onChange={(e) => {
                        const value = e.target.value as ImageEffect['effectType'];
                        if (showNewForm) {
                          setNewEffect({ ...newEffect, effectType: value });
                        } else if (editingEffect) {
                          setEditingEffect({ ...editingEffect, effectType: value });
                        }
                      }}
                      className="w-full border border-gray-300 rounded px-4 py-2"
                    >
                      {effectTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {effectTypes.find(t => t.value === currentEffect.effectType)?.description}
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">🧭 Direction de l'effet</label>
                    <select
                      value={showNewForm ? newEffect.effectDirection : editingEffect?.effectDirection || 'down'}
                      onChange={(e) => {
                        const value = e.target.value as ImageEffect['effectDirection'];
                        if (showNewForm) {
                          setNewEffect({ ...newEffect, effectDirection: value });
                        } else if (editingEffect) {
                          setEditingEffect({ ...editingEffect, effectDirection: value });
                        }
                      }}
                      className="w-full border border-gray-300 rounded px-4 py-2"
                    >
                      <option value="down">⬇️ Vers le bas</option>
                      <option value="up">⬆️ Vers le haut</option>
                      <option value="left">⬅️ Vers la gauche</option>
                      <option value="right">➡️ Vers la droite</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Direction du mouvement de l'effet (parallax, slide, etc.)
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">
                      💪 Intensité de l'effet: {currentEffect.effectIntensity}
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.1"
                      value={currentEffect.effectIntensity}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (showNewForm) {
                          setNewEffect({ ...newEffect, effectIntensity: value });
                        } else if (editingEffect) {
                          setEditingEffect({ ...editingEffect, effectIntensity: value });
                        }
                      }}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Contrôle l'intensité de tous les effets (0.1 = très subtil, 1.0 = normal, 2.0 = très prononcé)
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">🎯 Position de l'image</label>
                    <input
                      type="text"
                      value={showNewForm ? newEffect.imagePosition : editingEffect?.imagePosition || 'center center'}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (showNewForm) {
                          setNewEffect({ ...newEffect, imagePosition: value });
                        } else if (editingEffect) {
                          setEditingEffect({ ...editingEffect, imagePosition: value });
                        }
                      }}
                      className="w-full border border-gray-300 rounded px-4 py-2"
                      placeholder="center center"
                    />
                    <div className="flex gap-2 mt-2">
                      {['center center', 'center 30%', 'center top', 'center bottom', 'left center', 'right center'].map((pos) => (
                        <button
                          key={pos}
                          onClick={() => {
                            if (showNewForm) {
                              setNewEffect({ ...newEffect, imagePosition: pos });
                            } else if (editingEffect) {
                              setEditingEffect({ ...editingEffect, imagePosition: pos });
                            }
                          }}
                          className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Contrôle le centrage de l'image (comme feature-cards)
                    </p>
                  </div>

                  {currentEffect.effectType === 'parallax' && (
                    <div>
                      <label className="block font-semibold mb-2">
                        🏃 Vitesse du parallax: {currentEffect.effectSpeed}
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={currentEffect.effectSpeed}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (showNewForm) {
                            setNewEffect({ ...newEffect, effectSpeed: value });
                          } else if (editingEffect) {
                            setEditingEffect({ ...editingEffect, effectSpeed: value });
                          }
                        }}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Plus la valeur est faible, plus l'effet est prononcé
                      </p>
                    </div>
                  )}

                  {currentEffect.effectType === 'zoom' && (
                    <div>
                      <label className="block font-semibold mb-2">
                        🔍 Scale du zoom: {currentEffect.effectScale}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="1.5"
                        step="0.1"
                        value={currentEffect.effectScale}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (showNewForm) {
                            setNewEffect({ ...newEffect, effectScale: value });
                          } else if (editingEffect) {
                            setEditingEffect({ ...editingEffect, effectScale: value });
                          }
                        }}
                        className="w-full"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold mb-2">📏 Hauteur minimale</label>
                    <input
                      type="text"
                      value={showNewForm ? newEffect.minHeight : editingEffect?.minHeight || '400px'}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (showNewForm) {
                          setNewEffect({ ...newEffect, minHeight: value });
                        } else if (editingEffect) {
                          setEditingEffect({ ...editingEffect, minHeight: value });
                        }
                      }}
                      className="w-full border border-gray-300 rounded px-4 py-2"
                      placeholder="400px ou 50vh"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">🎨 Overlay (couleur de fond)</label>
                    <input
                      type="text"
                      value={showNewForm ? newEffect.overlayColor || '' : editingEffect?.overlayColor || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (showNewForm) {
                          setNewEffect({ ...newEffect, overlayColor: value || null });
                        } else if (editingEffect) {
                          setEditingEffect({ ...editingEffect, overlayColor: value || null });
                        }
                      }}
                      className="w-full border border-gray-300 rounded px-4 py-2"
                      placeholder="rgba(0,0,0,0.3) ou transparent"
                    />
                    <div className="flex gap-2 mt-2">
                      {['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.4)', 'rgba(255,140,66,0.3)', 'transparent'].map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            if (showNewForm) {
                              setNewEffect({ ...newEffect, overlayColor: color === 'transparent' ? null : color });
                            } else if (editingEffect) {
                              setEditingEffect({ ...editingEffect, overlayColor: color === 'transparent' ? null : color });
                            }
                          }}
                          className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-2">🔢 Ordre</label>
                      <input
                        type="number"
                        value={showNewForm ? newEffect.order : editingEffect?.order || 0}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (showNewForm) {
                            setNewEffect({ ...newEffect, order: value });
                          } else if (editingEffect) {
                            setEditingEffect({ ...editingEffect, order: value });
                          }
                        }}
                        className="w-full border border-gray-300 rounded px-4 py-2"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showNewForm ? newEffect.isVisible : editingEffect?.isVisible ?? true}
                          onChange={(e) => {
                            const value = e.target.checked;
                            if (showNewForm) {
                              setNewEffect({ ...newEffect, isVisible: value });
                            } else if (editingEffect) {
                              setEditingEffect({ ...editingEffect, isVisible: value });
                            }
                          }}
                          className="w-5 h-5"
                        />
                        <span className="font-semibold">👁️ Visible</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">📝 Texte alternatif (alt)</label>
                    <input
                      type="text"
                      value={showNewForm ? newEffect.alt || '' : editingEffect?.alt || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (showNewForm) {
                          setNewEffect({ ...newEffect, alt: value || null });
                        } else if (editingEffect) {
                          setEditingEffect({ ...editingEffect, alt: value || null });
                        }
                      }}
                      className="w-full border border-gray-300 rounded px-4 py-2"
                      placeholder="Description de l'image"
                    />
                  </div>
                </div>

                {/* Colonne droite : Prévisualisation */}
                <div>
                  <h3 className="font-bold mb-3">👁️ Prévisualisation</h3>
                  <div className="bg-gray-100 rounded-lg p-4 relative overflow-hidden" style={{ minHeight: currentEffect.minHeight }}>
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: currentEffect.imageUrl ? `url(${currentEffect.imageUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: currentEffect.imageUrl ? 'transparent' : '#e5e7eb',
                      }}
                    />
                    {currentEffect.overlayColor && (
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: currentEffect.overlayColor }}
                      />
                    )}
                    <div className="relative z-10 text-white text-center flex items-center justify-center h-full">
                      <div>
                        <p className="text-sm font-semibold mb-2">Effet: {currentEffect.effectType}</p>
                        {!currentEffect.imageUrl && (
                          <p className="text-xs">Aucune image sélectionnée</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 bg-white border border-gray-200 rounded p-3 text-xs">
                    <p className="font-semibold mb-1">💡 Informations :</p>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Section: <code className="bg-gray-100 px-1 rounded">{currentEffect.sectionKey || '(vide)'}</code></li>
                      <li>• Effet: <strong>{currentEffect.effectType}</strong></li>
                      {currentEffect.effectType === 'parallax' && (
                        <li>• Vitesse: {currentEffect.effectSpeed}</li>
                      )}
                      {currentEffect.effectType === 'zoom' && (
                        <li>• Scale: {currentEffect.effectScale}</li>
                      )}
                      <li>• Hauteur: {currentEffect.minHeight}</li>
                      <li>• Overlay: {currentEffect.overlayColor || 'Aucun'}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6 pt-4 border-t-2 border-gray-300">
                <button
                  onClick={() => {
                    if (editingEffect) {
                      saveEffect(editingEffect);
                    } else {
                      createEffect();
                    }
                  }}
                  disabled={saving}
                  className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50"
                >
                  {saving ? 'Sauvegarde...' : editingEffect ? '💾 Sauvegarder' : '➕ Créer'}
                </button>
                <button
                  onClick={() => {
                    setEditingEffect(null);
                    setShowNewForm(false);
                    setNewEffect({ ...newEffectTemplate, pageKey: selectedPage });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Liste des effets existants */}
          {imageEffects.length === 0 && !showNewForm && !editingEffect ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-600 mb-2">Aucun effet d'image sur cette page</p>
              <p className="text-sm text-gray-500">Cliquez sur "Nouvel effet" pour commencer</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {imageEffects
                .sort((a, b) => a.order - b.order)
                .map((effect) => (
                  <div
                    key={effect.id}
                    className={`border-2 rounded-lg p-4 hover:shadow-lg transition ${
                      effect.isVisible ? 'border-gray-200 bg-white' : 'border-gray-300 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{effect.sectionKey}</h3>
                        <p className="text-xs text-gray-500">
                          Ordre: {effect.order} • {effect.isVisible ? '👁️ Visible' : '🙈 Masqué'}
                        </p>
                      </div>
                      <span className="text-2xl">
                        {effectTypes.find(t => t.value === effect.effectType)?.label.split(' ')[0]}
                      </span>
                    </div>

                    <div className="mb-3 relative h-24 bg-gray-200 rounded overflow-hidden">
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${effect.imageUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                      {effect.overlayColor && (
                        <div
                          className="absolute inset-0"
                          style={{ backgroundColor: effect.overlayColor }}
                        />
                      )}
                    </div>

                    <div className="text-xs text-gray-600 mb-3 space-y-1">
                      <p><strong>Effet:</strong> {effect.effectType}</p>
                      {effect.effectType === 'parallax' && (
                        <p><strong>Vitesse:</strong> {effect.effectSpeed}</p>
                      )}
                      {effect.effectType === 'zoom' && (
                        <p><strong>Scale:</strong> {effect.effectScale}</p>
                      )}
                      <p><strong>Hauteur:</strong> {effect.minHeight}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingEffect(effect);
                          setShowNewForm(false);
                        }}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => deleteEffect(effect.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal d'upload d'image */}
      <ImageUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onImageSelected={(imageUrl) => {
          if (showNewForm) {
            setNewEffect({ ...newEffect, imageUrl });
          } else if (editingEffect) {
            setEditingEffect({ ...editingEffect, imageUrl });
          }
          setUploadModalOpen(false);
        }}
      />

      {/* Modal de sélection de section visuelle */}
      <VisualSectionSelector
        isOpen={sectionSelectorOpen}
        onClose={() => setSectionSelectorOpen(false)}
        currentPageKey={selectedPage}
        onSelect={(sectionKey) => {
          if (showNewForm) {
            setNewEffect({ ...newEffect, sectionKey });
          } else if (editingEffect) {
            setEditingEffect({ ...editingEffect, sectionKey });
          }
          setSectionSelectorOpen(false);
        }}
      />
    </div>
  );
}
