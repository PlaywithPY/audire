'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';
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

  function renderFieldPreview(field: ContentField) {
    const value = contentValues[field.key] ?? field.defaultValue;

    switch (field.type) {
      case 'text':
      case 'badge':
        return (
          <div className="bg-gray-50 rounded p-3 text-sm text-gray-700">
            {value || <span className="text-gray-400 italic">Non défini</span>}
          </div>
        );

      case 'textarea':
        return (
          <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 whitespace-pre-wrap">
            {value || <span className="text-gray-400 italic">Non défini</span>}
          </div>
        );

      case 'array-pills':
        return (
          <div className="flex flex-wrap gap-2">
            {(value || []).map((pill: string, idx: number) => (
              <span
                key={idx}
                className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
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
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {cta.text}
              </button>
            ))}
          </div>
        );

      case 'image':
        return (
          <div className="bg-gray-100 rounded p-6 text-center">
            <div className="text-4xl mb-2">🖼️</div>
            <p className="text-xs text-gray-500">
              {field.helpText}
            </p>
          </div>
        );

      case 'reference':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <div className="flex items-center gap-2 text-blue-700">
              <span className="text-2xl">🔗</span>
              <div className="text-sm">
                <div className="font-semibold">Contenu référencé</div>
                <div className="text-xs text-blue-600">
                  {field.helpText}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500 italic">
            Type de champ non supporté: {field.type}
          </div>
        );
    }
  }

  function renderEditModal() {
    if (!editingField) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">✏️ {editingField.label}</h2>
              <p className="text-sm text-gray-600">{editingField.helpText}</p>
            </div>
            <button
              onClick={() => {
                setEditingField(null);
                setEditingValue(null);
              }}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {editingField.type === 'text' && (
              <input
                type="text"
                value={editingValue || ''}
                onChange={(e) => setEditingValue(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={editingField.placeholder}
              />
            )}

            {editingField.type === 'badge' && (
              <input
                type="text"
                value={editingValue || ''}
                onChange={(e) => setEditingValue(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={editingField.placeholder}
              />
            )}

            {editingField.type === 'textarea' && (
              <textarea
                value={editingValue || ''}
                onChange={(e) => setEditingValue(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                rows={editingField.rows || 5}
                placeholder={editingField.placeholder}
              />
            )}

            {editingField.type === 'array-pills' && (
              <div className="space-y-3">
                {(editingValue || []).map((pill: string, idx: number) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={pill}
                      onChange={(e) => {
                        const newPills = [...editingValue];
                        newPills[idx] = e.target.value;
                        setEditingValue(newPills);
                      }}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder={`Capsule ${idx + 1}`}
                    />
                    <button
                      onClick={() => {
                        const newPills = editingValue.filter((_: any, i: number) => i !== idx);
                        setEditingValue(newPills);
                      }}
                      className="text-red-500 hover:text-red-700 px-3"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setEditingValue([...(editingValue || []), '']);
                  }}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg px-4 py-2 text-gray-600 hover:border-primary hover:text-primary"
                >
                  ➕ Ajouter une capsule
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => saveField(editingField, editingValue)}
              disabled={saving}
              className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50"
            >
              {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
            </button>
            <button
              onClick={() => {
                setEditingField(null);
                setEditingValue(null);
              }}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
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

  const pageStructures = getAllPageStructures();
  const activeStructure = getPageStructure(activePageKey);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminHeader currentPage="linear-content-editor" title="📋 Éditeur de Contenu Linéaire" />

      <div className="container mx-auto px-6 py-8">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold mb-2">📖 Nouveau système d'édition</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✨ Tous les éléments sont organisés dans l'ordre exact d'affichage</li>
            <li>🎯 Éditez chaque élément individuellement en suivant le flow de la page</li>
            <li>🔄 Les modifications sont sauvegardées immédiatement</li>
            <li>📝 Supporte textes, badges, capsules, boutons, images et références</li>
          </ul>
        </div>

        {/* Onglets des pages */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {pageStructures.map((pageStruct) => (
              <button
                key={pageStruct.pageKey}
                onClick={() => setActivePageKey(pageStruct.pageKey)}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${
                  activePageKey === pageStruct.pageKey
                    ? 'border-b-2 border-primary text-primary bg-blue-50'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`}
              >
                {pageStruct.pageLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des champs dans l'ordre */}
        <div className="space-y-6">
          {activeStructure?.fields.map((field, index) => (
            <div
              key={field.key}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-gray-300">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-lg font-bold text-gray-800">{field.label}</h3>
                  </div>
                  <div className="flex items-center gap-2 ml-12">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                      {field.key}
                    </code>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {field.type}
                    </span>
                  </div>
                  {field.helpText && (
                    <p className="text-sm text-gray-500 mt-2 ml-12">{field.helpText}</p>
                  )}
                </div>
              </div>

              {/* Preview du contenu */}
              <div className="mb-4">
                {renderFieldPreview(field)}
              </div>

              {/* Bouton d'édition */}
              {!['reference', 'image'].includes(field.type) && (
                <button
                  onClick={() => openEditModal(field)}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  ✏️ Modifier
                </button>
              )}

              {field.type === 'reference' && (
                <div className="text-sm text-gray-500 italic text-center">
                  Géré via {field.config?.referenceType}
                </div>
              )}

              {field.type === 'image' && (
                <button
                  onClick={() => {
                    window.open('/admin/mediatheque', '_blank');
                  }}
                  className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors font-medium"
                >
                  🖼️ Gérer l'image
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal d'édition */}
      {renderEditModal()}
    </div>
  );
}
