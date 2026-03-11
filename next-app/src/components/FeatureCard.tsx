'use client';

import { useEffect, useState } from 'react';
import CardIcon from './CardIcon';

interface FeatureCardProps {
  cardKey: string;
  defaultIcon?: string;
  defaultTitle?: string;
  defaultDescription?: string;
}

export default function FeatureCard({
  cardKey,
  defaultIcon = '📷',
  defaultTitle = '',
  defaultDescription = ''
}: FeatureCardProps) {
  const [cardData, setCardData] = useState<{
    title: string;
    description: string;
    icon: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCardData() {
      try {
        const res = await fetch(`/api/cards?cardKey=${cardKey}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (data) {
          setCardData({
            title: data.title || defaultTitle,
            description: data.description || defaultDescription,
            icon: data.icon || defaultIcon,
          });
        }
      } catch (error) {
        console.error('Error fetching card data:', error);
        setCardData({
          title: defaultTitle,
          description: defaultDescription,
          icon: defaultIcon,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCardData();
  }, [cardKey, defaultIcon, defaultTitle, defaultDescription]);

  // Afficher les valeurs par défaut pendant le chargement
  if (loading || !cardData) {
    return (
      <div className="bg-bg p-6 rounded-2xl hover:shadow-lg transition-all">
        <div className="mb-4">
          <CardIcon cardKey={cardKey} defaultEmoji={defaultIcon} size={48} />
        </div>
        <h3 className="text-xl font-bold mb-2">{defaultTitle}</h3>
        <p className="text-text-light">{defaultDescription}</p>
      </div>
    );
  }

  return (
    <div className="bg-bg p-6 rounded-2xl hover:shadow-lg transition-all">
      <div className="mb-4">
        <CardIcon cardKey={cardKey} defaultEmoji={cardData.icon} size={48} />
      </div>
      <h3 className="text-xl font-bold mb-2">{cardData.title}</h3>
      <p className="text-text-light">{cardData.description}</p>
    </div>
  );
}
