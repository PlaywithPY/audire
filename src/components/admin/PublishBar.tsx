'use client';

// src/components/admin/PublishBar.tsx
// Encart dans la topbar : compteur de modifs en attente + Publier + Annuler.

import { useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';

interface PublishBarProps {
  pendingCount: number;
  onPublish: () => Promise<void>;
  onDiscard: () => void;
}

export default function PublishBar({ pendingCount, onPublish, onDiscard }: PublishBarProps) {
  const [publishing, setPublishing] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const hasPending = pendingCount > 0;

  async function handlePublish() {
    if (!hasPending || publishing) return;
    setPublishing(true);
    try { await onPublish(); } finally { setPublishing(false); }
  }

  function handleDiscard() {
    if (!confirmDiscard) { setConfirmDiscard(true); setTimeout(() => setConfirmDiscard(false), 3000); return; }
    onDiscard();
    setConfirmDiscard(false);
  }

  return (
    <div className="flex items-center gap-2">
      {hasPending && (
        <span className="text-[12px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          {pendingCount} modif{pendingCount > 1 ? 's' : ''} non publiée{pendingCount > 1 ? 's' : ''}
        </span>
      )}

      <button
        type="button"
        onClick={handleDiscard}
        disabled={!hasPending}
        title="Annuler les modifications"
        className={`h-7 px-2.5 rounded-md text-[12px] font-medium flex items-center gap-1.5 transition-colors ${
          !hasPending
            ? 'text-gray-300 cursor-not-allowed'
            : confirmDiscard
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Trash2 className="w-3.5 h-3.5" />
        {confirmDiscard ? 'Confirmer ?' : 'Annuler'}
      </button>

      <button
        type="button"
        onClick={handlePublish}
        disabled={!hasPending || publishing}
        className={`h-7 px-3 rounded-md text-[12px] font-semibold flex items-center gap-1.5 transition-colors ${
          !hasPending
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-900 text-white hover:bg-black'
        }`}
      >
        <Upload className="w-3.5 h-3.5" />
        {publishing ? 'Publication…' : 'Publier'}
      </button>
    </div>
  );
}
