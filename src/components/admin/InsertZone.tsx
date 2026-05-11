'use client';

// src/components/admin/InsertZone.tsx — Sprint 5.6
// Le sectionKey d'un image-effect créé inline utilise la MÊME formule que
// DynamicBlockSlot (slot-<pageKey>-<slot>) → l'effet s'attache automatiquement
// au wrapper rendu par le slot, sans manip manuelle.

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import BlockPickerModal, { type BlockTypeOption } from './BlockPickerModal';

type Props = {
  pageKey: string;
  slot: string;
  afterOrder?: number | null;
  onInserted?: () => void;
  alwaysVisible?: boolean;
};

/** Formule canonique partagée avec DynamicBlockSlot */
function slotSectionKey(pageKey: string, slot: string) {
  return `slot-${pageKey}-${slot}`;
}

export default function InsertZone({ pageKey, slot, afterOrder = null, onInserted, alwaysVisible }: Props) {
  const [editMode, setEditMode] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (alwaysVisible) { setEditMode(true); return; }
    setEditMode(new URLSearchParams(window.location.search).get('edit') === '1');
  }, [alwaysVisible]);

  if (!editMode) return null;

  async function createBlock(opt: BlockTypeOption) {
    setBusy(true);
    try {
      if (opt.kind === 'image-effect') {
        const sectionKey = slotSectionKey(pageKey, slot);
        const res = await fetch('/api/image-effects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageKey, sectionKey,
            effectType: 'parallax',
            minHeight: '500px',
            isVisible: true,
            imageUrl: '',
          }),
        });
        if (!res.ok) throw new Error('Création image-effect échouée');
        setOpen(false);
        onInserted?.();
        try { window.parent?.postMessage({ type: 'editor:image-effects-changed' }, '*'); } catch {}
        window.postMessage({ type: 'editor:image-effects-changed' }, '*');
        return;
      }

      const meta = { ...(opt.defaultMetadata || {}), slot };
      const res = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageKey, blockType: opt.blockType,
          content: opt.defaultContent ?? '', metadata: meta, afterOrder,
        }),
      });
      if (!res.ok) throw new Error('Création échouée');
      setOpen(false);
      onInserted?.();
      try { window.parent?.postMessage({ type: 'editor:blocks-changed' }, '*'); } catch {}
      window.postMessage({ type: 'editor:blocks-changed' }, '*');
    } catch (e: any) {
      alert(`Erreur : ${e?.message || 'inconnue'}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div data-insert-zone data-slot={slot} role="button" tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen(true); }}
        className="group relative h-6 hover:h-10 transition-all duration-150 cursor-pointer my-2 mx-4 z-50"
        aria-label={`Insérer un bloc dans ${slot}`}
        style={{ pointerEvents: 'auto' }}>
        <span className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-primary/40 group-hover:border-primary group-hover:border-solid transition-all" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-white text-primary border-2 border-primary/60 group-hover:border-primary group-hover:px-4 group-hover:shadow-lg transition-all whitespace-nowrap shadow-md">
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden group-hover:inline">Insérer un bloc</span>
        </span>
      </div>

      {open && <BlockPickerModal onClose={() => setOpen(false)} onPick={createBlock} busy={busy} />}
    </>
  );
}
