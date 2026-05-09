'use client';

// Sprint 5 — Mode édition inline pour les effets d'image plein écran (parallax/zoom/etc).
// Le rendu visuel est STRICTEMENT identique à avant pour ne pas casser les images existantes
// (notamment la "vague" sur la home). Le mode édition se déclenche via ?edit=1 et :
//   - retire pointer-events-none sur les wrappers
//   - ajoute un bouton flottant "📷 Modifier" en survol
//   - met data-edit-block="image-effect:<pageKey>:<sectionKey>" sur ce bouton
//     (l'éditeur l'écoute déjà via le sélecteur générique des blocs éditables).

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

type ImageEffect = {
  id: number;
  imageUrl: string;
  effectType: 'parallax' | 'zoom' | 'fade' | 'slide' | 'fixed' | 'none';
  effectSpeed: number;
  effectScale: number;
  pageKey: string;
  sectionKey: string;
  order: number;
  isVisible: boolean;
  alt: string | null;
  overlayColor: string | null;
  minHeight: string;
};

type Props = { pageKey: string; className?: string };

export default function AllPageImageEffects({ pageKey, className = '' }: Props) {
  const [effects, setEffects] = useState<ImageEffect[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    setEditMode(new URLSearchParams(window.location.search).get('edit') === '1');
  }, []);

  useEffect(() => { fetchAllEffects(); }, [pageKey]);

  // Rafraîchit quand l'éditeur publie une modif
  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.data?.type === 'editor:image-effects-changed') fetchAllEffects();
    }
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  async function fetchAllEffects() {
    try {
      const res = await fetch(`/api/image-effects?pageKey=${pageKey}`);
      if (!res.ok) { setEffects([]); return; }
      const data: ImageEffect[] = await res.json();
      setEffects(data.filter(e => e.isVisible).sort((a, b) => a.order - b.order));
    } catch { setEffects([]); }
    finally { setLoading(false); }
  }

  if (loading || effects.length === 0) return null;

  return (
    // En édition : pointer-events-auto pour permettre le clic sur le bouton flottant.
    // Hors édition : pointer-events-none, comportement identique à l'ancienne version.
    <div className="fixed inset-0" style={{ zIndex: 0, pointerEvents: editMode ? 'auto' : 'none' }}>
      {effects.map((effect) => (
        <PositionedImageEffect key={effect.id} imageEffect={effect} className={className} editMode={editMode} />
      ))}
    </div>
  );
}

function PositionedImageEffect({ imageEffect, className, editMode }: { imageEffect: ImageEffect; className: string; editMode: boolean }) {
  const [position, setPosition] = useState<{ top: number } | null>(null);

  useEffect(() => {
    const update = () => {
      const section = document.querySelector(`[data-section="${imageEffect.sectionKey}"]`) as HTMLElement;
      if (section) {
        const rect = section.getBoundingClientRect();
        setPosition({ top: rect.top + (window.scrollY || window.pageYOffset) });
      }
    };
    update();
    window.addEventListener('resize', update);
    const t = setTimeout(update, 500);
    return () => { window.removeEventListener('resize', update); clearTimeout(t); };
  }, [imageEffect.sectionKey]);

  if (!position) return null;

  return (
    <div className="absolute left-0 right-0 w-full group/effect"
      style={{ top: `${position.top}px`, height: imageEffect.minHeight, pointerEvents: editMode ? 'auto' : 'none' }}>
      <SingleImageEffect imageEffect={imageEffect} className={className} />

      {/* Mode édition : surcouche cliquable + bouton "Modifier l'image" en haut-droite */}
      {editMode && (
        <>
          <div className="absolute inset-0 ring-2 ring-blue-500/0 group-hover/effect:ring-blue-500/60 transition-all" style={{ pointerEvents: 'none' }} />
          <button
            type="button"
            data-edit-block={`image-effect:${imageEffect.pageKey}:${imageEffect.sectionKey}`}
            className="absolute top-3 right-3 bg-white/95 hover:bg-white text-blue-700 border border-blue-300 shadow-lg rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1.5 opacity-0 group-hover/effect:opacity-100 transition-opacity"
            style={{ pointerEvents: 'auto', zIndex: 50 }}
            title={`Modifier l'image de fond — ${imageEffect.effectType}`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Modifier l'image
            <span className="ml-1.5 text-[10px] font-mono text-blue-500/80">{imageEffect.sectionKey}</span>
          </button>
        </>
      )}
    </div>
  );
}

function SingleImageEffect({ imageEffect, className }: { imageEffect: ImageEffect; className: string }) {
  switch (imageEffect.effectType) {
    case 'parallax': return <ParallaxEffect imageEffect={imageEffect} className={className} />;
    case 'zoom':     return <ZoomEffect imageEffect={imageEffect} className={className} />;
    case 'fade':     return <FadeEffect imageEffect={imageEffect} className={className} />;
    case 'fixed':    return <FixedEffect imageEffect={imageEffect} className={className} />;
    case 'slide':    return <SlideEffect imageEffect={imageEffect} className={className} />;
    case 'none':
    default:         return <SimpleImage imageEffect={imageEffect} className={className} />;
  }
}

function ParallaxEffect({ imageEffect, className }: { imageEffect: ImageEffect; className: string }) {
  const ref = useRef<HTMLDivElement>(null); const imgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current || !imgRef.current) return;
      const scrolled = window.scrollY, top = ref.current.offsetTop, h = ref.current.offsetHeight, wh = window.innerHeight;
      if (scrolled + wh > top && scrolled < top + h) {
        const rel = scrolled - top + wh, off = rel * (1 - imageEffect.effectSpeed);
        imgRef.current.style.transform = `translateY(${off * imageEffect.effectSpeed}px)`;
      }
    };
    window.addEventListener('scroll', onScroll); onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [imageEffect.effectSpeed]);
  return (
    <div ref={ref} className={`absolute inset-0 overflow-hidden ${className}`}>
      <div ref={imgRef} className="absolute inset-0 w-full" style={{ height: '120%', top: '-10%' }}>
        <div className="relative w-full h-full"><Image src={imageEffect.imageUrl} alt={imageEffect.alt || 'Image parallax'} fill className="object-cover" priority sizes="100vw" /></div>
      </div>
      {imageEffect.overlayColor && <div className="absolute inset-0" style={{ backgroundColor: imageEffect.overlayColor }} />}
    </div>
  );
}

