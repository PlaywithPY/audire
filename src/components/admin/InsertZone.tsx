'use client';

// src/components/admin/InsertZone.tsx
// Sprint 2 — barre fine entre sections. Au survol → bouton "Insérer un bloc".
// Pose-la entre tes <section> dans la page (visible uniquement si ?edit=1).
//
// Usage :
//   <InsertZone pageKey="home" afterOrder={null} onInserted={refresh} />
//   <SectionHero />
//   <InsertZone pageKey="home" afterOrder={0} onInserted={refresh} />
//   <SectionFeatures />
//   …
//
// `afterOrder = null` → en tête de la page. Un nombre → après ce order.

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import BlockPickerModal, { type BlockTypeOption } from './BlockPickerModal';

type Props = {
  pageKey: string;
  afterOrder: number | null;
  onInserted?: () => void;
  /** Force l'affichage en dehors du mode édition (debug). */
  alwaysVisible?: boolean;
};

export default function InsertZone({ pageKey, afterOrder, onInserted, alwaysVisible }: Props) {
  const [editMode, setEditMode] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (alwaysVisible) { setEditMode(true); return; }
    // Mode édition activé via ?edit=1 sur l'iframe de l'éditeur
    const isEdit = new URLSearchParams(window.location.search).get('edit') === '1';
    setEditMode(isEdit);
  }, [alwaysVisible]);

  if (!editMode) return null;

  async function createBlock(opt: BlockTypeOption) {
    setBusy(true);
    try {
      const res = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageKey,
          blockType: opt.blockType,
          content: opt.defaultContent ?? '',
          metadata: opt.defaultMetadata ?? null,
          afterOrder,
        }),
      });
      if (!res.ok) throw new Error('Création échouée');
      setOpen(false);
      onInserted?.();
      // Notifie l'éditeur parent pour rafraîchir l'iframe
      try { window.parent?.postMessage({ type: 'editor:blocks-changed' }, '*'); } catch {}
    } catch (e: any) {
      alert(`Erreur : ${e?.message || 'inconnue'}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen(true); }}
        className="group relative h-3.5 hover:h-8 transition-all duration-150 cursor-pointer my-1 mx-8"
        aria-label="Insérer un bloc"
      >
        {/* Ligne pointillée centrale */}
        <span className="absolute left-0 right-0 top-1/2 h-px bg-primary/40 opacity-0 group-hover:opacity-60 transition-opacity" />
        {/* Bouton "+" */}
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white text-primary border border-primary/60 opacity-30 group-hover:opacity-100 group-hover:px-3 transition-all whitespace-nowrap shadow-sm">
          <Plus className="w-3 h-3" />
          <span className="hidden group-hover:inline">Insérer un bloc</span>
        </span>
      </div>

      {open && (
        <BlockPickerModal
          onClose={() => setOpen(false)}
          onPick={createBlock}
          busy={busy}
        />
      )}
    </>
  );
}
