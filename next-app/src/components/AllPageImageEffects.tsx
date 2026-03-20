'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

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

type AllPageImageEffectsProps = {
  pageKey: string;
  className?: string;
};

/**
 * Charge et affiche TOUS les effets d'images pour une page donnée
 * Optimisé : une seule requête API pour tous les effets
 */
export default function AllPageImageEffects({
  pageKey,
  className = '',
}: AllPageImageEffectsProps) {
  const [effects, setEffects] = useState<ImageEffect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllEffects();
  }, [pageKey]);

  async function fetchAllEffects() {
    try {
      console.log(`🔍 [AllPageImageEffects] Fetching all image effects for page: ${pageKey}`);
      const res = await fetch(`/api/image-effects?pageKey=${pageKey}`);

      if (!res.ok) {
        console.error('❌ [AllPageImageEffects] API error:', res.status);
        setEffects([]);
        return;
      }

      const data: ImageEffect[] = await res.json();

      // Filtrer uniquement les effets visibles et les trier par ordre
      const visibleEffects = data
        .filter(e => e.isVisible)
        .sort((a, b) => a.order - b.order);

      console.log(`📦 [AllPageImageEffects] Loaded ${visibleEffects.length} visible effect(s) for page "${pageKey}"`);
      visibleEffects.forEach(effect => {
        console.log(`   ✓ Section "${effect.sectionKey}": ${effect.effectType} (order: ${effect.order})`);
      });

      setEffects(visibleEffects);
    } catch (error) {
      console.error('💥 [AllPageImageEffects] Error fetching effects:', error);
      setEffects([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return null;
  }

  if (effects.length === 0) {
    console.log(`ℹ️ [AllPageImageEffects] No effects to render for page "${pageKey}"`);
    return null;
  }

  // Rendre tous les effets dans l'ordre
  return (
    <>
      {effects.map((effect) => (
        <SingleImageEffect
          key={effect.id}
          imageEffect={effect}
          className={className}
        />
      ))}
    </>
  );
}

// Composant pour rendre un seul effet (copie de la logique de ImageEffectsRenderer)
function SingleImageEffect({ imageEffect, className }: { imageEffect: ImageEffect; className: string }) {
  switch (imageEffect.effectType) {
    case 'parallax':
      return <ParallaxEffect imageEffect={imageEffect} className={className} />;
    case 'zoom':
      return <ZoomEffect imageEffect={imageEffect} className={className} />;
    case 'fade':
      return <FadeEffect imageEffect={imageEffect} className={className} />;
    case 'fixed':
      return <FixedEffect imageEffect={imageEffect} className={className} />;
    case 'slide':
      return <SlideEffect imageEffect={imageEffect} className={className} />;
    case 'none':
    default:
      return <SimpleImage imageEffect={imageEffect} className={className} />;
  }
}

// Effet Parallax
function ParallaxEffect({ imageEffect, className }: { imageEffect: ImageEffect; className: string }) {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!parallaxRef.current || !imageRef.current) return;

      const scrolled = window.scrollY;
      const elementTop = parallaxRef.current.offsetTop;
      const elementHeight = parallaxRef.current.offsetHeight;
      const windowHeight = window.innerHeight;

      const isVisible = scrolled + windowHeight > elementTop && scrolled < elementTop + elementHeight;

      if (isVisible) {
        const relativeScroll = scrolled - elementTop + windowHeight;
        const parallaxOffset = relativeScroll * (1 - imageEffect.effectSpeed);
        imageRef.current.style.transform = `translateY(${parallaxOffset * imageEffect.effectSpeed}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [imageEffect.effectSpeed]);

  return (
    <section
      ref={parallaxRef}
      className={`relative overflow-hidden ${className}`}
      style={{ minHeight: imageEffect.minHeight }}
    >
      <div
        ref={imageRef}
        className="absolute inset-0 w-full"
        style={{ height: '120%', top: '-10%' }}
      >
        <div className="relative w-full h-full">
          <Image
            src={imageEffect.imageUrl}
            alt={imageEffect.alt || 'Image parallax'}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      </div>
      {imageEffect.overlayColor && (
        <div className="absolute inset-0" style={{ backgroundColor: imageEffect.overlayColor }} />
      )}
    </section>
  );
}

// Effet Zoom
function ZoomEffect({ imageEffect, className }: { imageEffect: ImageEffect; className: string }) {
  const zoomRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!zoomRef.current || !imageRef.current) return;

      const scrolled = window.scrollY;
      const elementTop = zoomRef.current.offsetTop;
      const elementHeight = zoomRef.current.offsetHeight;
      const windowHeight = window.innerHeight;
      const isVisible = scrolled + windowHeight > elementTop && scrolled < elementTop + elementHeight;

      if (isVisible) {
        const relativeScroll = scrolled - elementTop + windowHeight;
        const progress = Math.min(relativeScroll / (elementHeight + windowHeight), 1);
        const scale = 1 + (imageEffect.effectScale - 1) * progress;
        imageRef.current.style.transform = `scale(${scale})`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [imageEffect.effectScale]);

  return (
    <section
      ref={zoomRef}
      className={`relative overflow-hidden ${className}`}
      style={{ minHeight: imageEffect.minHeight }}
    >
      <div ref={imageRef} className="absolute inset-0 w-full h-full transition-transform duration-100">
        <Image
          src={imageEffect.imageUrl}
          alt={imageEffect.alt || 'Image zoom'}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>
      {imageEffect.overlayColor && (
        <div className="absolute inset-0" style={{ backgroundColor: imageEffect.overlayColor }} />
      )}
    </section>
  );
}

// Effet Fade
function FadeEffect({ imageEffect, className }: { imageEffect: ImageEffect; className: string }) {
  const fadeRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!fadeRef.current || !imageRef.current) return;

      const scrolled = window.scrollY;
      const elementTop = fadeRef.current.offsetTop;
      const elementHeight = fadeRef.current.offsetHeight;
      const windowHeight = window.innerHeight;
      const isVisible = scrolled + windowHeight > elementTop && scrolled < elementTop + elementHeight;

      if (isVisible) {
        const relativeScroll = scrolled - elementTop + windowHeight;
        const progress = Math.min(relativeScroll / (elementHeight + windowHeight), 1);
        let opacity = 1;
        if (progress < 0.3) {
          opacity = progress / 0.3;
        } else if (progress > 0.7) {
          opacity = (1 - progress) / 0.3;
        }
        imageRef.current.style.opacity = `${opacity}`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={fadeRef}
      className={`relative overflow-hidden ${className}`}
      style={{ minHeight: imageEffect.minHeight }}
    >
      <div ref={imageRef} className="absolute inset-0 w-full h-full transition-opacity duration-300">
        <Image
          src={imageEffect.imageUrl}
          alt={imageEffect.alt || 'Image fade'}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>
      {imageEffect.overlayColor && (
        <div className="absolute inset-0" style={{ backgroundColor: imageEffect.overlayColor }} />
      )}
    </section>
  );
}

// Effet Fixed
function FixedEffect({ imageEffect, className }: { imageEffect: ImageEffect; className: string }) {
  return (
    <section
      className={`relative overflow-hidden ${className}`}
      style={{ minHeight: imageEffect.minHeight }}
    >
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${imageEffect.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />
      {imageEffect.overlayColor && (
        <div className="absolute inset-0" style={{ backgroundColor: imageEffect.overlayColor }} />
      )}
    </section>
  );
}

// Effet Slide
function SlideEffect({ imageEffect, className }: { imageEffect: ImageEffect; className: string }) {
  const slideRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!slideRef.current || !imageRef.current) return;

      const scrolled = window.scrollY;
      const elementTop = slideRef.current.offsetTop;
      const elementHeight = slideRef.current.offsetHeight;
      const windowHeight = window.innerHeight;
      const isVisible = scrolled + windowHeight > elementTop && scrolled < elementTop + elementHeight;

      if (isVisible) {
        const relativeScroll = scrolled - elementTop + windowHeight;
        const progress = relativeScroll / (elementHeight + windowHeight);
        const translateX = (progress - 0.5) * 100 * imageEffect.effectSpeed;
        imageRef.current.style.transform = `translateX(${translateX}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [imageEffect.effectSpeed]);

  return (
    <section
      ref={slideRef}
      className={`relative overflow-hidden ${className}`}
      style={{ minHeight: imageEffect.minHeight }}
    >
      <div ref={imageRef} className="absolute inset-0 w-full h-full transition-transform duration-100">
        <Image
          src={imageEffect.imageUrl}
          alt={imageEffect.alt || 'Image slide'}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>
      {imageEffect.overlayColor && (
        <div className="absolute inset-0" style={{ backgroundColor: imageEffect.overlayColor }} />
      )}
    </section>
  );
}

// Image simple
function SimpleImage({ imageEffect, className }: { imageEffect: ImageEffect; className: string }) {
  return (
    <section
      className={`relative overflow-hidden ${className}`}
      style={{ minHeight: imageEffect.minHeight }}
    >
      <div className="relative w-full h-full">
        <Image
          src={imageEffect.imageUrl}
          alt={imageEffect.alt || 'Image'}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>
      {imageEffect.overlayColor && (
        <div className="absolute inset-0" style={{ backgroundColor: imageEffect.overlayColor }} />
      )}
    </section>
  );
}
