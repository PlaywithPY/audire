import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Récupérer les textes d'une page (route publique)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get('pageKey');

    if (!pageKey) {
      return NextResponse.json(
        { error: 'Missing pageKey parameter' },
        { status: 400 }
      );
    }

    const pageTexts = await prisma.pageText.findMany({
      where: { pageKey },
      orderBy: [
        { pageKey: 'asc' },
        { textKey: 'asc' }
      ]
    });

    // Transformer en objet { textKey: content }
    const textsMap = pageTexts.reduce((acc, text) => {
      acc[text.textKey] = text.content;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(textsMap);
  } catch (error: any) {
    console.error('Error fetching page texts:', error);

    // Messages d'erreur plus explicites
    if (error?.code === 'P1001') {
      return NextResponse.json({
        error: 'Cannot connect to database.',
        details: 'Database server is not reachable.'
      }, { status: 500 });
    }

    if (error?.code === 'P2021') {
      return NextResponse.json({
        error: 'Table PageText does not exist.',
        details: 'Please run database setup.'
      }, { status: 500 });
    }

    return NextResponse.json({
      error: 'Failed to fetch page texts',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
