import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// GET - Récupérer tous les blocs d'une page
export async function GET(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get('pageKey');

    if (!pageKey) {
      const allBlocks = await prisma.contentBlock.findMany({
        orderBy: [{ pageKey: 'asc' }, { order: 'asc' }],
      });
      return NextResponse.json(allBlocks);
    }

    const blocks = await prisma.contentBlock.findMany({
      where: { pageKey },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(blocks);
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return NextResponse.json({ error: 'Failed to fetch blocks' }, { status: 500 });
  }
}

// POST - Créer un nouveau bloc
export async function POST(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { pageKey, blockKey, blockType, content, metadata, order, isVisible } = body;

    const block = await prisma.contentBlock.create({
      data: {
        pageKey,
        blockKey,
        blockType,
        content,
        metadata: metadata ? JSON.stringify(metadata) : null,
        order: order || 0,
        isVisible: isVisible !== undefined ? isVisible : true,
      },
    });

    // Invalider le cache de la page modifiée
    revalidatePath(`/${pageKey === 'home' ? '' : pageKey}`);

    return NextResponse.json(block);
  } catch (error) {
    console.error('Error creating block:', error);
    return NextResponse.json({ error: 'Failed to create block' }, { status: 500 });
  }
}

// PUT - Mettre à jour un bloc existant
export async function PUT(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { id, pageKey, blockKey, content, metadata, order, isVisible } = body;

    let block;
    if (id) {
      // Mise à jour par ID
      block = await prisma.contentBlock.update({
        where: { id },
        data: {
          content,
          metadata: metadata ? JSON.stringify(metadata) : undefined,
          order: order !== undefined ? order : undefined,
          isVisible: isVisible !== undefined ? isVisible : undefined,
        },
      });
    } else if (pageKey && blockKey) {
      // Mise à jour par pageKey + blockKey (upsert)
      block = await prisma.contentBlock.upsert({
        where: {
          pageKey_blockKey: { pageKey, blockKey },
        },
        update: {
          content,
          metadata: metadata ? JSON.stringify(metadata) : undefined,
          order: order !== undefined ? order : undefined,
          isVisible: isVisible !== undefined ? isVisible : undefined,
        },
        create: {
          pageKey,
          blockKey,
          blockType: body.blockType || 'text',
          content,
          metadata: metadata ? JSON.stringify(metadata) : null,
          order: order || 0,
          isVisible: isVisible !== undefined ? isVisible : true,
        },
      });
    } else {
      return NextResponse.json({ error: 'Missing id or pageKey+blockKey' }, { status: 400 });
    }

    // Invalider le cache de la page modifiée
    const pagePath = block.pageKey === 'home' ? '/' : `/${block.pageKey}`;
    revalidatePath(pagePath);

    return NextResponse.json(block);
  } catch (error) {
    console.error('Error updating block:', error);
    return NextResponse.json({ error: 'Failed to update block' }, { status: 500 });
  }
}

// DELETE - Supprimer un bloc (par id) ou tous les blocs d'une page (par pageKey)
export async function DELETE(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const pageKey = searchParams.get('pageKey');

    if (pageKey && !id) {
      // Suppression de tous les blocs d'une page custom
      await prisma.contentBlock.deleteMany({ where: { pageKey } });
      revalidatePath(`/${pageKey}`);
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing id or pageKey' }, { status: 400 });
    }

    const block = await prisma.contentBlock.delete({
      where: { id: parseInt(id) },
    });

    // Invalider le cache de la page modifiée
    const pagePath = block.pageKey === 'home' ? '/' : `/${block.pageKey}`;
    revalidatePath(pagePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting block:', error);
    return NextResponse.json({ error: 'Failed to delete block' }, { status: 500 });
  }
}
