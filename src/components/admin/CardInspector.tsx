'use client';

// src/components/admin/CardInspector.tsx
// Feature Cards Editor — panneau d'édition inline d'une feature card, affiché
// dans le BlockInspector quand on sélectionne une card dans l'éditeur de page.
//
// Données : table CardImage (clé pageKey + cardKey), surchargée par-dessus les
// défauts définis dans lib/card-definitions.ts.
// Sauvegarde : POST /api/admin/card-images (upsert write-through). Contrairement
// aux textes (brouillon → Publier), les cards s'enregistrent en direct — c'est le
// comportement historique de l'outil dédié. Après enregistrement, on rafraîchit
// l'aperçu via onSaved().

import { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Check, Loader2, ExternalLink, AlertTriangle } from 'lucide-react';
import MediaPicker from '@/components/MediaPicker';

export type CardInitial = {
  image?: string;
  title?: string;
  description?: string;
  href?: string;
  position?: string;
  alt?: string;
  emoji?: string;
};

type Props = {
  pageKey: string;
  cardKey: string;
  initial: CardInitial;
  /** Appelé après un enregistrement réussi (rafraîchit l'iframe d'aperçu). */
  onSaved?: () => void;
};

const POSITION_PRESETS = ['center center', 'center 35%', 'center 60%', 'center top', 'center bottom'];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">{children}</label>
  );
}

export default function CardInspector({ pageKey, cardKey, initial, onSaved }: Props) {
  const [image, setImage] = useState(initial.image ?? '');
  const [title, setTitle] = useState(initial.title ?? '');
  const [description, setDescription] = useState(initial.description ?? '');
  const [href, setHref] = useState(initial.href ?? '');
  const [position, setPosition] = useState(initial.position || 'center 35%');
  const [alt, setAlt] = useState(initial.alt ?? '');
  const [emoji, setEmoji] = useState(initial.emoji || '📷');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const savedTimer = useRef<number | null>(null);

  // Re-synchronise quand on sélectionne une autre card.
  useEffect(() => {
    setImage(initial.image ?? '');
    setTitle(initial.title ?? '');
    setDescription(initial.description ?? '');
    setHref(initial.href ?? '');
    setPosition(initial.position || 'center 35%');
    setAlt(initial.alt ?? '');
    setEmoji(initial.emoji || '📷');
    setStatus('idle');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey, cardKey]);

  useEffect(() => () => { if (savedTimer.current) window.clearTimeout(savedTimer.current); }, []);

  const dirty =
    image !== (initial.image ?? '') ||
    title !== (initial.title ?? '') ||
    description !== (initial.description ?? '') ||
    href !== (initial.href ?? '') ||
    position !== (initial.position || 'center 35%') ||
    alt !== (initial.alt ?? '') ||
    emoji !== (initial.emoji || '📷');

  const noImage = !image || image.trim() === '';

  async function save() {
    if (noImage) { setStatus('error'); return; }
    setStatus('saving');
    try {
      const res = await fetch('/api/admin/card-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageKey,
          cardKey,
          imageUrl: image,
          fallbackEmoji: emoji || '📷',
          imagePosition: position || 'center center',
          href: href || null,
          title: title || null,
          description: description || null,
          imageAlt: alt || null,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('saved');
      onSaved?.();
      if (savedTimer.current) window.clearTimeout(savedTimer.current);
      savedTimer.current = window.setTimeout(() => setStatus('idle'), 1600);
    } catch (e) {
      console.error('Card save failed', e);
      setStatus('error');
    }
  }

  return (
    <div className="p-3 space-y-3">
      {/* Aperçu */}
      <div className="rounded-lg overflow-hidden border border-gray-200 bg-white">
        <div className="h-28 relative bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
          {!noImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={alt || title}
              className="w-full h-full object-cover"
              style={{ objectPosition: position }}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <span className="text-4xl">{emoji}</span>
            </div>
          )}
        </div>
        <div className="p-2.5">
          <div className="text-[13px] font-semibold text-gray-900 leading-tight">{title || 'Titre de la card'}</div>
          <div className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{description || 'Description…'}</div>
        </div>
      </div>

      {/* Image */}
      <div>
        <Label>Image</Label>
        <div className="flex gap-2">
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="/images/ma-photo.jpg"
            className="flex-1 min-w-0 text-[12px] p-2 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 font-mono"
          />
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="h-8 px-2.5 shrink-0 rounded-md border border-gray-200 hover:bg-gray-50 text-[12px] font-medium flex items-center gap-1.5"
            title="Choisir dans la médiathèque"
          >
            <ImageIcon className="w-3.5 h-3.5" /> Choisir
          </button>
        </div>
        {noImage && (
          <p className="mt-1 text-[10px] text-amber-600 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Une image est requise pour enregistrer.
          </p>
        )}
      </div>

      {/* Cadrage */}
      <div>
        <Label>Cadrage de l'image</Label>
        <input
          type="text"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          placeholder="center 35%"
          className="w-full text-[12px] p-2 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
        />
        <div className="flex flex-wrap gap-1 pt-1.5">
          {POSITION_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setPosition(preset)}
              className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                position === preset
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Titre */}
      <div>
        <Label>Titre</Label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-[13px] p-2 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
        />
      </div>

      {/* Description */}
      <div>
        <Label>Description</Label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full text-[12px] p-2 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 resize-y"
        />
      </div>

      {/* Lien */}
      <div>
        <Label>Lien au clic</Label>
        <div className="flex gap-2">
          <input
            type="text"
            value={href}
            onChange={(e) => setHref(e.target.value)}
            placeholder="/destination"
            className="flex-1 min-w-0 text-[12px] p-2 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
          />
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="h-8 px-2 shrink-0 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1 text-[11px]"
              title="Tester le lien"
            >
              <ExternalLink className="w-3 h-3" /> Test
            </a>
          )}
        </div>
      </div>

      {/* Avancé : alt + emoji */}
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <div>
          <Label>Texte alternatif</Label>
          <input
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Description de l'image"
            className="w-full text-[12px] p-2 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
          />
        </div>
        <div>
          <Label>Emoji</Label>
          <input
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            maxLength={4}
            className="w-16 text-center text-[16px] p-1.5 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
          />
        </div>
      </div>

      {/* Barre d'enregistrement */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
        <span className="text-[10px] text-gray-400">
          {status === 'error'
            ? 'Échec — vérifiez l\'image'
            : 'Enregistrement direct (pas besoin de Publier)'}
        </span>
        <button
          type="button"
          onClick={save}
          disabled={status === 'saving' || (!dirty && status !== 'error')}
          className="h-8 px-4 rounded-md bg-gray-900 text-white text-[12px] font-medium hover:bg-black disabled:opacity-40 flex items-center gap-1.5"
        >
          {status === 'saving' ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enregistrement…</>
          ) : status === 'saved' ? (
            <><Check className="w-3.5 h-3.5" /> Enregistré</>
          ) : (
            'Enregistrer'
          )}
        </button>
      </div>

      <MediaPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => { setImage(url); setPickerOpen(false); }}
        currentMedia={image}
        mediaType="image"
      />
    </div>
  );
}
