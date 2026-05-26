'use client';

// =====================================================
// FocalPointPicker — drag d'un point sur une image pour
// définir le centre d'intérêt (object-position CSS)
// =====================================================
// Réutilisable. Renvoie un focal {x, y} en % (0-100).

import { useCallback, useRef } from 'react';
import { FocalPoint } from '@/lib/deviceBlocks';

interface Props {
  imageUrl: string;
  value: FocalPoint;
  onChange: (next: FocalPoint) => void;
  aspect?: 'square' | 'video' | 'auto';
}

export default function FocalPointPicker({ imageUrl, value, onChange, aspect = 'video' }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  const aspectClass =
    aspect === 'square' ? 'aspect-square' :
    aspect === 'video'  ? 'aspect-video'  :
    '';

  const updateFromEvent = useCallback((clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    onChange({ x: Math.round(x), y: Math.round(y) });
  }, [onChange]);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    updateFromEvent(e.clientX, e.clientY);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    updateFromEvent(e.clientX, e.clientY);
  };
  const stop = () => { dragging.current = false; };

  return (
    <div className="space-y-2">
      <div
        ref={ref}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stop}
        onMouseLeave={stop}
        onTouchStart={(e) => { dragging.current = true; const t = e.touches[0]; updateFromEvent(t.clientX, t.clientY); }}
        onTouchMove={(e) => { if (!dragging.current) return; const t = e.touches[0]; updateFromEvent(t.clientX, t.clientY); }}
        onTouchEnd={stop}
        className={`relative w-full ${aspectClass} rounded-lg overflow-hidden border border-gray-300 cursor-crosshair bg-gray-100 select-none`}
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Grille tiers */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.22) 1px, transparent 1px), ' +
            'linear-gradient(to bottom, rgba(255,255,255,0.22) 1px, transparent 1px)',
          backgroundSize: '33.333% 33.333%',
        }}></div>
        {/* Point focal */}
        <div
          className="absolute w-5 h-5 rounded-full bg-white border-2 border-blue-500 shadow-md pointer-events-none"
          style={{
            left: `${value.x}%`,
            top: `${value.y}%`,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.3)',
          }}
        ></div>
      </div>
      <div className="flex items-center justify-between text-[11px] font-mono text-gray-500">
        <span>Cliquez ou glissez sur la zone d'intérêt</span>
        <span>x:{value.x}% y:{value.y}%</span>
      </div>
    </div>
  );
}
