'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

/**
 * Définition des sections visuelles par page
 * Une section visuelle correspond à une zone de la page avec un background distinct
 */
const PAGE_SECTIONS: Record<string, { key: string; label: string; description: string; bgColor: string }[]> = {
  home: [
    { key: 'after-hero', label: 'Après la section Hero', description: 'Entre le bloc dégradé principal et la section blanche "Pourquoi choisir Audire"', bgColor: 'Dégradé → #ffffff' },
    { key: 'after-features', label: 'Après les Features', description: 'Entre la section blanche "Pourquoi choisir Audire" et les Témoignages', bgColor: '#ffffff → #f8fbff' },
    { key: 'after-testimonials', label: 'Après les Témoignages', description: 'Entre les témoignages (#f8fbff) et la section CTA', bgColor: '#f8fbff → dégradé' },
  ],
  'solutions-auditives': [
    { key: 'after-hero', label: 'Après la section Hero', description: 'Entre le titre principal et la grille des solutions', bgColor: 'Dégradé → #ffffff' },
    { key: 'after-solutions-grid', label: 'Après la grille de solutions', description: 'Entre la grille des solutions et la section suivante', bgColor: '#ffffff → #f8fbff' },
  ],
  'test-auditif-gratuit': [
    { key: 'after-hero', label: 'Après la section Hero', description: 'Entre le titre principal et le contenu', bgColor: 'Dégradé → #ffffff' },
    { key: 'after-content', label: 'Après le contenu principal', description: 'Entre le contenu et la section CTA', bgColor: '#ffffff → #f8fbff' },
  ],
  'notre-accompagnement': [
    { key: 'after-hero', label: 'Après la section Hero', description: 'Entre le titre principal et le contenu', bgColor: 'Dégradé → #ffffff' },
    { key: 'after-content', label: 'Après le contenu principal', description: 'Entre le contenu et la section CTA', bgColor: '#ffffff → #f8fbff' },
  ],
  'remboursements': [
    { key: 'after-hero', label: 'Après la section Hero', description: 'Entre le titre principal et le contenu', bgColor: 'Dégradé → #ffffff' },
    { key: 'after-content', label: 'Après le contenu principal', description: 'Entre le contenu et la section CTA', bgColor: '#ffffff → #f8fbff' },
  ],
  'faq': [
    { key: 'after-hero', label: 'Après la section Hero', description: 'Entre le titre principal et les questions', bgColor: 'Dégradé → #ffffff' },
  ],
  'contact': [
    { key: 'after-hero', label: 'Après la section Hero', description: 'Entre le titre principal et le formulaire', bgColor: 'Dégradé → #ffffff' },
  ],
  'partenaires-pharmaciens': [
    { key: 'after-hero', label: 'Après la section Hero', description: 'Entre le titre principal et le contenu', bgColor: 'Dégradé → #ffffff' },
    { key: 'after-content', label: 'Après le contenu principal', description: 'Entre le contenu et la section CTA', bgColor: '#ffffff → #f8fbff' },
  ],
};

type VisualSection = {
  key: string;
  label: string;
  description: string;
  bgColor: string;
};

type VisualSectionSelectorProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (sectionKey: string) => void;
  currentPageKey: string;
};

export default function VisualSectionSelector({
  isOpen,
  onClose,
  onSelect,
  currentPageKey,
}: VisualSectionSelectorProps) {
  const [selectedSection, setSelectedSection] = useState<VisualSection | null>(null);

  if (!isOpen) return null;

  const sections = PAGE_SECTIONS[currentPageKey] || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold">📐 Sélectionner une section visuelle</h2>
            <p className="text-sm text-gray-600 mt-1">
              Sections de la page "{currentPageKey}" (basées sur les backgrounds)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Instructions */}
        <div className="p-6 bg-blue-50 border-b border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2">💡 Comment ça marche ?</h3>
          <p className="text-sm text-blue-800">
            Les "sections visuelles" correspondent aux grandes zones de la page avec des couleurs de fond distinctes.
            Par exemple, sur la page d'accueil :
          </p>
          <ul className="text-sm text-blue-800 mt-2 space-y-1">
            <li>• <strong>Bloc 1</strong> : fond dégradé (section Hero)</li>
            <li>• <strong>Bloc 2</strong> : fond blanc #ffffff (section Features)</li>
            <li>• <strong>Bloc 3</strong> : fond #f8fbff (Témoignages)</li>
            <li>• Et ainsi de suite...</li>
          </ul>
          <p className="text-sm text-blue-800 mt-2">
            Votre image sera affichée <strong>entre deux blocs</strong>, créant une transition visuelle élégante.
          </p>
        </div>

        {/* Sections grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {sections.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-gray-500">Aucune section visuelle définie pour cette page</p>
              <p className="text-sm text-gray-400 mt-2">
                Les sections visuelles seront ajoutées au fur et à mesure
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {sections.map((section) => (
                <button
                  key={section.key}
                  onClick={() => setSelectedSection(section)}
                  className={`text-left p-6 rounded-lg border-2 transition-all ${
                    selectedSection?.key === section.key
                      ? 'border-blue-600 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{section.label}</h3>
                      <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                    </div>
                    {selectedSection?.key === section.key && (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                  </div>

                  {/* Color indicator */}
                  <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Transition de couleur :</p>
                    <p className="text-sm text-gray-600 font-mono">{section.bgColor}</p>
                  </div>

                  {/* Section key */}
                  <div className="mt-3">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                      sectionKey: "{section.key}"
                    </code>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedSection ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Section sélectionnée : <strong>{selectedSection.label}</strong>
              </span>
            ) : (
              'Sélectionnez une section pour continuer'
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                if (selectedSection) {
                  onSelect(selectedSection.key);
                  onClose();
                }
              }}
              disabled={!selectedSection}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Utiliser cette section
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
