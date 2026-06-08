import { prisma } from '@/lib/prisma';
import { getDefaultCardsForPage } from './card-definitions';

export interface CardData {
  cardKey: string;
  imageSrc: string;
  title: string;
  description: string;
  imageAlt: string;
  href: string;
  imagePosition: string;
  imageZoom?: number;
  fallbackEmoji: string;
}

/**
 * Récupère les cards depuis la DB pour une page spécifique et merge avec les valeurs par défaut
 */
export async function getFeatureCards(pageKey: string = 'home'): Promise<CardData[]> {
  try {
    // Récupérer les définitions par défaut pour cette page
    const defaultCards = getDefaultCardsForPage(pageKey);

    if (defaultCards.length === 0) {
      console.warn(`No default cards found for page: ${pageKey}`);
      return [];
    }

    const dbCards = await prisma.cardImage.findMany({
      where: { pageKey },
      orderBy: { cardKey: 'asc' },
    });

    // Créer un map des cards DB par cardKey
    const dbCardMap = new Map(dbCards.map(card => [card.cardKey, card]));

    // Merger les cards par défaut avec les données DB
    return defaultCards.map(defaultCard => {
      const dbCard = dbCardMap.get(defaultCard.cardKey);

      if (!dbCard) {
        return defaultCard; // Utiliser les valeurs par défaut
      }

      // Merger : priorité aux valeurs DB
      return {
        cardKey: defaultCard.cardKey,
        // Ne pas utiliser une chaîne vide comme imageSrc, utiliser l'image par défaut si pas d'imageUrl en DB
        imageSrc: dbCard.imageUrl && dbCard.imageUrl.trim() !== '' ? dbCard.imageUrl : defaultCard.imageSrc,
        title: dbCard.title || defaultCard.title,
        description: dbCard.description || defaultCard.description,
        imageAlt: dbCard.imageAlt || defaultCard.imageAlt,
        href: dbCard.href || defaultCard.href,
        imagePosition: dbCard.imagePosition || defaultCard.imagePosition,
        imageZoom: dbCard.imageZoom ?? 1,
        fallbackEmoji: dbCard.fallbackEmoji || defaultCard.fallbackEmoji,
      };
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des cards:', error);
    // En cas d'erreur, retourner les valeurs par défaut
    return getDefaultCardsForPage(pageKey);
  }
}
