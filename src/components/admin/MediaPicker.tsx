'use client';

// =====================================================
// MediaPicker — champ média unifié (URL + Médiathèque + Focal point)
// =====================================================
// - Affiche le média actuel (preview)
// - Bouton "Médiathèque" : ouvre /admin/mediatheque?picker=1 en popup,
//   écoute postMessage({type:'media:selected', url})
// - Bouton "Coller URL" : input texte direct
// - Si focal point activé : afficher le FocalPointPicker pour recadrer

import { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, FolderOpen, Link2, X, Crop, Video, Loader2 } from 'lucide-react';
import FocalPointPicker from './FocalPointPicker';
import { FocalPoint } from '@/lib/deviceBlocks';

interface Props {
  /** URL actuelle du média (ou null) */
  value: string | null;
  /** Callback quand l'URL change (ou null si suppression) */
  onChange: (url: string | null) => void;

  /** Type de média attendu (info uniquement — le picker accepte tout) */
  mediaType?: 'image' | 'video';
  /** Si fourni, affiche le sélecteur image/vidéo */
  onTypeChange?: (type: 'image' | 'video') => void;

  /** Focal point (% 0-100). Si défini, expose le FocalPointPicker. */
  focal?: FocalPoint;
  onFocalChange?: (focal: FocalPoint) => void;

  /** Libellé du champ */
  label?: string;
  /** Ratio d'aperçu */
  aspect?: 'square' | 'video';
}

export default function MediaPicker({
  value, onChange,
  mediaType = 'image',
  onTypeChange,
  focal, onFocalChange,
  label,
  aspect = 'video',
}: Props) {
  const [urlInput, setUrlInput] = useState('');
  const [urlMode, setUrlMode]   = useState(false);
  const [focalMode, setFocalMode] = useState(false);
  const popupRef = useRef<Window | null>(null);

  // Écoute postMessage venant de la médiathèque en mode picker
  useEffect(() => {
    function onMessage(ev: MessageEvent) {
      const d = ev.data;
      if (!d || typeof d !== 'object') return;
      if (d.type === 'media:selected' && typeof d.url === 'string') {
        onChange(d.url);
        setUrlMode(false);
        if (popupRef.current && !popupRef.current.closed) {
          popupRef.current.close();
        }
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onChange]);

  function openMediatheque() {
    const w = window.open('/admin/mediatheque?picker=1', 'mediatheque-picker', 'width=1000,height=720');
    if (w) popupRef.current = w;
  }

  function applyUrl() {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setUrlMode(false);
    }
  }

  function clear() {
    onChange(null);
    setFocalMode(false);
  }

  const aspectClass = aspect === 'square' ? 'aspect-square' : 'aspect-video';
  const isVideo = mediaType === 'video';

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-500">{label}</label>
      )}

      {/* Sélecteur type (optionnel) */}
      {onTypeChange && (
        <div className="inline-flex bg-gray-100 rounded-md p-0.5 text-[11px]">
          <button type="button"
            onClick={() => onTypeChange('image')}
            className={`px-2.5 py-1 rounded ${mediaType === 'image' ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500'}`}>
            <ImageIcon className="inline w-3 h-3 mr-1" />Image
          </button>
          <button type="button"
            onClick={() => onTypeChange('video')}
            className={`px-2.5 py-1 rounded ${mediaType === 'video' ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500'}`}>
            <Video className="inline w-3 h-3 mr-1" />Vidéo
          </button>
        </div>
      )}

      {/* Preview */}
      <div className={`relative w-full ${aspectClass} rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 group`}>
        {value ? (
          <>
            {isVideo ? (
              <video src={value} className="w-full h-full object-cover" muted />
            ) : (
              <img
                src={value}
                alt=""
                className="w-full h-full object-cover"
                style={focal ? { objectPosition: `${focal.x}% ${focal.y}%` } : undefined}
              />
            )}
            <button
              type="button"
              onClick={clear}
              title="Retirer ce média"
              className="absolute top-1.5 right-1.5 p-1 bg-white/95 rounded shadow hover:bg-red-50 hover:text-red-600 text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {!isVideo && onFocalChange && (
              <button
                type="button"
                onClick={() => setFocalMode((v) => !v)}
                title="Régler le focal point"
                className={`absolute bottom-1.5 right-1.5 px-2 py-1 rounded shadow text-[10px] font-mono flex items-center gap-1 ${
                  focalMode ? 'bg-blue-600 text-white' : 'bg-white/95 text-gray-700 hover:bg-blue-50'
                }`}
              >
                <Crop className="w-3 h-3" />
                Focal
              </button>
            )}
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center text-gray-400 text-xs">
            <div className="text-center">
              {isVideo ? <Video className="w-7 h-7 mx-auto mb-1.5 opacity-50" /> : <ImageIcon className="w-7 h-7 mx-auto mb-1.5 opacity-50" />}
              <p>Aucun média</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {!urlMode ? (
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={openMediatheque}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300"
          >
            <FolderOpen className="w-3.5 h-3.5" /> Médiathèque
          </button>
          <button
            type="button"
            onClick={() => setUrlMode(true)}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-500 bg-transparent border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-700"
          >
            <Link2 className="w-3.5 h-3.5" /> URL externe
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyUrl())}
            placeholder="https://…"
            autoFocus
            className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />
          <button type="button" onClick={applyUrl} className="px-2.5 py-1.5 text-xs bg-gray-900 text-white rounded-md">OK</button>
          <button type="button" onClick={() => { setUrlMode(false); setUrlInput(''); }} className="p-1.5 text-gray-400 hover:text-gray-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Focal point */}
      {focalMode && value && !isVideo && focal && onFocalChange && (
        <div className="pt-2 border-t border-gray-100">
          <FocalPointPicker
            imageUrl={value}
            value={focal}
            onChange={onFocalChange}
            aspect={aspect}
          />
        </div>
      )}
    </div>
  );
}