function ZoomEffect({ imageEffect, className }: { imageEffect: ImageEffect; className: string }) {
  const ref = useRef<HTMLDivElement>(null); const imgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current || !imgRef.current) return;
      const scrolled = window.scrollY, top = ref.current.offsetTop, h = ref.current.offsetHeight, wh = window.innerHeight;
      if (scrolled + wh > top && scrolled < top + h) {
        const p = Math.min((scrolled - top + wh) / (h + wh), 1);
        imgRef.current.style.transform = `scale(${1 + (imageEffect.effectScale - 1) * p})`;
      }
    };
    window.addEventListener('scroll', onScroll); onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [imageEffect.effectScale]);
  return (
    <div ref={ref} className={`absolute inset-0 overflow-hidden ${className}`}>
      <div ref={imgRef} className="absolute inset-0 w-full h-full transition-transform duration-100">
        <Image src={imageEffect.imageUrl} alt={imageEffect.alt || 'Image zoom'} fill className="object-cover" priority sizes="100vw" />
      </div>
      {imageEffect.overlayColor && <div className="absolute inset-0" style={{ backgroundColor: imageEffect.overlayColor }} />}
    </div>
  );
}

function FadeEffect({ imageEffect, className }: { imageEffect: ImageEffect; className: string }) {
  const ref = useRef<HTMLDivElement>(null); const imgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current || !imgRef.current) return;
      const scrolled = window.scrollY, top = ref.current.offsetTop, h = ref.current.offsetHeight, wh = window.innerHeight;
      if (scrolled + wh > top && scrolled < top + h) {
        const p = Math.min((scrolled - top + wh) / (h + wh), 1);
        let opacity = 1; if (p < 0.3) opacity = p / 0.3; else if (p > 0.7) opacity = (1 - p) / 0.3;
        imgRef.current.style.opacity = `${opacity}`;
      }
    };
    window.addEventListener('scroll', onScroll); onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div ref={ref} className={`absolute inset-0 overflow-hidden ${className}`}>
      <div ref={imgRef} className="absolute inset-0 w-full h-full transition-opacity duration-300">
        <Image src={imageEffect.imageUrl} alt={imageEffect.alt || 'Image fade'} fill className="object-cover" priority sizes="100vw" />
      </div>
      {imageEffect.overlayColor && <div className="absolute inset-0" style={{ backgroundColor: imageEffect.overlayColor }} />}
    </div>
  );
}

function FixedEffect({ imageEffect, className }: { imageEffect: ImageEffect; className: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute inset-0 w-full h-full" style={{ backgroundImage: `url(${imageEffect.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }} />
      {imageEffect.overlayColor && <div className="absolute inset-0" style={{ backgroundColor: imageEffect.overlayColor }} />}
    </div>
  );
}

function SlideEffect({ imageEffect, className }: { imageEffect: ImageEffect; className: string }) {
  const ref = useRef<HTMLDivElement>(null); const imgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current || !imgRef.current) return;
      const scrolled = window.scrollY, top = ref.current.offsetTop, h = ref.current.offsetHeight, wh = window.innerHeight;
      if (scrolled + wh > top && scrolled < top + h) {
        const p = (scrolled - top + wh) / (h + wh);
        imgRef.current.style.transform = `translateX(${(p - 0.5) * 100 * imageEffect.effectSpeed}px)`;
      }
    };
    window.addEventListener('scroll', onScroll); onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [imageEffect.effectSpeed]);
  return (
    <div ref={ref} className={`absolute inset-0 overflow-hidden ${className}`}>
      <div ref={imgRef} className="absolute inset-0 w-full h-full transition-transform duration-100">
        <Image src={imageEffect.imageUrl} alt={imageEffect.alt || 'Image slide'} fill className="object-cover" priority sizes="100vw" />
      </div>
      {imageEffect.overlayColor && <div className="absolute inset-0" style={{ backgroundColor: imageEffect.overlayColor }} />}
    </div>
  );
}

function SimpleImage({ imageEffect, className }: { imageEffect: ImageEffect; className: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div className="relative w-full h-full"><Image src={imageEffect.imageUrl} alt={imageEffect.alt || 'Image'} fill className="object-cover" priority sizes="100vw" /></div>
      {imageEffect.overlayColor && <div className="absolute inset-0" style={{ backgroundColor: imageEffect.overlayColor }} />}
    </div>
  );
}
