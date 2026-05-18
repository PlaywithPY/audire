'use client';

// src/components/admin/BlockInspector.tsx
// Sprint 5.5.1 — fix positionnement du panneau :
//  • mesure la hauteur réelle du panneau via useLayoutEffect → clamp précis
//  • max-height = viewport - 24px + overflow:auto interne → toujours scrollable
//  • si bloc proche du bas, le panneau "remonte" pour rester visible
//  • si pas de place ni à droite ni à gauche, recentre

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { X, Type, HelpCircle, FolderOpen, Image as ImageIcon, Layout, Boxes } from 'lucide-react';
import MediaPicker from '@/components/MediaPicker';
import LayoutPanel from './LayoutPanel';
import RichTextEditor from './RichTextEditor';
import DynamicBlockInspector from './DynamicBlockInspector';
import ImageEffectInspector from './ImageEffectInspector';

export type SelectedBlock = {
  blockKey: string;
  rect: { x: number; y: number; width: number; height: number };
  data: { text?: string; [k: string]: unknown };
};

type Category = { id: number; name: string };

interface Props {
  selected: SelectedBlock;
  iframeRect: { x: number; y: number };
  onChange: (text: string) => void;
  onCommit: (before: string, after: string) => void;
  onClose: () => void;
  categories: Category[];
  faqCategoryId?: number | null;
  onFaqCategoryChange?: (categoryId: number | null) => void;
  onLayoutChanged?: () => void;
}

type Mode =
  | { kind: 'page-text'; pageKey: string; textKey: string }
  | { kind: 'faq-item'; id: string; field: 'question' | 'answer' }
  | { kind: 'faq-category'; id: string; field: 'name' | 'description' | 'imageUrl' }
  | { kind: 'dynamic'; id: number; field: string }
  | { kind: 'image-effect'; pageKey: string; sectionKey: string }
  | { kind: 'unknown' };

function parseBlockKey(blockKey: string): Mode {
  if (blockKey.startsWith('image-effect:')) {
    const [, pageKey, sectionKey] = blockKey.split(':');
    if (pageKey && sectionKey) return { kind: 'image-effect', pageKey, sectionKey };
  }
  if (blockKey.startsWith('dynamic:')) {
    const [, idStr, field = 'content'] = blockKey.split(':');
    const id = Number(idStr);
    if (Number.isFinite(id)) return { kind: 'dynamic', id, field };
  }
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
  'page-text': Type, 'faq-item': HelpCircle, 'faq-category': FolderOpen,
  'dynamic': Boxes, 'image-effect': ImageIcon, 'unknown': Type,
};
const LABEL: Record<Mode['kind'], string> = {
  'page-text': 'Texte de page', 'faq-item': 'Question FAQ', 'faq-category': 'Catégorie FAQ',
  'dynamic': 'Bloc dynamique', 'image-effect': 'Image de fond', 'unknown': 'Bloc',
};

function shouldUseRichEditor(textKey: string, currentText: string): boolean {
  if (/-(body|content|text|desc|description|intro|conclusion|sub|subtitle|paragraph|quote|citation|message|bio|story)$/i.test(textKey)) return true;
  if (/<\/?(p|strong|em|b|i|u|a|ul|ol|li|h[1-6]|br)\b/i.test(currentText)) return true;
  if (currentText && currentText.length > 120) return true;
  return false;
}

