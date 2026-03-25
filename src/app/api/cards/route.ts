import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Désactiver le cache pour cette route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Route API pour récupérer les cards (blocs de type 'card')
 * GET /api/cards?cardKey=hero-features-test
 * GET /api/cards (retourne toutes les cards)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cardKey = searchParams.get('cardKey');

    if (cardKey) {
      // Récupérer une card spécifique
      const card = await prisma.contentBlock.findFirst({
        where: {
          blockType: 'card',
          blockKey: cardKey,
          isVisible: true,
        },
      });

      if (!card) {
        return NextResponse.json(null);
      }

      // Parser les métadonnées
      const metadata = card.metadata ? JSON.parse(card.metadata) : {};

      return NextResponse.json({
        cardKey: card.blockKey,
        title: card.content,
        icon: metadata.icon || '📷',
        imageUrl: metadata.imageUrl || null,
        description: metadata.description || '',
      });
    } else {
      // Récupérer toutes les cards visibles
      const cards = await prisma.contentBlock.findMany({
        where: {
          blockType: 'card',
          isVisible: true,
        },
        orderBy: {
          order: 'asc',
        },
      });

      const formattedCards = cards.map((card) => {
        const metadata = card.metadata ? JSON.parse(card.metadata) : {};
        return {
          cardKey: card.blockKey,
          pageKey: card.pageKey,
          title: card.content,
          icon: metadata.icon || '📷',
          imageUrl: metadata.imageUrl || null,
          description: metadata.description || '',
        };
      });

      return NextResponse.json(formattedCards);
    }
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
  }
}
