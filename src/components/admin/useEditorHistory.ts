'use client';

// src/components/admin/useEditorHistory.ts
// Hook d'undo/redo client. Gère une pile d'opérations sur les textes éditables.
//
// Une "opération" = { blockKey, before, after }. C'est minimaliste et suffit
// pour notre usage (un seul utilisateur édite à la fois dans son onglet).
//
// API :
//   const { push, undo, redo, canUndo, canRedo, clear } = useEditorHistory();
//   push({ blockKey: 'faq.hero-title', before: 'Old', after: 'New' });
//   undo() → renvoie l'op à inverser, ou null
//   redo() → renvoie l'op à rejouer, ou null

import { useCallback, useEffect, useState } from 'react';

export type EditOp = {
  blockKey: string;
  before: string;
  after: string;
};

export function useEditorHistory(maxSize = 100) {
  const [past, setPast] = useState<EditOp[]>([]);
  const [future, setFuture] = useState<EditOp[]>([]);

  const push = useCallback((op: EditOp) => {
    if (op.before === op.after) return;
    setPast((p) => [...p.slice(-maxSize + 1), op]);
    setFuture([]);
  }, [maxSize]);

  const undo = useCallback((): EditOp | null => {
    let popped: EditOp | null = null;
    setPast((p) => {
      if (p.length === 0) return p;
      popped = p[p.length - 1];
      return p.slice(0, -1);
    });
    if (popped) setFuture((f) => [popped!, ...f]);
    return popped;
  }, []);

  const redo = useCallback((): EditOp | null => {
    let shifted: EditOp | null = null;
    setFuture((f) => {
      if (f.length === 0) return f;
      shifted = f[0];
      return f.slice(1);
    });
    if (shifted) setPast((p) => [...p, shifted!]);
    return shifted;
  }, []);

  const clear = useCallback(() => { setPast([]); setFuture([]); }, []);

  // Raccourcis clavier
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        const op = undo();
        if (op) window.dispatchEvent(new CustomEvent('editor:apply-undo', { detail: op }));
      } else if ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y') {
        e.preventDefault();
        const op = redo();
        if (op) window.dispatchEvent(new CustomEvent('editor:apply-redo', { detail: op }));
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  return {
    push,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    clear,
  };
}
