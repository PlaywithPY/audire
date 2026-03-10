import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth-helpers';

// GET - Récupérer toutes les images de cards
export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const cardImages = await prisma.cardImage.findMany({
      orderBy: { cardKey: 'asc' },
    });
    return NextResponse.json(cardImages);
  } catch (error) {
    console.error('Erreur lors de la récupération des images:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer une nouvelle image de card
export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { cardKey, imageUrl, fallbackEmoji } = body;

    if (!cardKey || !imageUrl) {
      return NextResponse.json(
        { error: 'cardKey et imageUrl sont requis' },
        { status: 400 }
      );
    }

    const cardImage = await prisma.cardImage.create({
      data: {
        cardKey,
        imageUrl,
        fallbackEmoji: fallbackEmoji || '📷',
      },
    });

    revalidatePath('/', 'layout');
    return NextResponse.json(cardImage);
  } catch (error) {
    console.error('Erreur lors de la création de l\'image:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour une image de card
export async function PUT(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { id, imageUrl, fallbackEmoji } = body;

    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 });
    }

    const cardImage = await prisma.cardImage.update({
      where: { id },
      data: {
        ...(imageUrl && { imageUrl }),
        ...(fallbackEmoji && { fallbackEmoji }),
      },
    });

    revalidatePath('/', 'layout');
    return NextResponse.json(cardImage);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'image:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer une image de card
export async function DELETE(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 });
    }

    await prisma.cardImage.delete({
      where: { id: parseInt(id) },
    });

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
