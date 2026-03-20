import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * API publique pour récupérer les blocs d'une page
 * GET /api/blocks?pageKey=home
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get('pageKey');

    if (!pageKey) {
      return NextResponse.json({ error: 'pageKey is required' }, { status: 400 });
    }

    const blocks = await prisma.contentBlock.findMany({
      where: {
        pageKey,
        isVisible: true // Ne retourner que les blocs visibles
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(blocks);
  } catch (error) {
    console.error('Error fetching blocks:', error);
    // Return empty array instead of error object to prevent client-side crashes
    return NextResponse.json([]);
  }
}
