'use client';

// src/components/admin/BlockInspector.tsx
// Inspecteur flottant qui apparaît à côté du bloc sélectionné dans l'iframe.
// Permet l'édition inline du texte avec auto-save vers /api/page-texts.

import { useEffect, useRef, useState } from 'react';
import { X, Type } from 'lucide-react';

export type SelectedBlock = {
  blockKey: string; // ex: "faq.hero-title"
  rect: { x: number; y: number; width: number; height: number };
  data: { text?: string; [k: string]: unknown };
};

interface BlockInspectorProps {
  selected: SelectedBlock;
  iframeRect: { x: number; y: number };
  onChange: (newText: string) => void;          // appelé en live (pour preview)
  onCommit: (before: string, after: string) => void; // appelé après debounce (pour history)
  onClose: () => void;
}

export default function BlockInspector({
  selected, iframeRect, onChange, onCommit, onClose,
}: BlockInspectorProps) {
  const [text, setText] = useState(selected.data.text ?? '');
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const before = useRef(selected.data.text ?? '');
  const debounceRef = useRef<number | null>(null);

  // Reset quand on change de bloc sélectionné
  useEffect(() => {
    setText(selected.data.text ?? '');
    before.current = selected.data.text ?? '';
    setSavingState('idle');
  }, [selected.blockKey]);

  // Décompose la blockKey "faq.hero-title" → { pageKey: "faq", key: "hero-title" }
  const [pageKey, ...keyParts] = selected.blockKey.split('.');
  const textKey = keyParts.join('.');

  function handleChange(value: string) {
    setText(value);
    onChange(value);

    // Auto-save debounced
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    setSavingState('saving');
    debounceRef.current = window.setTimeout(() => save(value), 600);
  }

  async function save(value: string) {
    try {
      const res = await fetch('/api/page-texts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageKey, textKey, content: value }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      setSavingState('saved');
      onCommit(before.current, value);
      before.current = value;
    } catch (e) {
      console.error('Save failed', e);
      setSavingState('error');
    }
  }

  // Position de l'inspecteur : à droite du bloc, sinon à gauche, sinon en bas
  const inspectorWidth = 320;
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
  if (top + 240 > window.innerHeight) top = window.innerHeight - 248;

  return (
    <div
      className="fixed bg-white border border-gray-200 rounded-xl shadow-2xl z-50 flex flex-col"
      style={{ left, top, width: inspectorWidth }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
        <Type className="w-3.5 h-3.5 text-gray-400" />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-mono text-gray-500 truncate">{selected.blockKey}</div>
        </div>
        <SaveDot state={savingState} />
        <button
          type="button"
          onClick={onClose}
          className="w-6 h-6 grid place-items-center rounded hover:bg-gray-100 text-gray-500"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-3">
        <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">
          Contenu
        </label>
        <textarea
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          rows={Math.min(8, Math.max(2, text.split('\n').length))}
          className="w-full text-[13px] p-2 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 resize-y"
          autoFocus
        />
        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
          <span>
            {savingState === 'saving' && 'Enregistrement…'}
            {savingState === 'saved'  && '✓ Enregistré'}
            {savingState === 'error'  && '⚠ Erreur — réessayez'}
            {savingState === 'idle'   && `${text.length} caractères`}
          </span>
          <span className="font-mono">⌘Z annuler</span>
        </div>
      </div>
    </div>
  );
}

function SaveDot({ state }: { state: 'idle' | 'saving' | 'saved' | 'error' }) {
  const color =
    state === 'saving' ? 'bg-amber-500 animate-pulse' :
    state === 'saved'  ? 'bg-green-500' :
    state === 'error'  ? 'bg-red-500' : 'bg-gray-300';
  return <span className={`w-1.5 h-1.5 rounded-full ${color}`} />;
}
