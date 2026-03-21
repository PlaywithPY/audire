'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

interface ParallaxSectionProps {
  imageSrc: string;
  alt?: string;
  speed?: number; // Vitesse du parallaxe (0.5 = moitié de la vitesse du scroll)
  height?: string;
  overlay?: boolean;
  children?: React.ReactNode;
}

export default function ParallaxSection({
  imageSrc,
  alt = 'Parallax background',
  speed = 0.5,
  height = '500px',
  overlay = true,
  children
}: ParallaxSectionProps) {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!parallaxRef.current || !imageRef.current) return;

      const scrolled = window.scrollY;
      const elementTop = parallaxRef.current.offsetTop;
      const elementHeight = parallaxRef.current.offsetHeight;
      const windowHeight = window.innerHeight;

      // Calculer si l'élément est visible dans le viewport
      const isVisible = scrolled + windowHeight > elementTop && scrolled < elementTop + elementHeight;

      if (isVisible) {
        // Calculer le déplacement en fonction de la position de scroll
        const relativeScroll = scrolled - elementTop + windowHeight;
        const parallaxOffset = relativeScroll * (1 - speed);

        imageRef.current.style.transform = `translateY(${parallaxOffset * speed}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <section
      ref={parallaxRef}
      className="relative overflow-hidden"
      style={{ height }}
    >
      {/* Image avec effet parallaxe */}
      <div
        ref={imageRef}
        className="absolute inset-0 w-full"
        style={{
          height: '200%', // Plus haute pour permettre le mouvement
          top: '-50%'
        }}
      >
        <div className="relative w-full h-full">
          <Image
            src={imageSrc}
            alt={alt}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      </div>

      {/* Overlay sombre optionnel */}
      {overlay && (
        <div className="absolute inset-0 bg-black/30" />
      )}

      {/* Contenu par-dessus */}
      {children && (
        <div className="relative z-10 h-full flex items-center justify-center">
          {children}
        </div>
      )}
    </section>
  );
}
