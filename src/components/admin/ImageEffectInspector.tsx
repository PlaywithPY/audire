'use client';

// Sprint 5 — Inspecteur dédié aux effets d'image plein écran.
// Reconnaît les blockKeys de la forme `image-effect:<pageKey>:<sectionKey>`
// et propose : choix d'image (médiathèque), type d'effet, vitesse, échelle,
// hauteur, overlay color picker libre + alpha, alt, visibilité.
//
// Charge l'effet via GET /api/image-effects?pageKey=… puis filtre par sectionKey.
// Sauvegarde via PATCH /api/image-effects (body: { id, ...patch }).

import { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Loader2, Eye, EyeOff } from 'lucide-react';
import MediaPicker from '@/components/MediaPicker';

type ImageEffect = {
  id: number;
  imageUrl: string;
  effectType: 'parallax' | 'zoom' | 'fade' | 'slide' | 'fixed' | 'none';
  effectSpeed: number;
  effectScale: number;
  pageKey: string;
  sectionKey: string;
  order: number;
  isVisible: boolean;
  alt: string | null;
  overlayColor: string | null;
  minHeight: string;
};

interface Props {
  pageKey: string;
  sectionKey: string;
  onChanged?: () => void;
}

const EFFECT_OPTIONS: Array<{ value: ImageEffect['effectType']; label: string; emoji: string }> = [
  { value: 'parallax', label: 'Parallax', emoji: '🌊' },
  { value: 'zoom',     label: 'Zoom',     emoji: '🔍' },
  { value: 'fade',     label: 'Fade',     emoji: '🌫️' },
  { value: 'slide',    label: 'Slide',    emoji: '↔️' },
  { value: 'fixed',    label: 'Fixed',    emoji: '📌' },
  { value: 'none',     label: 'Aucun',    emoji: '—' },
];

