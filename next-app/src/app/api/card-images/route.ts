import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDefaultCardsForPage } from '@/lib/card-definitions';

// GET public - Récupérer les images de cards (optionnel: filtrer par pageKey)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get('pageKey');

    if (pageKey) {
      // Récupérer les cards de la DB pour cette page
      const dbCards = await prisma.cardImage.findMany({
        where: { pageKey },
        orderBy: { cardKey: 'asc' },
      });

      // Récupérer les defaults
      const defaultCards = getDefaultCardsForPage(pageKey);

      // Merger les cards
      const dbCardMap = new Map(dbCards.map(card => [card.cardKey, card]));

      const mergedCards = defaultCards.map(defaultCard => {
        const dbCard = dbCardMap.get(defaultCard.cardKey);

        if (!dbCard) {
          return defaultCard;
        }

        return {
          cardKey: defaultCard.cardKey,
          imageSrc: dbCard.imageUrl || '',
          title: dbCard.title || defaultCard.title,
          description: dbCard.description || defaultCard.description,
          imageAlt: dbCard.imageAlt || defaultCard.imageAlt,
          href: dbCard.href || defaultCard.href,
          imagePosition: dbCard.imagePosition || defaultCard.imagePosition,
          fallbackEmoji: dbCard.fallbackEmoji || defaultCard.fallbackEmoji,
        };
      });

      return NextResponse.json(mergedCards);
    } else {
      // Retourner toutes les cards (pour compatibilité)
      const cardImages = await prisma.cardImage.findMany({
        orderBy: { cardKey: 'asc' },
      });
      return NextResponse.json(cardImages);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des images:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
