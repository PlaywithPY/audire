'use client';

// Sprint 5.5 — DynamicBlockInspector enrichi :
//   1. Nouveau type "bg-image" (image de fond plein largeur avec effet)
//   2. Type "image" enrichi avec options de mise en page avancées
//      (largeur contenue/pleine/full-bleed, object-fit, hauteur, arrondi, marges)
//   3. Color picker libre + alpha sur les overlays

import { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Trash2, Loader2 } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import MediaPicker from '@/components/MediaPicker';

type Block = {
  id: number; pageKey: string; blockKey: string; blockType: string;
  content: string; metadata: string | null; order: number; isVisible: boolean;
};

interface Props {
  blockId: number;
  onChanged?: () => void;
  onDeleted?: () => void;
}

function parseMeta(m: string | null): Record<string, any> {
  if (!m) return {}; try { return JSON.parse(m); } catch { return {}; }
}

const TYPE_LABELS: Record<string, string> = {
  title: 'Titre', text: 'Texte', image: 'Image', 'bg-image': 'Image de fond',
  button: 'Bouton', card: 'Carte', spacer: 'Espacement', divider: 'Séparateur', html: 'HTML libre',
};

// Helpers couleur (rgba ↔ hex+alpha)
function rgbaToHexAlpha(rgba: string | null | undefined): { hex: string; alpha: number } {
  if (!rgba) return { hex: '#000000', alpha: 0 };
  if (rgba.startsWith('#')) return { hex: rgba.slice(0, 7), alpha: 1 };
  const m = rgba.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (!m) return { hex: '#000000', alpha: 0 };
  const r = +m[1], g = +m[2], b = +m[3], a = m[4] !== undefined ? parseFloat(m[4]) : 1;
  const hex = '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('');
  return { hex, alpha: a };
}
function hexAlphaToRgba(hex: string, alpha: number): string {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return `rgba(0,0,0,${alpha})`;
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${alpha})`;
}

const SEG = (active: boolean) =>
  `px-2 py-1.5 text-[11px] rounded border transition-colors ${
    active ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold' : 'bg-white border-gray-200 hover:border-gray-300 text-gray-600'
  }`;

export default function DynamicBlockInspector({ blockId, onChanged, onDeleted }: Props) {
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/blocks?id=${blockId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => { if (alive) { setBlock(b); setLoading(false); } });
    return () => { alive = false; };
  }, [blockId]);

  function persist(patch: Partial<Block>) {
    if (!block) return;
    const next = { ...block, ...patch };
    setBlock(next);
    setSaving(true);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      await fetch('/api/blocks', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: block.id, ...patch }),
      });
      setSaving(false);
      onChanged?.();
      try { window.parent?.postMessage({ type: 'editor:blocks-changed' }, '*'); } catch {}
    }, 400);
  }

  function setMetaField(key: string, value: any) {
    const meta = parseMeta(block?.metadata ?? null);
    meta[key] = value;
    persist({ metadata: JSON.stringify(meta) });
  }

  async function deleteBlock() {
    if (!block || !confirm(`Supprimer ce bloc ${TYPE_LABELS[block.blockType] || block.blockType} ?`)) return;
    await fetch(`/api/blocks?id=${block.id}`, { method: 'DELETE' });
    onDeleted?.();
    try { window.parent?.postMessage({ type: 'editor:blocks-changed' }, '*'); } catch {}
  }

  if (loading) return (
    <div className="p-4 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Chargement…
    </div>
  );
  if (!block) return <div className="p-4 text-xs text-red-600">Bloc introuvable.</div>;

  const meta = parseMeta(block.metadata);
  const typeLabel = TYPE_LABELS[block.blockType] || block.blockType;

  return (
    <div className="p-3 space-y-3 max-h-[75vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-gray-400">Type · {typeLabel}</span>
        {saving && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
      </div>

      {/* TITRE */}
      {block.blockType === 'title' && (
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Texte du titre</label>
          <input type="text" value={block.content} onChange={(e) => persist({ content: e.target.value })}
            className="w-full text-[15px] font-bold p-2 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400" autoFocus />
        </div>
      )}

      {/* TEXTE — éditeur riche */}
      {block.blockType === 'text' && (
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Contenu</label>
          <RichTextEditor html={block.content} onChange={(v) => persist({ content: v })} minHeight={120} />
          <p className="text-[10px] text-gray-400 mt-1">Le formatage (gras, listes, liens, titres) est conservé.</p>
        </div>
      )}

      {/* HTML libre */}
      {block.blockType === 'html' && (
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">HTML</label>
          <RichTextEditor html={block.content} onChange={(v) => persist({ content: v })} minHeight={160} />
        </div>
      )}

      {/* IMAGE INLINE — avec options avancées (Sprint 5D) */}
      {block.blockType === 'image' && (
        <>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Image</label>
            {meta.imageUrl ? (
              <div className="aspect-video bg-gray-100 rounded-md overflow-hidden border border-gray-200 mb-2">
                <img src={meta.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-md grid place-items-center text-gray-400 text-xs mb-2">
                Aucune image
              </div>
            )}
            <button type="button" onClick={() => setPickerOpen(true)}
              className="h-8 px-2.5 rounded-md border border-gray-200 hover:bg-gray-50 text-[12px] font-medium flex items-center gap-1.5 w-full justify-center">
              <ImageIcon className="w-3.5 h-3.5" /> Choisir dans la médiathèque
            </button>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Largeur</label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { v: 'contained', l: 'Contenue' },
                { v: 'full',      l: 'Pleine' },
                { v: 'bleed',     l: 'Full-bleed' },
              ].map((o) => (
                <button key={o.v} type="button" onClick={() => setMetaField('width', o.v)}
                  className={SEG((meta.width ?? 'contained') === o.v)}>{o.l}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Ajustement (object-fit)</label>
            <div className="grid grid-cols-2 gap-1">
              {[
                { v: 'cover',   l: 'Cover (rempli)' },
                { v: 'contain', l: 'Contain (visible)' },
              ].map((o) => (
                <button key={o.v} type="button" onClick={() => setMetaField('objectFit', o.v)}
                  className={SEG((meta.objectFit ?? 'cover') === o.v)}>{o.l}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">
              Hauteur · <span className="text-gray-700 font-semibold">{meta.height ? `${meta.height}px` : 'auto'}</span>
            </label>
            <input type="range" min={0} max={800} step={20} value={meta.height ?? 0}
              onChange={(e) => {
                const v = Number(e.target.value);
                setMetaField('height', v === 0 ? null : v);
              }}
              className="w-full accent-blue-600" />
            <div className="flex justify-between text-[10px] text-gray-400">
              <button type="button" onClick={() => setMetaField('height', null)}
                className="hover:underline">auto</button>
              <span>400</span><span>800</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Arrondi</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { v: 'none', l: 'Aucun' },
                { v: 'md',   l: 'Léger' },
                { v: 'lg',   l: 'Normal' },
                { v: 'full', l: 'Max' },
              ].map((o) => (
                <button key={o.v} type="button" onClick={() => setMetaField('borderRadius', o.v)}
                  className={SEG((meta.borderRadius ?? 'lg') === o.v)}>{o.l}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Marges verticales</label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { v: 'compact', l: 'Compact' },
                { v: 'normal',  l: 'Normal' },
                { v: 'large',   l: 'Large' },
              ].map((o) => (
                <button key={o.v} type="button" onClick={() => setMetaField('marginY', o.v)}
                  className={SEG((meta.marginY ?? 'normal') === o.v)}>{o.l}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Texte alternatif (alt)</label>
            <input type="text" value={meta.alt ?? ''} onChange={(e) => setMetaField('alt', e.target.value)}
              placeholder="Description courte de l'image"
              className="w-full text-[12px] p-2 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400" />
          </div>
        </>
      )}

      {/* IMAGE DE FOND PLEIN LARGEUR (Sprint 5.5) */}
      {block.blockType === 'bg-image' && (() => {
        const { hex, alpha } = rgbaToHexAlpha(meta.overlayColor);
        return (
          <>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Image de fond</label>
              {meta.imageUrl ? (
                <div className="aspect-video bg-gray-100 rounded-md overflow-hidden border border-gray-200 mb-2">
                  <img src={meta.imageUrl} alt={meta.alt || ''} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-md grid place-items-center text-gray-400 text-xs mb-2">
                  Aucune image
                </div>
              )}
              <button type="button" onClick={() => setPickerOpen(true)}
                className="h-8 px-2.5 rounded-md border border-gray-200 hover:bg-gray-50 text-[12px] font-medium flex items-center gap-1.5 w-full justify-center">
                <ImageIcon className="w-3.5 h-3.5" /> Choisir dans la médiathèque
              </button>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Type d'effet</label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { v: 'parallax', l: '🌊 Parallax' },
                  { v: 'zoom',     l: '🔍 Zoom' },
                  { v: 'fade',     l: '🌫️ Fade' },
                  { v: 'fixed',    l: '📌 Fixed' },
                  { v: 'none',     l: '— Aucun' },
                ].map((o) => (
                  <button key={o.v} type="button" onClick={() => setMetaField('effectType', o.v)}
                    className={SEG((meta.effectType ?? 'parallax') === o.v)}>{o.l}</button>
                ))}
              </div>
            </div>

            {(meta.effectType === 'parallax' || !meta.effectType) && (
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">
                  Vitesse · <span className="text-gray-700 font-semibold">{(meta.effectSpeed ?? 0.5).toFixed(2)}</span>
                </label>
                <input type="range" min={0} max={1} step={0.05} value={meta.effectSpeed ?? 0.5}
                  onChange={(e) => setMetaField('effectSpeed', parseFloat(e.target.value))}
                  className="w-full accent-blue-600" />
              </div>
            )}

            {meta.effectType === 'zoom' && (
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">
                  Échelle · <span className="text-gray-700 font-semibold">{(meta.effectScale ?? 1.2).toFixed(2)}×</span>
                </label>
                <input type="range" min={1} max={2} step={0.05} value={meta.effectScale ?? 1.2}
                  onChange={(e) => setMetaField('effectScale', parseFloat(e.target.value))}
                  className="w-full accent-blue-600" />
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">
                Hauteur · <span className="text-gray-700 font-semibold">{meta.height ?? 480}px</span>
              </label>
              <input type="range" min={200} max={900} step={20} value={meta.height ?? 480}
                onChange={(e) => setMetaField('height', Number(e.target.value))}
                className="w-full accent-blue-600" />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Voile (overlay)</label>
              <div className="flex items-center gap-2">
                <input type="color" value={hex}
                  onChange={(e) => setMetaField('overlayColor', hexAlphaToRgba(e.target.value, alpha))}
                  className="w-10 h-8 p-0 border border-gray-200 rounded cursor-pointer" />
                <div className="flex-1">
                  <input type="range" min={0} max={1} step={0.05} value={alpha}
                    onChange={(e) => setMetaField('overlayColor', hexAlphaToRgba(hex, parseFloat(e.target.value)))}
                    className="w-full accent-blue-600" />
                  <div className="text-[10px] text-gray-400 text-center">opacité : {Math.round(alpha * 100)}%</div>
                </div>
                <button type="button" onClick={() => setMetaField('overlayColor', null)}
                  className="text-[10px] text-gray-500 hover:text-gray-700 px-1.5 py-1 rounded hover:bg-gray-100">aucun</button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Texte alternatif</label>
              <input type="text" value={meta.alt ?? ''} onChange={(e) => setMetaField('alt', e.target.value)}
                placeholder="Description courte de l'image"
                className="w-full text-[12px] p-2 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400" />
            </div>
          </>
        );
      })()}

      {/* BOUTON */}
      {block.blockType === 'button' && (() => {
        const [label = '', href = ''] = (block.content || '').split('|');
        return (
          <>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Texte du bouton</label>
              <input type="text" value={label} onChange={(e) => persist({ content: `${e.target.value}|${href}` })}
                className="w-full text-[13px] p-2 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400" autoFocus />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Lien (URL)</label>
              <input type="text" value={href} onChange={(e) => persist({ content: `${label}|${e.target.value}` })}
                placeholder="/contact ou https://…"
                className="w-full text-[12px] font-mono p-2 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400" />
            </div>
          </>
        );
      })()}

      {/* CARTE */}
      {block.blockType === 'card' && (
        <>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Titre</label>
            <input type="text" value={block.content} onChange={(e) => persist({ content: e.target.value })}
              className="w-full text-[13px] p-2 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400" autoFocus />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Description</label>
            <textarea value={meta.description ?? ''} onChange={(e) => setMetaField('description', e.target.value)} rows={3}
              className="w-full text-[12px] p-2 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 resize-y" />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Icône (emoji)</label>
            <input type="text" value={meta.icon ?? ''} onChange={(e) => setMetaField('icon', e.target.value)}
              placeholder="✨" maxLength={4}
              className="w-20 text-center text-2xl p-1 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400" />
          </div>
        </>
      )}

      {/* SPACER */}
      {block.blockType === 'spacer' && (
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">
            Hauteur · <span className="text-gray-700 font-semibold">{meta.height ?? 48}px</span>
          </label>
          <input type="range" min={8} max={240} step={4} value={meta.height ?? 48}
            onChange={(e) => setMetaField('height', Number(e.target.value))}
            className="w-full accent-primary" />
        </div>
      )}

      {block.blockType === 'divider' && (
        <p className="text-[12px] text-gray-500 italic">Une simple ligne horizontale. Aucune option à configurer.</p>
      )}

      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-[12px] text-gray-700">
          <input type="checkbox" checked={block.isVisible} onChange={(e) => persist({ isVisible: e.target.checked })} />
          Visible
        </label>
        <button onClick={deleteBlock}
          className="flex items-center gap-1 text-[12px] text-red-600 hover:bg-red-50 px-2 py-1 rounded">
          <Trash2 className="w-3.5 h-3.5" /> Supprimer
        </button>
      </div>

      <div className="text-[11px] text-gray-400">
        Brouillon — Publier pour valider · <span className="font-mono">id:{block.id}</span>
      </div>

      <MediaPicker isOpen={pickerOpen} onClose={() => setPickerOpen(false)}
        onSelect={(url) => { setMetaField('imageUrl', url); setPickerOpen(false); }}
        currentMedia={meta.imageUrl} mediaType="image" />
    </div>
  );
}
