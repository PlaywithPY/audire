'use client';

// Panneau de gestion des snapshots : créer, restaurer, supprimer.

import { useEffect, useRef, useState } from 'react';
import { Clock, Plus, RotateCcw, Trash2, X, Camera } from 'lucide-react';

type Snapshot = { id: number; label: string; createdAt: string };

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('fr-BE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function SnapshotPanel({ onRestored }: { onRestored: () => void }) {
  const [open, setOpen] = useState(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [creating, setCreating] = useState(false);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function loadSnapshots() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/snapshots');
      if (res.ok) setSnapshots(await res.json());
    } finally { setLoading(false); }
  }

  useEffect(() => {
    if (open) { loadSnapshots(); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  async function handleCreate() {
    if (!newLabel.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newLabel.trim() }),
      });
      if (res.ok) { setNewLabel(''); await loadSnapshots(); }
    } finally { setCreating(false); }
  }

  async function handleRestore(id: number) {
    if (confirmRestore !== id) { setConfirmRestore(id); setTimeout(() => setConfirmRestore(null), 4000); return; }
    setConfirmRestore(null);
    setRestoringId(id);
    try {
      const res = await fetch(`/api/admin/snapshots/${id}/restore`, { method: 'POST' });
      if (res.ok) { setOpen(false); onRestored(); }
      else alert('Erreur lors de la restauration.');
    } finally { setRestoringId(null); }
  }

  async function handleDelete(id: number) {
    if (deletingId === id) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/snapshots/${id}`, { method: 'DELETE' });
      setSnapshots((prev) => prev.filter((s) => s.id !== id));
    } finally { setDeletingId(null); }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Snapshots — points de restauration"
        className="h-7 px-2.5 rounded-md border border-gray-200 hover:bg-gray-50 text-[12px] font-medium flex items-center gap-1.5 text-gray-600"
      >
        <Camera className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Snapshots</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[10000] bg-black/30" onClick={() => setOpen(false)} />
          <div className="fixed z-[10001] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Clock className="w-4 h-4 text-gray-500" />
                Snapshots
              </div>
              <button type="button" onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded-md">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Create */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-[11px] text-gray-500 mb-2">Crée un point de restauration à partir de l'état <strong>actuellement publié</strong>.</p>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="Ex : Avant refonte FAQ…"
                  className="flex-1 text-[13px] px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                />
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!newLabel.trim() || creating}
                  className="h-8 px-3 bg-gray-900 text-white rounded-lg text-[12px] font-semibold flex items-center gap-1.5 hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {creating ? 'Sauvegarde…' : 'Sauvegarder'}
                </button>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="px-4 py-6 text-center text-[13px] text-gray-400">Chargement…</div>
              ) : snapshots.length === 0 ? (
                <div className="px-4 py-6 text-center text-[13px] text-gray-400">Aucun snapshot pour l'instant.</div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {snapshots.map((s) => (
                    <li key={s.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50">
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-gray-800 truncate">{s.label}</p>
                        <p className="text-[11px] text-gray-400">{fmtDate(s.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRestore(s.id)}
                          disabled={restoringId === s.id}
                          title="Restaurer ce snapshot"
                          className={`h-7 px-2.5 rounded-md text-[12px] font-medium flex items-center gap-1.5 transition-colors ${
                            confirmRestore === s.id
                              ? 'bg-amber-50 text-amber-700 border border-amber-300'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          {restoringId === s.id ? 'Restauration…' : confirmRestore === s.id ? 'Confirmer ?' : 'Restaurer'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(s.id)}
                          disabled={deletingId === s.id}
                          title="Supprimer ce snapshot"
                          className="h-7 w-7 grid place-items-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="px-4 py-2 border-t border-gray-100 text-[11px] text-gray-400">
              Les 10 snapshots les plus récents sont conservés.
            </div>
          </div>
        </>
      )}
    </>
  );
}
