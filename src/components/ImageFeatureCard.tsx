'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ImageFeatureCardProps {
  imageSrc?: string;
  title: string;
  description: string;
  imageAlt?: string;
  href?: string;
  imagePosition?: string; // e.g., "center 30%", "center top", etc.
  fallbackEmoji?: string; // Emoji à afficher si pas d'image
  // ── Feature Cards Editor ───────────────────────────────────────────────
  // Quand pageKey + cardKey sont fournis ET que la page est ouverte dans
  // l'éditeur (/admin/editor → iframe avec ?edit=1), la card devient
  // sélectionnable et éditable inline (image, cadrage, titre, texte, lien).
  // En production normale, ces props n'ont aucun effet visible.
  pageKey?: string;
  cardKey?: string;
}

export default function ImageFeatureCard({
  imageSrc,
  title,
  description,
  imageAlt = 'Feature image',
  href,
  imagePosition = 'center 35%', // Décentré vers le bas par défaut
  fallbackEmoji = '📷',
  pageKey,
  cardKey,
}: ImageFeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  // Déterminer si on doit afficher l'emoji
  // On affiche l'emoji si : pas d'imageSrc, imageSrc est vide, ou erreur de chargement
  const shouldShowEmoji = !imageSrc || imageSrc.trim() === '' || imageError;

  // Détecte le mode édition : page rendue dans l'iframe de l'éditeur avec ?edit=1.
  // On le fait dans un effet (jamais au SSR) pour éviter tout mismatch d'hydratation :
  // l'attribut data-edit-block n'apparaît qu'après le montage côté client, ce qui
  // suffit largement car EditorOverlay branche ses listeners après le chargement.
  useEffect(() => {
    try {
      if (window.parent !== window && new URLSearchParams(window.location.search).has('edit')) {
        setEditMode(true);
      }
    } catch {
      /* contexte cross-origin — on ignore */
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!cardRef.current || !imageRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Vérifier si la card est visible
      if (rect.top < windowHeight && rect.bottom > 0) {
        // Calculer le pourcentage de visibilité
        const scrollProgress = (windowHeight - rect.top) / (windowHeight + rect.height);
        const parallaxOffset = (scrollProgress - 0.5) * 20; // Effet subtil de ±20px

        imageRef.current.style.transform = `translateY(${parallaxOffset}px) scale(${isHovered ? 1.05 : 1})`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHovered]);

  // L'éditeur ne peut cibler la card que si on connaît son identité.
  const canEdit = editMode && !!pageKey && !!cardKey;

  // Attributs lus par EditorOverlay : data-edit-block identifie la card,
  // les data-edit-* sont sérialisés dans `data.*` pour préremplir l'inspecteur.
  const editAttrs: Record<string, string> = canEdit
    ? {
        'data-edit-block': `card:${pageKey}:${cardKey}`,
        'data-edit-title': title ?? '',
        'data-edit-description': description ?? '',
        'data-edit-href': href ?? '',
        'data-edit-image': imageSrc ?? '',
        'data-edit-position': imagePosition ?? '',
        'data-edit-alt': imageAlt ?? '',
        'data-edit-emoji': fallbackEmoji ?? '',
      }
    : {};

  const CardContent = () => (
    <div
      ref={cardRef}
      className="bg-bg rounded-2xl shadow-md overflow-hidden group cursor-pointer transition-shadow hover:shadow-xl h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Container pour l'image/emoji avec effet parallax */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-primary-light/20">
        {shouldShowEmoji ? (
          /* Affichage de l'emoji (fallback) */
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl animate-float">{fallbackEmoji}</span>
          </div>
        ) : (
          /* Affichage de l'image avec parallax */
          <>
            {/* Placeholder emoji pendant le chargement */}
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl animate-float opacity-50">{fallbackEmoji}</span>
              </div>
            )}
            <div
              ref={imageRef}
              className="absolute inset-0 transition-transform duration-500 ease-out"
            >
              <Image
                src={imageSrc!}
                alt={imageAlt}
                fill
                className="object-cover"
                style={{ objectPosition: imagePosition }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
                onLoad={() => setImageLoading(false)}
              />
            </div>
            {/* Overlay léger pour améliorer la lisibilité */}
            {!imageLoading && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            )}
          </>
        )}
      </div>

      {/* Contenu de la card */}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">
          {title}
        </h3>
        <p className="text-text-light">
          {description}
        </p>
      </div>
    </div>
  );

  // En mode édition : on désactive la navigation (le lien) pour que le clic
  // sélectionne la card dans l'éditeur au lieu d'ouvrir la page de destination.
  if (canEdit) {
    return (
      <div {...editAttrs} className="block h-full">
        <CardContent />
      </div>
    );
  }

  if (href) {
    return (
      <Link href={href} className="block h-full">
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
}
