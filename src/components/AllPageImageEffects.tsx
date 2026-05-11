'use client';

// Sprint 5.1 — fix : la couche d'édition était sous le contenu de la page (zIndex 0).
// On sépare maintenant en DEUX couches :
//   1. Couche visuelle  → fixed inset-0, zIndex 0, pointer-events:none (INCHANGÉ)
//   2. Couche "poignées d'édition" → fixed inset-0, zIndex 40, pointer-events:none
//      avec le bouton "📷 Modifier" en pointer-events:auto.
// Hors édition, la couche 2 n'est pas rendue → comportement strictement identique.

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
    <>
      {/* COUCHE 1 — visuelle, comportement strictement identique à avant */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {effects.map((effect) => (
          <PositionedImageEffect key={effect.id} imageEffect={effect} className={className} />
        ))}
      </div>

      {/* COUCHE 2 — poignées d'édition au-dessus de tout, uniquement en mode édition */}
      {editMode && (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 40 }}>
          {effects.map((effect) => (
            <PositionedEditHandle key={`handle-${effect.id}`} imageEffect={effect} />
          ))}
        </div>
      )}
    </>
  );
}

// Hook commun : calcule la position top de la section associée à l'effet
function useSectionTop(sectionKey: string) {
  const [position, setPosition] = useState<{ top: number } | null>(null);
  useEffect(() => {
    const update = () => {
      const section = document.querySelector(`[data-section="${sectionKey}"]`) as HTMLElement;
      if (section) {
        const rect = section.getBoundingClientRect();
        setPosition({ top: rect.top + (window.scrollY || window.pageYOffset) });
      }
    };
    update();
    window.addEventListener('resize', update);
    const t = setTimeout(update, 500);
    return () => { window.removeEventListener('resize', update); clearTimeout(t); };
  }, [sectionKey]);
  return position;
}

// Couche 1 — rendu visuel, inchangé
function PositionedImageEffect({ imageEffect, className }: { imageEffect: ImageEffect; className: string }) {
  const position = useSectionTop(imageEffect.sectionKey);
  if (!position) return null;
  return (
    <div className="absolute left-0 right-0 w-full pointer-events-none"
      style={{ top: `${position.top}px`, height: imageEffect.minHeight }}>
      <SingleImageEffect imageEffect={imageEffect} className={className} />
    </div>
  );
}

// Couche 2 — poignée d'édition (bouton flottant + ring de focus au survol)
function PositionedEditHandle({ imageEffect }: { imageEffect: ImageEffect }) {
  const position = useSectionTop(imageEffect.sectionKey);
  const [hover, setHover] = useState(false);
  if (!position) return null;
  return (
    <div
      className="absolute left-0 right-0 w-full"
      style={{
        top: `${position.top}px`,
        height: imageEffect.minHeight,
        pointerEvents: 'none', // tout est non-cliquable…
      }}
    >
      {/* Zone de hover transparente — pointer-events:auto seulement quand on
          n'est pas en train de cliquer du contenu (le bouton lui-même reste cliquable).
          On utilise un overlay qui détecte l'entrée souris MAIS laisse passer les clics. */}
      <div
        className="absolute inset-0"
        style={{ pointerEvents: 'none' }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      />
      {/* Ring de focus quand le bouton est survolé */}
      <div
        className="absolute inset-0 transition-all duration-150"
        style={{
          pointerEvents: 'none',
          boxShadow: hover ? 'inset 0 0 0 3px rgba(59,130,246,0.7)' : 'inset 0 0 0 0 transparent',
        }}
      />
      {/* Le bouton — pointer-events:auto, unique élément cliquable */}
      <button
        type="button"
        data-edit-block={`image-effect:${imageEffect.pageKey}:${imageEffect.sectionKey}`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="absolute top-3 right-3 bg-white/95 hover:bg-white text-blue-700 border border-blue-300 shadow-lg rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1.5"
        style={{ pointerEvents: 'auto' }}
        title={`Modifier l'image de fond — ${imageEffect.effectType}`}
      >
        <ImageIcon className="w-3.5 h-3.5" /> Modifier l'image
        <span className="ml-1.5 text-[10px] font-mono text-blue-500/80">{imageEffect.sectionKey}</span>
      </button>
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
