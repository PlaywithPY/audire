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

// POST - Créer une nouvelle image de card (ou mettre à jour si existe déjà)
export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { pageKey, cardKey, imageUrl, fallbackEmoji, imagePosition, imageZoom, href, title, description, imageAlt } = body;

    if (!pageKey || !cardKey || !imageUrl) {
      return NextResponse.json(
        { error: 'pageKey, cardKey et imageUrl sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si la card existe déjà
    const existing = await prisma.cardImage.findFirst({
      where: {
        pageKey,
        cardKey,
      },
    });

    let cardImage;
    if (existing) {
      // Mettre à jour
      cardImage = await prisma.cardImage.update({
        where: { id: existing.id },
        data: {
          imageUrl,
          fallbackEmoji: fallbackEmoji || '📷',
          imagePosition: imagePosition || 'center center',
          imageZoom: typeof imageZoom === 'number' ? imageZoom : 1,
          href,
          title,
          description,
          imageAlt,
        },
      });
    } else {
      // Créer
      cardImage = await prisma.cardImage.create({
        data: {
          pageKey,
          cardKey,
          imageUrl,
          fallbackEmoji: fallbackEmoji || '📷',
          imagePosition: imagePosition || 'center center',
          imageZoom: typeof imageZoom === 'number' ? imageZoom : 1,
          href,
          title,
          description,
          imageAlt,
        },
      });
    }

    revalidatePath('/', 'layout');
    return NextResponse.json(cardImage);
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour de l\'image:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour une image de card
export async function PUT(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { id, pageKey, imageUrl, fallbackEmoji, imagePosition, imageZoom, href, title, description, imageAlt } = body;

    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 });
    }

    const cardImage = await prisma.cardImage.update({
      where: { id },
      data: {
        ...(pageKey !== undefined && { pageKey }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(fallbackEmoji !== undefined && { fallbackEmoji }),
        ...(imagePosition !== undefined && { imagePosition }),
        ...(typeof imageZoom === 'number' && { imageZoom }),
        ...(href !== undefined && { href }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(imageAlt !== undefined && { imageAlt }),
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
