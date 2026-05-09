'use client';

// src/components/admin/LayoutPanel.tsx
// Panneau "Mise en page" — à intégrer dans BlockInspector comme onglet à côté de "Texte".
// Lit/écrit /api/admin/block-layout, et notifie l'iframe via postMessage pour appliquer en live.

import { useEffect, useState } from 'react';
import { Maximize2, AlignLeft, AlignCenter, AlignRight, Monitor, Tablet, Smartphone } from 'lucide-react';
import type { BlockLayout } from '@/components/BlockLayoutWrapper';

type Props = {
  blockKey: string;
  /** Notifie l'éditeur que le layout a changé (l'iframe sera rafraîchie) */
  onChanged?: () => void;
};

const MAX_W_OPTIONS: { value: NonNullable<BlockLayout['maxWidth']>; label: string; px: string }[] = [
  { value: 'md',   label: 'S',  px: '448 px' },
  { value: 'lg',   label: 'M',  px: '512 px' },
  { value: 'xl',   label: 'L',  px: '576 px' },
  { value: '2xl',  label: 'XL', px: '672 px' },
  { value: '3xl',  label: '2XL', px: '768 px' },
  { value: '4xl',  label: '3XL', px: '896 px' },
  { value: '5xl',  label: '4XL', px: '1024 px' },
  { value: '7xl',  label: 'Full', px: '1280 px' },
];

export default function LayoutPanel({ blockKey, onChanged }: Props) {
  const [layout, setLayout] = useState<BlockLayout>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/block-layout?key=${encodeURIComponent(blockKey)}`)
      .then((r) => (r.ok ? r.json() : { layout: null }))
      .then((d) => setLayout(d.layout || {}))
      .finally(() => setLoading(false));
  }, [blockKey]);

  async function persist(next: BlockLayout) {
    setLayout(next);
    setSaving(true);
    try {
      await fetch('/api/admin/block-layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: blockKey, layout: Object.keys(next).length ? next : null }),
      });
      onChanged?.();
    } finally {
      setSaving(false);
    }
  }

  function patch<K extends keyof BlockLayout>(k: K, v: BlockLayout[K] | undefined) {
    const next = { ...layout };
    if (v === undefined) delete next[k];
    else next[k] = v;
    persist(next);
  }

  if (loading) {
    return <div className="p-3 text-[12px] text-gray-400">Chargement…</div>;
  }

  return (
    <div className="p-3 space-y-4">
      {/* Largeur max */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
          <Maximize2 className="w-3 h-3" /> Largeur maximale
        </label>
        <div className="grid grid-cols-4 gap-1">
          {MAX_W_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => patch('maxWidth', o.value)}
              title={o.px}
              className={`px-2 py-1.5 rounded-md text-[11px] font-medium border transition-colors ${
                layout.maxWidth === o.value
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        {layout.maxWidth && (
          <button onClick={() => patch('maxWidth', undefined)} className="mt-1 text-[10px] text-gray-400 hover:text-gray-600">
            Réinitialiser
          </button>
        )}
      </div>

      {/* Alignement */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-2">Alignement</label>
        <div className="grid grid-cols-3 gap-1">
          {([
            { v: 'left',   icon: AlignLeft },
            { v: 'center', icon: AlignCenter },
            { v: 'right',  icon: AlignRight },
          ] as const).map(({ v, icon: Icon }) => (
            <button
              key={v}
              type="button"
              onClick={() => patch('align', v)}
              className={`py-1.5 rounded-md border flex items-center justify-center transition-colors ${
                layout.align === v ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Padding */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-2">Espacement interne</label>
        <div className="grid grid-cols-3 gap-1">
          {(['compact', 'normal', 'large'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => patch('padding', p)}
              className={`py-1.5 rounded-md border text-[11px] capitalize transition-colors ${
                layout.padding === p ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Visibilité */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-2">Visible sur</label>
        <div className="flex gap-1">
          {([
            { k: 'hideDesktop', label: 'Desktop', Icon: Monitor },
            { k: 'hideTablet',  label: 'Tablet',  Icon: Tablet },
            { k: 'hideMobile',  label: 'Mobile',  Icon: Smartphone },
          ] as const).map(({ k, label, Icon }) => {
            const visible = !layout[k];
            return (
              <button
                key={k}
                type="button"
                onClick={() => patch(k, visible ? true : undefined)}
                title={`${visible ? 'Cacher' : 'Afficher'} sur ${label}`}
                className={`flex-1 py-1.5 rounded-md border flex items-center justify-center gap-1 text-[11px] transition-colors ${
                  visible ? 'bg-white text-gray-700 border-gray-200' : 'bg-gray-100 text-gray-400 border-gray-200 line-through'
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1 border-t border-gray-100">
        <span>{saving ? 'Enregistrement…' : 'Sauvegarde immédiate'}</span>
        {Object.keys(layout).length > 0 && (
          <button
            onClick={() => persist({})}
            className="text-red-600 hover:underline text-[11px]"
          >
            Tout réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
