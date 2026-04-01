'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';
import MediaPicker from '@/components/MediaPicker';
import {
  getAllPageStructures,
  getPageStructure,
  ContentField,
  PageContentStructure
} from '@/lib/linear-content-structure';

type ContentValue = {
  pageKey: string;
  fieldKey: string;
  value: any;
  updatedAt?: string;
};

export default function LinearContentEditor() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activePageKey, setActivePageKey] = useState('home');
  const [contentValues, setContentValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingField, setEditingField] = useState<ContentField | null>(null);
  const [editingValue, setEditingValue] = useState<any>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [selectedFieldForImage, setSelectedFieldForImage] = useState<ContentField | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadContentValues();
    }
  }, [status, activePageKey]);

  async function loadContentValues() {
    setLoading(true);
    try {
      // Charger les valeurs existantes depuis l'API
      // Pour l'instant on utilise les PageTexts existants
      const res = await fetch(`/api/page-texts?pageKey=${activePageKey}`);
      if (res.ok) {
        const data = await res.json();
        // Mapper les anciennes clés vers les nouvelles
        const mappedData = mapOldKeysToNew(data, activePageKey);
        setContentValues(mappedData);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  }

  function mapOldKeysToNew(oldData: Record<string, string>, pageKey: string): Record<string, any> {
    const mapped: Record<string, any> = {};

    if (pageKey === 'home') {
      mapped.topBadge = oldData['hero-kicker'] || '';
      mapped.heroTitle = oldData['hero-title'] || '';
      mapped.heroDescription = oldData['description-1'] || '';
      mapped.heroPills = [
        oldData['chip-1'] || '',
        oldData['chip-2'] || '',
        oldData['chip-3'] || '',
        oldData['chip-4'] || ''
      ];
      mapped.heroFooterText = 'Vous hésitez ? Venez juste faire le point. Parfois la meilleure réponse est "pas maintenant" — et on vous le dira.';
      mapped.approachBadge = 'Notre approche';
      mapped.approachTitle = oldData['section-1-title'] || '';
      mapped.approachDescription = oldData['description-2'] || '';
      mapped.productsBadge = 'Nos solutions';
      mapped.productsTitle = 'Appareils auditifs mis en avant';
      mapped.productsDescription = 'Découvrez nos appareils auditifs recommandés pour une meilleure audition';
      mapped.productsLinkText = 'Voir toutes nos solutions auditives';
      mapped.ctaTitle = oldData['section-2-title'] || '';
      mapped.ctaDescription = oldData['description-3'] || '';
      mapped.ctaButtonText = '📅 Réserver maintenant';
      mapped.ctaFooterText = 'Test gratuit • Sans engagement • Conseils personnalisés';
    }

    if (pageKey === 'solutions-auditives') {
      mapped.heroTitle = oldData['hero-title'] || '';
      mapped.heroDescription = oldData['description-1'] || '';
      mapped.brandsBadge = 'Nos marques';
      mapped.brandsTitle = oldData['section-1-title'] || '';
      mapped.brandsDescription = oldData['description-2'] || '';
      mapped.typesBadge = 'Types d\'appareils';
      mapped.typesTitle = oldData['section-2-title'] || '';
      mapped.typesDescription = oldData['description-3'] || '';
      mapped.ctaBadge = 'Besoin d\'aide ?';
      mapped.ctaTitle = oldData['section-3-title'] || '';
      mapped.ctaDescription = oldData['description-4'] || '';
    }

    if (pageKey === 'remboursements') {
      mapped.heroTitle = oldData['hero-title'] || '';
      mapped.heroDescription = oldData['description-1'] || '';
      mapped.howBadge = 'Le système';
      mapped.howTitle = oldData['section-1-title'] || '';
      mapped.howDescription = oldData['description-2'] || '';
      mapped.inamiBadge = 'INAMI';
      mapped.inamiTitle = oldData['section-2-title'] || '';
      mapped.inamiDescription = oldData['description-3'] || '';
      mapped.ctaBadge = 'Besoin d\'aide ?';
      mapped.ctaTitle = oldData['section-3-title'] || '';
      mapped.ctaDescription = oldData['description-4'] || '';
    }

    if (pageKey === 'notre-accompagnement') {
      mapped.heroTitle = oldData['hero-title'] || '';
      mapped.heroDescription = oldData['description-1'] || '';
      mapped.processBadge = 'Le processus';
      mapped.processTitle = oldData['section-1-title'] || '';
      mapped.processDescription = oldData['description-2'] || '';
      mapped.differenceBadge = 'Nos atouts';
      mapped.differenceTitle = oldData['section-2-title'] || '';
      mapped.differenceDescription = oldData['description-3'] || '';
      mapped.ctaBadge = 'C\'est parti !';
      mapped.ctaTitle = oldData['section-3-title'] || '';
      mapped.ctaDescription = oldData['description-4'] || '';
    }

    if (pageKey === 'test-auditif-gratuit') {
      mapped.heroTitle = oldData['hero-title'] || '';
      mapped.heroDescription = oldData['description-1'] || '';
      mapped.whyBadge = 'Pourquoi ?';
      mapped.whyTitle = oldData['section-1-title'] || '';
      mapped.whyDescription = oldData['description-2'] || '';
      mapped.howBadge = 'Le déroulement';
      mapped.howTitle = oldData['section-2-title'] || '';
      mapped.howDescription = oldData['description-3'] || '';
      mapped.bookBadge = 'Réservez';
      mapped.bookTitle = oldData['section-3-title'] || '';
      mapped.bookDescription = oldData['description-4'] || '';
      mapped.contactBadge = 'Contact';
      mapped.contactTitle = oldData['section-4-title'] || '';
      mapped.contactDescription = oldData['description-5'] || '';
    }

    if (pageKey === 'contact') {
      mapped.heroTitle = oldData['hero-title'] || '';
      mapped.heroDescription = oldData['description-1'] || '';
      mapped.hoursBadge = 'Horaires';
      mapped.hoursTitle = oldData['section-1-title'] || '';
      mapped.hoursDescription = oldData['description-2'] || '';
      mapped.formBadge = 'Message';
      mapped.formTitle = oldData['section-2-title'] || '';
      mapped.formDescription = oldData['description-3'] || '';
    }

    if (pageKey === 'faq') {
      mapped.heroTitle = oldData['hero-title'] || '';
      mapped.heroDescription = oldData['description-1'] || '';
      mapped.ctaBadge = 'Besoin d\'aide ?';
      mapped.ctaTitle = oldData['section-1-title'] || '';
      mapped.ctaDescription = oldData['description-2'] || '';
    }

    if (pageKey === 'partenaires-pharmaciens') {
      mapped.heroTitle = oldData['hero-title'] || '';
      mapped.heroDescription = oldData['description-1'] || '';
      mapped.whyBadge = 'Avantages';
      mapped.whyTitle = oldData['section-1-title'] || '';
      mapped.whyDescription = oldData['description-2'] || '';
      mapped.howBadge = 'Processus';
      mapped.howTitle = oldData['section-2-title'] || '';
      mapped.howDescription = oldData['description-3'] || '';
      mapped.materialBadge = 'Matériel';
      mapped.materialTitle = oldData['section-3-title'] || '';
      mapped.materialDescription = oldData['description-4'] || '';
      mapped.ctaBadge = 'Rejoignez-nous';
      mapped.ctaTitle = oldData['section-4-title'] || '';
      mapped.ctaDescription = oldData['description-5'] || '';
    }

    return mapped;
  }

  async function saveField(field: ContentField, value: any) {
    setSaving(true);
    try {
      if (field.type === 'array-pills') {
        // Sauvegarder chaque pill individuellement
        for (let i = 0; i < value.length; i++) {
          const res = await fetch('/api/admin/page-texts', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pageKey: activePageKey,
              textKey: `chip-${i + 1}`,
              content: value[i],
              label: `Capsule ${i + 1}`
            })
          });

          if (!res.ok) {
            throw new Error(`Failed to save pill ${i + 1}`);
          }
        }
      } else {
        // Mapping vers l'ancienne structure
        const oldKey = getOldKeyFromNew(activePageKey, field.key);
        const textKey = oldKey || field.key;

        const res = await fetch('/api/admin/page-texts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageKey: activePageKey,
            textKey: textKey,
            content: value,
            label: field.label
          })
        });

        if (!res.ok) {
          throw new Error('Failed to save field');
        }
      }

      // Mettre à jour les valeurs locales
      setContentValues(prev => ({
        ...prev,
        [field.key]: value
      }));

      setEditingField(null);
      setEditingValue(null);

      // Recharger pour être sûr d'avoir les dernières données
      await loadContentValues();
    } catch (error) {
      console.error('Error saving field:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  function getOldKeyFromNew(pageKey: string, newKey: string): string | null {
    const mappings: Record<string, Record<string, string>> = {
      'home': {
        'topBadge': 'hero-kicker',
        'heroTitle': 'hero-title',
        'heroDescription': 'description-1',
        'approachTitle': 'section-1-title',
        'approachDescription': 'description-2',
        'ctaTitle': 'section-2-title',
        'ctaDescription': 'description-3',
      },
      'solutions-auditives': {
        'heroTitle': 'hero-title',
        'heroDescription': 'description-1',
        'brandsTitle': 'section-1-title',
        'brandsDescription': 'description-2',
        'typesTitle': 'section-2-title',
        'typesDescription': 'description-3',
        'ctaTitle': 'section-3-title',
        'ctaDescription': 'description-4',
      },
      'remboursements': {
        'heroTitle': 'hero-title',
        'heroDescription': 'description-1',
        'howTitle': 'section-1-title',
        'howDescription': 'description-2',
        'inamiTitle': 'section-2-title',
        'inamiDescription': 'description-3',
        'ctaTitle': 'section-3-title',
        'ctaDescription': 'description-4',
      },
      'notre-accompagnement': {
        'heroTitle': 'hero-title',
        'heroDescription': 'description-1',
        'processTitle': 'section-1-title',
        'processDescription': 'description-2',
        'differenceTitle': 'section-2-title',
        'differenceDescription': 'description-3',
        'ctaTitle': 'section-3-title',
        'ctaDescription': 'description-4',
      },
      'test-auditif-gratuit': {
        'heroTitle': 'hero-title',
        'heroDescription': 'description-1',
        'whyTitle': 'section-1-title',
        'whyDescription': 'description-2',
        'howTitle': 'section-2-title',
        'howDescription': 'description-3',
        'bookTitle': 'section-3-title',
        'bookDescription': 'description-4',
        'contactTitle': 'section-4-title',
        'contactDescription': 'description-5',
      },
      'contact': {
        'heroTitle': 'hero-title',
        'heroDescription': 'description-1',
        'hoursTitle': 'section-1-title',
        'hoursDescription': 'description-2',
        'formTitle': 'section-2-title',
        'formDescription': 'description-3',
      },
      'faq': {
        'heroTitle': 'hero-title',
        'heroDescription': 'description-1',
        'ctaTitle': 'section-1-title',
        'ctaDescription': 'description-2',
      },
      'partenaires-pharmaciens': {
        'heroTitle': 'hero-title',
        'heroDescription': 'description-1',
        'whyTitle': 'section-1-title',
        'whyDescription': 'description-2',
        'howTitle': 'section-2-title',
        'howDescription': 'description-3',
        'materialTitle': 'section-3-title',
        'materialDescription': 'description-4',
        'ctaTitle': 'section-4-title',
        'ctaDescription': 'description-5',
      },
    };

    return mappings[pageKey]?.[newKey] || null;
  }

  function openEditModal(field: ContentField) {
    setEditingField(field);
    setEditingValue(contentValues[field.key] ?? field.defaultValue);
  }

  function getFieldTypeColor(type: string) {
    const colors: Record<string, string> = {
      'text': 'from-blue-400 to-blue-600',
      'badge': 'from-purple-400 to-purple-600',
      'textarea': 'from-green-400 to-green-600',
      'array-pills': 'from-pink-400 to-pink-600',
      'array-ctas': 'from-orange-400 to-orange-600',
      'image': 'from-indigo-400 to-indigo-600',
      'reference': 'from-teal-400 to-teal-600',
    };
    return colors[type] || 'from-gray-400 to-gray-600';
  }

  function getFieldTypeIcon(type: string) {
    const icons: Record<string, string> = {
      'text': '📝',
      'badge': '🏷️',
      'textarea': '📄',
      'array-pills': '💊',
      'array-ctas': '🔘',
      'image': '🖼️',
      'reference': '🔗',
    };
    return icons[type] || '📋';
  }

  function renderFieldPreview(field: ContentField) {
    const value = contentValues[field.key] ?? field.defaultValue;

    switch (field.type) {
      case 'badge':
        return (
          <div className="inline-flex items-center gap-2 bg-primary/20 px-3 py-1.5 rounded-full text-xs font-medium text-primary">
            {value || <span className="text-gray-400 italic">Non défini</span>}
          </div>
        );

      case 'text':
        return (
          <div className="text-base text-gray-800 font-semibold">
            {value || <span className="text-gray-400 italic">Non défini</span>}
          </div>
        );

      case 'textarea':
        return (
          <div className="text-sm text-gray-700 leading-relaxed line-clamp-3">
            {value || <span className="text-gray-400 italic">Non défini</span>}
          </div>
        );

      case 'array-pills':
        return (
          <div className="flex flex-wrap gap-2">
            {(value || []).map((pill: string, idx: number) => (
              <span
                key={idx}
                className="bg-white/15 px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 border border-gray-200"
              >
                {pill || <span className="text-gray-400 italic">Vide</span>}
              </span>
            ))}
          </div>
        );

      case 'array-ctas':
        return (
          <div className="flex flex-wrap gap-2">
            {(value || []).map((cta: any, idx: number) => (
              <button
                key={idx}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  cta.style === 'primary'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {cta.text}
              </button>
            ))}
          </div>
        );

      case 'image':
        return (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>🖼️</span>
            <span>{field.helpText}</span>
          </div>
        );

      case 'reference':
        return (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>🔗</span>
            <span>{field.helpText}</span>
          </div>
        );

      default:
        return (
          <div className="text-xs text-gray-500 italic">
            Type de champ non supporté: {field.type}
          </div>
        );
    }
  }

  function renderEditModal() {
    if (!editingField) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-3xl p-10 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-purple-200 transform animate-slide-up">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl p-4 shadow-lg">
                <span className="text-4xl">{getFieldTypeIcon(editingField.type)}</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {editingField.label}
                </h2>
                <p className="text-gray-600 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-purple-200">
                  💡 {editingField.helpText}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingField(null);
                setEditingValue(null);
              }}
              className="text-gray-400 hover:text-red-500 text-4xl hover:rotate-90 transition-all transform hover:scale-110"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {editingField.type === 'text' && (
              <input
                type="text"
                value={editingValue || ''}
                onChange={(e) => setEditingValue(e.target.value)}
                className="w-full border-3 border-purple-300 rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-500 bg-white shadow-lg text-lg transition-all"
                placeholder={editingField.placeholder}
              />
            )}

            {editingField.type === 'badge' && (
              <input
                type="text"
                value={editingValue || ''}
                onChange={(e) => setEditingValue(e.target.value)}
                className="w-full border-3 border-purple-300 rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-500 bg-white shadow-lg text-lg transition-all"
                placeholder={editingField.placeholder}
              />
            )}

            {editingField.type === 'textarea' && (
              <textarea
                value={editingValue || ''}
                onChange={(e) => setEditingValue(e.target.value)}
                className="w-full border-3 border-green-300 rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-green-400 focus:border-green-500 bg-white shadow-lg text-lg transition-all"
                rows={editingField.rows || 5}
                placeholder={editingField.placeholder}
              />
            )}

            {editingField.type === 'array-pills' && (
              <div className="space-y-4">
                {(editingValue || []).map((pill: string, idx: number) => (
                  <div key={idx} className="flex gap-3 items-center bg-white rounded-xl p-2 shadow-lg border-2 border-pink-200 hover:border-pink-400 transition-all">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-md">
                      {idx + 1}
                    </div>
                    <input
                      type="text"
                      value={pill}
                      onChange={(e) => {
                        const newPills = [...editingValue];
                        newPills[idx] = e.target.value;
                        setEditingValue(newPills);
                      }}
                      className="flex-1 border-2 border-pink-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-4 focus:ring-pink-400 bg-white text-lg"
                      placeholder={`Capsule ${idx + 1}`}
                    />
                    <button
                      onClick={() => {
                        const newPills = editingValue.filter((_: any, i: number) => i !== idx);
                        setEditingValue(newPills);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-3 transition-all transform hover:scale-110 shadow-lg"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setEditingValue([...(editingValue || []), '']);
                  }}
                  className="w-full border-3 border-dashed border-pink-400 rounded-xl px-6 py-4 text-pink-600 hover:border-pink-600 hover:text-pink-700 hover:bg-pink-50 transition-all font-bold text-lg shadow-lg"
                >
                  ➕ Ajouter une capsule
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-8 pt-8 border-t-4 border-purple-200">
            <button
              onClick={() => saveField(editingField, editingValue)}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-5 rounded-2xl font-bold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 text-lg flex items-center justify-center gap-3"
            >
              <span className="text-2xl">{saving ? '⏳' : '💾'}</span>
              <span>{saving ? 'Sauvegarde en cours...' : 'Sauvegarder les modifications'}</span>
            </button>
            <button
              onClick={() => {
                setEditingField(null);
                setEditingValue(null);
              }}
              className="flex-1 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 px-8 py-5 rounded-2xl font-bold hover:from-gray-400 hover:to-gray-500 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 text-lg flex items-center justify-center gap-3"
            >
              <span className="text-2xl">❌</span>
              <span>Annuler</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin text-8xl mb-6">🎨</div>
            <div className="absolute inset-0 animate-ping opacity-50">
              <div className="text-8xl">✨</div>
            </div>
          </div>
          <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Chargement de la magie...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const pageStructures = getAllPageStructures();
  const activeStructure = getPageStructure(activePageKey);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <AdminHeader currentPage="linear-content-editor" title="✨ Éditeur de Contenu Linéaire" />

      <div className="container mx-auto px-6 py-8">
        {/* Instructions */}
        <div className="bg-gradient-to-r from-purple-100 via-blue-100 to-pink-100 border-2 border-purple-200 rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white rounded-full p-3 shadow-md">
              <span className="text-3xl">🎨</span>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Nouveau système d'édition
            </h2>
          </div>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-lg p-3 hover:bg-white/80 transition-all">
              <span className="text-xl flex-shrink-0">✨</span>
              <span className="font-medium">Tous les éléments sont organisés dans l'ordre exact d'affichage</span>
            </li>
            <li className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-lg p-3 hover:bg-white/80 transition-all">
              <span className="text-xl flex-shrink-0">🎯</span>
              <span className="font-medium">Éditez chaque élément individuellement en suivant le flow de la page</span>
            </li>
            <li className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-lg p-3 hover:bg-white/80 transition-all">
              <span className="text-xl flex-shrink-0">🔄</span>
              <span className="font-medium">Les modifications sont sauvegardées immédiatement</span>
            </li>
            <li className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-lg p-3 hover:bg-white/80 transition-all">
              <span className="text-xl flex-shrink-0">📝</span>
              <span className="font-medium">Supporte textes, badges, capsules, boutons, images et références</span>
            </li>
          </ul>
        </div>

        {/* Onglets des pages */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden border border-purple-100">
          <div className="flex border-b-2 border-purple-100 overflow-x-auto bg-gradient-to-r from-purple-50 to-pink-50">
            {pageStructures.map((pageStruct, idx) => (
              <button
                key={pageStruct.pageKey}
                onClick={() => setActivePageKey(pageStruct.pageKey)}
                className={`px-6 py-4 font-bold whitespace-nowrap transition-all transform hover:scale-105 ${
                  activePageKey === pageStruct.pageKey
                    ? 'border-b-4 border-purple-500 text-purple-700 bg-white shadow-lg -mb-0.5'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-xl">{['🏠', '🎧', '💰', '🤝', '📋', '📞', '❓', '🏥'][idx % 8]}</span>
                  {pageStruct.pageLabel}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Liste des champs dans l'ordre */}
        <div className="space-y-3">
          {activeStructure?.fields.map((field, index) => (
            <div
              key={field.key}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-all border-l-4"
              style={{
                borderLeftColor: `hsl(${(index * 40) % 360}, 70%, 60%)`
              }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3 flex-grow min-w-0">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl flex-shrink-0">{getFieldTypeIcon(field.type)}</span>
                    <h3 className="text-base font-bold text-gray-800 truncate">
                      {field.label}
                    </h3>
                  </div>
                  <span className={`text-xs bg-gradient-to-r ${getFieldTypeColor(field.type)} text-white px-2 py-1 rounded-full font-medium shadow-sm flex-shrink-0`}>
                    {field.type}
                  </span>
                </div>

                {/* Bouton d'édition intégré dans le header */}
                {!['reference', 'image'].includes(field.type) && (
                  <button
                    onClick={() => openEditModal(field)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all text-sm font-semibold flex items-center gap-1.5 flex-shrink-0"
                  >
                    <span>✏️</span>
                    <span>Modifier</span>
                  </button>
                )}

                {field.type === 'image' && (
                  <button
                    onClick={() => {
                      setSelectedFieldForImage(field);
                      setIsMediaPickerOpen(true);
                    }}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-all text-sm font-semibold flex items-center gap-1.5 flex-shrink-0"
                  >
                    <span>🖼️</span>
                    <span>Image</span>
                  </button>
                )}
              </div>

              {/* Preview du contenu */}
              <div className="ml-11">
                {renderFieldPreview(field)}
              </div>

              {field.type === 'reference' && (
                <div className="ml-11 mt-2 text-sm text-teal-700 bg-teal-50 rounded px-3 py-1.5 inline-flex items-center gap-1.5">
                  <span>🔧</span>
                  <span>Géré via {field.config?.referenceType}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal d'édition */}
      {renderEditModal()}

      {/* MediaPicker pour sélectionner/uploader des images */}
      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => {
          setIsMediaPickerOpen(false);
          setSelectedFieldForImage(null);
        }}
        onSelect={(mediaUrl) => {
          if (selectedFieldForImage) {
            saveField(selectedFieldForImage, mediaUrl);
          }
          setIsMediaPickerOpen(false);
          setSelectedFieldForImage(null);
        }}
        currentMedia={selectedFieldForImage ? contentValues[selectedFieldForImage.key] : undefined}
        mediaType="image"
      />
    </div>
  );
}
