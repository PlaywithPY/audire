'use client';

// src/components/admin/BlockInspector.tsx
// Inspecteur flottant. Modes selon le format de blockKey :
//   "faq.hero-title"          → page text
//   "faq-item:42:question"    → FAQ item
//   "faq-item:42:answer"      → FAQ item
//   "faq-category:3:name"     → catégorie
//   "faq-category:3:description" / ":imageUrl"

import { useEffect, useRef, useState } from 'react';
import { X, Type, HelpCircle, FolderOpen } from 'lucide-react';

export type SelectedBlock = {
  blockKey: string;
  rect: { x: number; y: number; width: number; height: number };
  data: { text?: string; [k: string]: unknown };
};

interface Props {
  selected: SelectedBlock;
  iframeRect: { x: number; y: number };
  onChange: (text: string) => void;
  onCommit: (before: string, after: string) => void;
  onClose: () => void;
}

type Mode =
  | { kind: 'page-text'; pageKey: string; textKey: string }
  | { kind: 'faq-item'; id: string; field: 'question' | 'answer' }
  | { kind: 'faq-category'; id: string; field: 'name' | 'description' | 'imageUrl' }
  | { kind: 'unknown' };

function parseBlockKey(blockKey: string): Mode {
  if (blockKey.startsWith('faq-item:')) {
    const [, id, field] = blockKey.split(':');
    if (id && (field === 'question' || field === 'answer')) return { kind: 'faq-item', id, field };
  }
  if (blockKey.startsWith('faq-category:')) {
    const [, id, field] = blockKey.split(':');
    if (id && (field === 'name' || field === 'description' || field === 'imageUrl')) {
      return { kind: 'faq-category', id, field };
    }
  }
  if (blockKey.includes('.')) {
    const [pageKey, ...rest] = blockKey.split('.');
    return { kind: 'page-text', pageKey, textKey: rest.join('.') };
  }
  return { kind: 'unknown' };
}

const ICON: Record<Mode['kind'], React.ComponentType<{ className?: string }>> = {
  'page-text': Type,
  'faq-item': HelpCircle,
  'faq-category': FolderOpen,
  'unknown': Type,
};

const LABEL: Record<Mode['kind'], string> = {
  'page-text': 'Texte de page',
  'faq-item': 'Question FAQ',
  'faq-category': 'Catégorie FAQ',
  'unknown': 'Bloc',
};

export default function BlockInspector({ selected, iframeRect, onChange, onCommit, onClose }: Props) {
  const [text, setText] = useState(selected.data.text ?? '');
  const before = useRef(selected.data.text ?? '');
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setText(selected.data.text ?? '');
    before.current = selected.data.text ?? '';
  }, [selected.blockKey]);

  const mode = parseBlockKey(selected.blockKey);
  const Icon = ICON[mode.kind];

  function handleChange(value: string) {
    setText(value);
    onChange(value);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      onCommit(before.current, value);
      before.current = value;
    }, 600);
  }

  // Position : à droite du bloc, fallback à gauche, fallback en bas
  const inspectorWidth = 340;
  const margin = 12;
  const blockRight = iframeRect.x + selected.rect.x + selected.rect.width;
  const blockLeft  = iframeRect.x + selected.rect.x;
  const blockTop   = iframeRect.y + selected.rect.y;

  let left = blockRight + margin;
  if (left + inspectorWidth > window.innerWidth - 8) {
    left = blockLeft - inspectorWidth - margin;
    if (left < 8) left = window.innerWidth - inspectorWidth - 8;
  }
  let top = Math.max(8, blockTop);
  if (top + 260 > window.innerHeight) top = window.innerHeight - 268;

  const isImageField = mode.kind === 'faq-category' && mode.field === 'imageUrl';
  const isLongField  = (mode.kind === 'faq-item' && mode.field === 'answer') || (mode.kind === 'faq-category' && mode.field === 'description');
  const rows = isLongField ? 6 : 2;

  return (
    <div
      className="fixed bg-white border border-gray-200 rounded-xl shadow-2xl z-50 flex flex-col"
      style={{ left, top, width: inspectorWidth }}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold text-gray-700">{LABEL[mode.kind]}</div>
          <div className="text-[10px] font-mono text-gray-400 truncate">{selected.blockKey}</div>
        </div>
        <button type="button" onClick={onClose} className="w-6 h-6 grid place-items-center rounded hover:bg-gray-100 text-gray-500">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3">
        {mode.kind === 'unknown' ? (
          <div className="text-[12px] text-amber-700 bg-amber-50 p-2 rounded">
            Format de blockKey non reconnu. Convention attendue :<br/>
            <code className="text-[10px]">page.cle</code>, <code className="text-[10px]">faq-item:ID:champ</code>, <code className="text-[10px]">faq-category:ID:champ</code>
          </div>
        ) : (
          <>
            <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">
              {mode.kind === 'page-text' && 'Contenu'}
              {mode.kind === 'faq-item' && (mode.field === 'question' ? 'Question' : 'Réponse')}
              {mode.kind === 'faq-category' && (
                mode.field === 'name' ? 'Nom' :
                mode.field === 'description' ? 'Description' : 'URL de l\'image'
              )}
            </label>
            {isImageField ? (
              <input
                type="url"
                value={text}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="https://..."
                className="w-full text-[13px] p-2 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
                autoFocus
              />
            ) : (
              <textarea
                value={text}
                onChange={(e) => handleChange(e.target.value)}
                rows={Math.min(10, Math.max(rows, text.split('\n').length))}
                className="w-full text-[13px] p-2 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 resize-y"
                autoFocus
              />
            )}
            <div className="mt-2 text-[11px] text-gray-400 flex items-center justify-between">
              <span>Modification en brouillon — cliquez Publier pour valider</span>
              <span className="font-mono">⌘Z</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