// ---- Helpers couleur (rgba ↔ hex+alpha) ----
function rgbaToHexAlpha(rgba: string | null): { hex: string; alpha: number } {
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

export default function ImageEffectInspector({ pageKey, sectionKey, onChanged }: Props) {
  const [effect, setEffect] = useState<ImageEffect | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/image-effects?pageKey=${encodeURIComponent(pageKey)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((all: ImageEffect[]) => {
        if (!alive) return;
        const found = all.find((e) => e.sectionKey === sectionKey) || null;
        setEffect(found);
        setLoading(false);
      });
    return () => { alive = false; };
  }, [pageKey, sectionKey]);

  function persist(patch: Partial<ImageEffect>) {
    if (!effect) return;
    const next = { ...effect, ...patch };
    setEffect(next);
    setSaving(true);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      await fetch('/api/image-effects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: effect.id, ...patch }),
      });
      setSaving(false);
      onChanged?.();
      try { window.parent?.postMessage({ type: 'editor:image-effects-changed' }, '*'); } catch {}
      // Notifie aussi la page elle-même (l'iframe) pour que AllPageImageEffects refetch
      try { window.postMessage({ type: 'editor:image-effects-changed' }, '*'); } catch {}
    }, 400);
  }

  if (loading) return (
    <div className="p-4 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Chargement…
    </div>
  );
  if (!effect) return (
    <div className="p-4 text-xs text-amber-700 bg-amber-50">
      Aucun effet trouvé pour <code>{sectionKey}</code> sur <code>{pageKey}</code>.
      <br />Crée-le via <strong>Admin → Images & effets</strong>.
    </div>
  );

  const { hex, alpha } = rgbaToHexAlpha(effect.overlayColor);
  const minH = parseInt(effect.minHeight, 10) || 600;

  return (
    <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-gray-400">Effet · {effect.effectType}</span>
        {saving && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
      </div>

      {/* IMAGE */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Image</label>
        {effect.imageUrl ? (
          <div className="aspect-video bg-gray-100 rounded-md overflow-hidden border border-gray-200 mb-2">
            <img src={effect.imageUrl} alt={effect.alt || ''} className="w-full h-full object-cover" />
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

      {/* TYPE D'EFFET */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Type d'effet</label>
        <div className="grid grid-cols-3 gap-1">
          {EFFECT_OPTIONS.map((opt) => (
            <button key={opt.value} type="button" onClick={() => persist({ effectType: opt.value })}
              className={`px-2 py-1.5 text-[11px] rounded border transition-colors ${
                effect.effectType === opt.value
                  ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                  : 'bg-white border-gray-200 hover:border-gray-300 text-gray-600'
              }`}>
              <span className="mr-1">{opt.emoji}</span>{opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* VITESSE (parallax / slide) */}
      {(effect.effectType === 'parallax' || effect.effectType === 'slide') && (
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">
            Vitesse · <span className="text-gray-700 font-semibold">{effect.effectSpeed.toFixed(2)}</span>
          </label>
          <input type="range" min={0} max={1} step={0.05} value={effect.effectSpeed}
            onChange={(e) => persist({ effectSpeed: parseFloat(e.target.value) })}
            className="w-full accent-blue-600" />
        </div>
      )}

      {/* ÉCHELLE (zoom) */}
      {effect.effectType === 'zoom' && (
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">
            Échelle finale · <span className="text-gray-700 font-semibold">{effect.effectScale.toFixed(2)}×</span>
          </label>
          <input type="range" min={1} max={2} step={0.05} value={effect.effectScale}
            onChange={(e) => persist({ effectScale: parseFloat(e.target.value) })}
            className="w-full accent-blue-600" />
        </div>
      )}

      {/* HAUTEUR */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">
          Hauteur · <span className="text-gray-700 font-semibold">{minH}px</span>
        </label>
        <input type="range" min={200} max={1200} step={20} value={minH}
          onChange={(e) => persist({ minHeight: `${e.target.value}px` })}
          className="w-full accent-blue-600" />
      </div>

      {/* OVERLAY COULEUR + ALPHA */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Voile (overlay)</label>
        <div className="flex items-center gap-2">
          <input type="color" value={hex}
            onChange={(e) => persist({ overlayColor: hexAlphaToRgba(e.target.value, alpha) })}
            className="w-10 h-8 p-0 border border-gray-200 rounded cursor-pointer" />
          <div className="flex-1">
            <input type="range" min={0} max={1} step={0.05} value={alpha}
              onChange={(e) => persist({ overlayColor: hexAlphaToRgba(hex, parseFloat(e.target.value)) })}
              className="w-full accent-blue-600" />
            <div className="text-[10px] text-gray-400 text-center">opacité : {Math.round(alpha * 100)}%</div>
          </div>
          <button type="button" onClick={() => persist({ overlayColor: null })}
            className="text-[10px] text-gray-500 hover:text-gray-700 px-1.5 py-1 rounded hover:bg-gray-100">aucun</button>
        </div>
      </div>

      {/* ALT */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Texte alternatif</label>
        <input type="text" value={effect.alt ?? ''} onChange={(e) => persist({ alt: e.target.value })}
          placeholder="Description courte de l'image"
          className="w-full text-[12px] p-2 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400" />
      </div>

      {/* VISIBILITÉ */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
        <button type="button" onClick={() => persist({ isVisible: !effect.isVisible })}
          className={`flex items-center gap-1.5 text-[12px] px-2 py-1 rounded ${
            effect.isVisible ? 'text-gray-700 hover:bg-gray-100' : 'text-orange-700 bg-orange-50 hover:bg-orange-100'
          }`}>
          {effect.isVisible ? <><Eye className="w-3.5 h-3.5" /> Visible</> : <><EyeOff className="w-3.5 h-3.5" /> Masqué</>}
        </button>
        <span className="text-[11px] text-gray-400 font-mono">id:{effect.id}</span>
      </div>

      <MediaPicker isOpen={pickerOpen} onClose={() => setPickerOpen(false)}
        onSelect={(url) => { persist({ imageUrl: url }); setPickerOpen(false); }}
        currentMedia={effect.imageUrl} mediaType="image" />
    </div>
  );
}
