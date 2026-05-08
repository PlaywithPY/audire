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

    const textsMap = pageTexts.reduce((acc, text) => {
      acc[text.textKey] = text.content;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(textsMap);
  } catch (error: any) {
    console.error('Error fetching page texts:', error);
    if (error?.code === 'P1001') {
      return NextResponse.json({ error: 'Cannot connect to database.', details: 'Database server is not reachable.' }, { status: 500 });
    }
    if (error?.code === 'P2021') {
      return NextResponse.json({ error: 'Table PageText does not exist.', details: 'Please run database setup.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to fetch page texts', details: error?.message || 'Unknown error' }, { status: 500 });
  }
}

// POST: Upsert d'un texte (route admin — utilisée par le nouvel éditeur click-to-edit)
// Accepte { pageKey, textKey, content }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageKey, textKey, content } = body;

    if (!pageKey || !textKey) {
      return NextResponse.json(
        { error: 'Missing pageKey or textKey' },
        { status: 400 }
      );
    }

    const result = await prisma.pageText.upsert({
      where: { pageKey_textKey: { pageKey, textKey } },
      create: { pageKey, textKey, content: content ?? '' },
      update: { content: content ?? '' },
    });

    return NextResponse.json({ ok: true, data: result });
  } catch (error: any) {
    console.error('Error saving page text:', error);
    return NextResponse.json(
      { error: 'Failed to save page text', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
