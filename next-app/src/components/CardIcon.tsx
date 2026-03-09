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
    async function fetchCardImage() {
      try {
        const res = await fetch('/api/admin/card-images');
        const data = await res.json();
        const image = data.find((img: any) => img.cardKey === cardKey);
        setCardImage(image || null);
      } catch (error) {
        console.error('Error fetching card image:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCardImage();
  }, [cardKey]);

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

  // Si l'image a échoué à charger, utiliser le fallback emoji
  if (imageError) {
    return (
      <span className={`text-${size === 48 ? '5xl' : '4xl'} ${className}`}>
        {cardImage.fallbackEmoji}
      </span>
    );
  }

  // Essayer d'afficher l'image
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