export default function BlockInspector({
  selected, iframeRect, onChange, onCommit, onClose,
  categories, faqCategoryId, onFaqCategoryChange, onLayoutChanged,
}: Props) {
  const [tab, setTab] = useState<'text' | 'layout'>('text');
  const [text, setText] = useState(selected.data.text ?? '');
  const [pickerOpen, setPickerOpen] = useState(false);
  const before = useRef(selected.data.text ?? '');
  const debounceRef = useRef<number | null>(null);

  // Sprint 5.5.1 — positionnement piloté en useLayoutEffect après mesure réelle
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; maxHeight: number }>({ left: 0, top: 0, maxHeight: 0 });

  useEffect(() => {
    setText(selected.data.text ?? '');
    before.current = selected.data.text ?? '';
    setTab('text');
  }, [selected.blockKey]);

  // Recalcul position dès qu'on change de bloc ou que la fenêtre bouge
  useLayoutEffect(() => {
    function compute() {
      const W = 380, M = 12, PAD = 12;
      const vw = window.innerWidth, vh = window.innerHeight;

      const blockLeft  = iframeRect.x + selected.rect.x;
      const blockRight = blockLeft + selected.rect.width;
      const blockTop   = iframeRect.y + selected.rect.y;

      // Espace à droite du bloc, sinon à gauche, sinon centré.
      let left = blockRight + M;
      if (left + W > vw - PAD) {
        // Pas la place à droite → essaie à gauche
        left = blockLeft - W - M;
      }
      // Clamp strict dans le viewport
      left = Math.max(PAD, Math.min(left, vw - W - PAD));

      // Hauteur disponible (viewport - 2*PAD)
      const maxHeight = Math.max(240, vh - 2 * PAD);

      // Position verticale : aligne sur le haut du bloc, mais clampée
      const panelHeight = panelRef.current?.offsetHeight ?? Math.min(560, maxHeight);
      let top = Math.max(PAD, blockTop);
      if (top + panelHeight > vh - PAD) {
        top = Math.max(PAD, vh - panelHeight - PAD);
      }

      setPos({ left, top, maxHeight });
    }

    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);

    // Recalcule après que le contenu interne ait fini de monter (pour la hauteur réelle)
    const t = setTimeout(compute, 50);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
      clearTimeout(t);
    };
  }, [selected.blockKey, selected.rect, iframeRect, tab]);

  const mode = parseBlockKey(selected.blockKey);
  const Icon = ICON[mode.kind];
  const canEditLayout = mode.kind === 'page-text' || mode.kind === 'dynamic';

  function handleChange(value: string) {
    setText(value); onChange(value);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      onCommit(before.current, value); before.current = value;
    }, 600);
  }
  function commitImmediate(value: string) {
    setText(value); onChange(value); onCommit(before.current, value); before.current = value;
  }

  const isImageField = mode.kind === 'faq-category' && mode.field === 'imageUrl';
  const isLongField = (mode.kind === 'faq-item' && mode.field === 'answer') || (mode.kind === 'faq-category' && mode.field === 'description');
  const useRich = mode.kind === 'page-text' && shouldUseRichEditor(mode.textKey, text);
  const rows = isLongField ? 6 : 2;

  return (
    <>
      <div
        ref={panelRef}
        className="fixed bg-white border border-gray-200 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
        style={{
          left: pos.left,
          top: pos.top,
          width: 380,
          maxHeight: pos.maxHeight,
        }}
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 flex-shrink-0">
          <Icon className="w-3.5 h-3.5 text-gray-400" />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-gray-700">{LABEL[mode.kind]}</div>
            <div className="text-[10px] font-mono text-gray-400 truncate">{selected.blockKey}</div>
          </div>
          <button type="button" onClick={onClose} className="w-6 h-6 grid place-items-center rounded hover:bg-gray-100 text-gray-500">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {canEditLayout && (
          <div className="flex border-b border-gray-100 text-[12px] font-medium flex-shrink-0">
            <button onClick={() => setTab('text')}
              className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors ${
                tab === 'text' ? 'text-primary border-b-2 border-primary -mb-px' : 'text-gray-500 hover:text-gray-700'
              }`}><Type className="w-3.5 h-3.5" /> {mode.kind === 'dynamic' ? 'Bloc' : 'Texte'}</button>
            <button onClick={() => setTab('layout')}
              className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors ${
                tab === 'layout' ? 'text-primary border-b-2 border-primary -mb-px' : 'text-gray-500 hover:text-gray-700'
              }`}><Layout className="w-3.5 h-3.5" /> Mise en page</button>
          </div>
        )}

        {/* Zone scrollable interne pour éviter d'être hors écran */}
        <div className="flex-1 overflow-y-auto">
          {mode.kind === 'image-effect' ? (
            <ImageEffectInspector pageKey={mode.pageKey} sectionKey={mode.sectionKey} onChanged={onLayoutChanged} />
          ) : tab === 'layout' && canEditLayout ? (
            <LayoutPanel blockKey={selected.blockKey} onChanged={onLayoutChanged} />
          ) : mode.kind === 'dynamic' ? (
            <DynamicBlockInspector blockId={mode.id} onChanged={onLayoutChanged} onDeleted={onClose} />
          ) : (
            <div className="p-3 space-y-3">
              {mode.kind === 'unknown' ? (
                <div className="text-[12px] text-amber-700 bg-amber-50 p-2 rounded">
                  Format non reconnu : <code>{selected.blockKey}</code>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">
                    {mode.kind === 'page-text' && 'Contenu'}
                    {mode.kind === 'faq-item' && (mode.field === 'question' ? 'Question' : 'Réponse')}
                    {mode.kind === 'faq-category' && (mode.field === 'name' ? 'Nom' : mode.field === 'description' ? 'Description' : 'Image')}
                  </label>

                  {isImageField ? (
                    <div className="space-y-2">
                      {text && (
                        <div className="aspect-video bg-gray-100 rounded overflow-hidden border border-gray-200">
                          <img src={text} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <input type="url" value={text} onChange={(e) => handleChange(e.target.value)}
                        placeholder="https://… ou choisir →"
                        className="w-full text-[12px] p-2 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 font-mono" />
                      <button type="button" onClick={() => setPickerOpen(true)}
                        className="h-8 px-2.5 rounded-md border border-gray-200 hover:bg-gray-50 text-[12px] font-medium flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" /> Choisir dans la médiathèque
                      </button>
                    </div>
                  ) : useRich ? (
                    <RichTextEditor html={text} onChange={handleChange} minHeight={140} />
                  ) : (
                    <textarea value={text} onChange={(e) => handleChange(e.target.value)}
                      rows={Math.min(10, Math.max(rows, text.split('\n').length))}
                      className="w-full text-[13px] p-2 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 resize-y"
                      autoFocus />
                  )}
                  {useRich && (
                    <p className="text-[10px] text-gray-400 mt-1">Le formatage (gras, listes, liens, titres) est conservé.</p>
                  )}
                </div>
              )}

              {mode.kind === 'faq-item' && onFaqCategoryChange && (
                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Catégorie</label>
                  <select value={faqCategoryId ?? ''}
                    onChange={(e) => onFaqCategoryChange(e.target.value ? Number(e.target.value) : null)}
                    className="w-full text-[13px] p-2 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 bg-white">
                    <option value="">— Aucune —</option>
                    {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                </div>
              )}

              <div className="text-[11px] text-gray-400 flex items-center justify-between">
                <span>Brouillon — Publier pour valider</span>
                <span className="font-mono">⌘Z</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <MediaPicker isOpen={pickerOpen} onClose={() => setPickerOpen(false)}
        onSelect={(url) => { commitImmediate(url); setPickerOpen(false); }}
        currentMedia={text} mediaType="image" />
    </>
  );
}
