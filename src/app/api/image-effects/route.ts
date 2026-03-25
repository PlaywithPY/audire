import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/image-effects
 * Endpoint public pour récupérer les effets d'image d'une page
 * Query params: pageKey (required)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageKey = searchParams.get('pageKey');

    if (!pageKey) {
      return NextResponse.json({ error: 'pageKey required' }, { status: 400 });
    }

    // Récupérer uniquement les effets visibles
    const imageEffects = await prisma.imageEffect.findMany({
      where: {
        pageKey,
        isVisible: true,
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(imageEffects);
  } catch (error) {
    console.error('Error fetching image effects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image effects' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
