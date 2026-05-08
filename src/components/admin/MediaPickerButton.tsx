'use client';

// src/components/admin/MediaPickerButton.tsx
// Bouton "Choisir dans la médiathèque" qui ouvre /admin/mediatheque dans une popup.
// La page médiathèque doit poster {type:'media:selected', url:'...'} au parent
// quand l'utilisateur sélectionne une image (1 ligne à ajouter — voir README).

import { useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface Props {
  onPick: (url: string) => void;
}

export default function MediaPickerButton({ onPick }: Props) {
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const msg = e.data;
      if (msg?.type === 'media:selected' && typeof msg.url === 'string') {
        onPick(msg.url);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onPick]);

  function open() {
    const w = window.open(
      '/admin/mediatheque?picker=1',
      'mediatheque',
      'width=900,height=700,resizable=yes,scrollbars=yes'
    );
    if (!w) alert('Pop-up bloquée — autorisez les pop-ups pour ce site.');
  }

  return (
    <button
      type="button"
      onClick={open}
      className="h-8 px-2.5 rounded-md border border-gray-200 hover:bg-gray-50 text-[12px] font-medium flex items-center gap-1.5"
    >
      <ImageIcon className="w-3.5 h-3.5" />
      Choisir dans la médiathèque
    </button>
  );
}
