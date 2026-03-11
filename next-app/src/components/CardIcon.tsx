'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface CardIconProps {
  cardKey: string;
  defaultEmoji?: string;
  className?: string;
  size?: number;
}

export default function CardIcon({
  cardKey,
  defaultEmoji = '📷',
  className = '',
  size = 48
}: CardIconProps) {
  const [cardImage, setCardImage] = useState<{
    imageUrl: string;
    fallbackEmoji: string;
  } | null>(null);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCardData() {
      try {
        const res = await fetch(`/api/cards?cardKey=${cardKey}`);
        const data = await res.json();
        if (data) {
          setCardImage({
            imageUrl: data.imageUrl || '',
            fallbackEmoji: data.icon || defaultEmoji,
          });
        }
      } catch (error) {
        console.error('Error fetching card data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCardData();
  }, [cardKey, defaultEmoji]);

  // Si on charge, afficher l'emoji par défaut
  if (loading) {
    return (
      <span className={`text-${size === 48 ? '5xl' : '4xl'} ${className}`}>
        {defaultEmoji}
      </span>
    );
  }

  // Si pas d'image configurée, utiliser l'emoji par défaut
  if (!cardImage) {
    return (
      <span className={`text-${size === 48 ? '5xl' : '4xl'} ${className}`}>
        {defaultEmoji}
      </span>
    );
  }

  // Si pas d'imageUrl, afficher l'emoji
  if (!cardImage.imageUrl) {
    return (
      <span className={`text-${size === 48 ? '5xl' : '4xl'} ${className}`}>
        {cardImage.fallbackEmoji || defaultEmoji}
      </span>
    );
  }

  // Si l'image a échoué à charger, utiliser le fallback emoji
  if (imageError) {
    return (
      <span className={`text-${size === 48 ? '5xl' : '4xl'} ${className}`}>
        {cardImage.fallbackEmoji || defaultEmoji}
      </span>
    );
  }

  // Afficher l'image
  return (
    <div className={className} style={{ width: size, height: size }}>
      <Image
        src={cardImage.imageUrl}
        alt={cardKey}
        width={size}
        height={size}
        onError={() => setImageError(true)}
        className="object-contain"
      />
    </div>
  );
}
