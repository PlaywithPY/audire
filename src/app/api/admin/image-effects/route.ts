import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Récupérer tous les effets d'image d'une page
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const pageKey = searchParams.get('pageKey');

    console.log('🔍 GET /api/admin/image-effects - pageKey:', pageKey);

    if (!pageKey) {
      return NextResponse.json({ error: 'pageKey required' }, { status: 400 });
    }

    const imageEffects = await prisma.imageEffect.findMany({
      where: { pageKey },
      orderBy: { order: 'asc' },
    });

    console.log(`✅ Found ${imageEffects.length} image effect(s) for pageKey="${pageKey}"`);
    console.log('📦 Image effects:', imageEffects);

    return NextResponse.json(imageEffects);
  } catch (error) {
    console.error('Error fetching image effects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image effects' },
      { status: 500 }
    );
  }
}

// POST: Créer un nouvel effet d'image
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      imageUrl,
      effectType,
      effectSpeed,
      effectScale,
      effectDirection,
      effectIntensity,
      imagePosition,
      pageKey,
      sectionKey,
      order,
      isVisible,
      alt,
      overlayColor,
      minHeight,
    } = body;

    // Vérifier que le sectionKey est unique pour cette page
    const existing = await prisma.imageEffect.findFirst({
      where: {
        pageKey,
        sectionKey,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Un effet existe déjà pour cette section' },
        { status: 400 }
      );
    }

    const imageEffect = await prisma.imageEffect.create({
      data: {
        imageUrl,
        effectType: effectType || 'none',
        effectSpeed: effectSpeed || 0.5,
        effectScale: effectScale || 1.2,
        effectDirection: effectDirection || 'down',
        effectIntensity: effectIntensity || 1.0,
        imagePosition: imagePosition || 'center center',
        pageKey,
        sectionKey,
        order: order || 0,
        isVisible: isVisible !== undefined ? isVisible : true,
        alt,
        overlayColor,
        minHeight: minHeight || '400px',
      },
    });

    return NextResponse.json(imageEffect);
  } catch (error) {
    console.error('Error creating image effect:', error);
    return NextResponse.json(
      { error: 'Failed to create image effect' },
      { status: 500 }
    );
  }
}

// PUT: Mettre à jour un effet d'image
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const imageEffect = await prisma.imageEffect.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(imageEffect);
  } catch (error) {
    console.error('Error updating image effect:', error);
    return NextResponse.json(
      { error: 'Failed to update image effect' },
      { status: 500 }
    );
  }
}

// DELETE: Supprimer un effet d'image
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    await prisma.imageEffect.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image effect:', error);
    return NextResponse.json(
      { error: 'Failed to delete image effect' },
      { status: 500 }
    );
  }
}
