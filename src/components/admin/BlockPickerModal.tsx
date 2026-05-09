'use client';

// src/components/admin/BlockPickerModal.tsx
// Modal "Choisir un type de bloc" — déclenché par <InsertZone />.

import { useEffect } from 'react';
import { X, Type, AlignLeft, Image as ImageIcon, MousePointerClick, Minus, Move3d, LayoutGrid } from 'lucide-react';

export type BlockTypeOption = {
  blockType: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultContent?: string;
  defaultMetadata?: Record<string, any>;
};

const OPTIONS: BlockTypeOption[] = [
  { blockType: 'title',  label: 'Titre',         description: 'Un grand titre de section',
    icon: Type,             defaultContent: 'Nouveau titre' },
  { blockType: 'text',   label: 'Texte',         description: 'Un paragraphe de texte',
    icon: AlignLeft,        defaultContent: 'Tapez votre texte ici…' },
  { blockType: 'image',  label: 'Image',         description: 'Une image depuis la médiathèque',
    icon: ImageIcon,        defaultContent: '', defaultMetadata: { imageUrl: '' } },
  { blockType: 'button', label: 'Bouton',        description: 'Un appel à l\'action cliquable',
    icon: MousePointerClick, defaultContent: 'En savoir plus|/contact' },
  { blockType: 'card',   label: 'Carte',         description: 'Une carte avec icône + titre + description',
    icon: LayoutGrid,       defaultContent: 'Titre de la carte', defaultMetadata: { icon: '✨', description: 'Description courte' } },
  { blockType: 'spacer', label: 'Espace',        description: 'Un espacement vertical',
    icon: Move3d,           defaultContent: '', defaultMetadata: { height: 48 } },
  { blockType: 'divider', label: 'Séparateur',   description: 'Une ligne de séparation',
    icon: Minus,            defaultContent: '' },
  { blockType: 'html',   label: 'HTML libre',    description: 'Bloc HTML personnalisé (avancé)',
    icon: Type,             defaultContent: '<p>Contenu personnalisé</p>' },
];

type Props = {
  onClose: () => void;
  onPick: (option: BlockTypeOption) => void;
  busy?: boolean;
};

export default function BlockPickerModal({ onClose, onPick, busy }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-[640px] max-w-[92vw] max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Choisir un type de bloc</h3>
            <p className="text-xs text-gray-500">Le bloc sera inséré à l'endroit du clic.</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 grid place-items-center rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 p-5 overflow-y-auto">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.blockType}
                disabled={busy}
                onClick={() => onPick(opt)}
                className="group flex items-start gap-3 p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all text-left disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-gray-600 group-hover:text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-gray-900">{opt.label}</div>
                  <div className="text-xs text-gray-500 leading-snug mt-0.5">{opt.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {busy && (
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
            Création en cours…
          </div>
        )}
      </div>
    </div>
  );
}
