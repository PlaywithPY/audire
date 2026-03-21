import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Récupérer tous les textes (ou filtrer par pageKey)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get('pageKey');

    const where = pageKey ? { pageKey } : {};
    const pageTexts = await prisma.pageText.findMany({
      where,
      orderBy: [
        { pageKey: 'asc' },
        { textKey: 'asc' }
      ]
    });

    return NextResponse.json(pageTexts);
  } catch (error) {
    console.error('Error fetching page texts:', error);
    return NextResponse.json({ error: 'Failed to fetch page texts' }, { status: 500 });
  }
}

// POST: Créer un nouveau texte
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { pageKey, textKey, content, label } = body;

    const pageText = await prisma.pageText.create({
      data: {
        pageKey,
        textKey,
        content,
        label: label || null,
      },
    });

    return NextResponse.json(pageText);
  } catch (error) {
    console.error('Error creating page text:', error);
    return NextResponse.json({ error: 'Failed to create page text' }, { status: 500 });
  }
}

// PUT: Mettre à jour un texte existant
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, content, label } = body;

    const pageText = await prisma.pageText.update({
      where: { id },
      data: {
        content,
        label: label || null,
      },
    });

    return NextResponse.json(pageText);
  } catch (error) {
    console.error('Error updating page text:', error);
    return NextResponse.json({ error: 'Failed to update page text' }, { status: 500 });
  }
}

// DELETE: Supprimer un texte
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    await prisma.pageText.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting page text:', error);
    return NextResponse.json({ error: 'Failed to delete page text' }, { status: 500 });
  }
}
