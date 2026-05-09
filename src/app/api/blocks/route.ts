import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

/**
 * API blocs dynamiques.
 * GET    /api/blocks?pageKey=home              public — liste des blocs visibles
 * GET    /api/blocks?id=123                    public — un bloc précis (édition admin)
 * POST   /api/blocks                           admin — créer un bloc {pageKey, blockType, content?, afterOrder?}
 * PATCH  /api/blocks                           admin — réordonner [{id, order}, …] OU patcher un bloc {id, content?, isVisible?, metadata?}
 * DELETE /api/blocks?id=123                    admin — supprimer un bloc
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');
    const pageKey = searchParams.get('pageKey');

    // Fix Sprint 3 : on accepte ?id=… pour récupérer un bloc unique
    if (idParam) {
      const id = Number(idParam);
      if (!Number.isFinite(id)) {
        return NextResponse.json({ error: 'id invalide' }, { status: 400 });
      }
      const block = await prisma.contentBlock.findUnique({ where: { id } });
      if (!block) return NextResponse.json({ error: 'not found' }, { status: 404 });
      return NextResponse.json(block);
    }

    if (!pageKey) {
      return NextResponse.json({ error: 'pageKey or id is required' }, { status: 400 });
    }

    const blocks = await prisma.contentBlock.findMany({
      where: { pageKey, isVisible: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(blocks);
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return NextResponse.json({ error: 'Failed to fetch blocks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { pageKey, blockType, content = '', metadata = null, afterOrder } = body || {};
    if (!pageKey || !blockType) {
      return NextResponse.json({ error: 'pageKey & blockType requis' }, { status: 400 });
    }

    let newOrder: number;
    if (typeof afterOrder === 'number') {
      newOrder = afterOrder + 1;
      await prisma.contentBlock.updateMany({
        where: { pageKey, order: { gte: newOrder } },
        data: { order: { increment: 1 } },
      });
    } else {
      const last = await prisma.contentBlock.findFirst({
        where: { pageKey }, orderBy: { order: 'desc' },
      });
      newOrder = (last?.order ?? -1) + 1;
    }

    const blockKey = `${blockType}-${Date.now().toString(36)}`;
    const block = await prisma.contentBlock.create({
      data: {
        pageKey, blockKey, blockType, content,
        metadata: metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null,
        order: newOrder, isVisible: true,
      },
    });
    return NextResponse.json(block, { status: 201 });
  } catch (e) {
    console.error('Error creating block:', e);
    return NextResponse.json({ error: 'Failed to create block' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();

    if (Array.isArray(body?.reorder)) {
      await prisma.$transaction(
        body.reorder.map((r: { id: number; order: number }) =>
          prisma.contentBlock.update({ where: { id: r.id }, data: { order: r.order } })
        )
      );
      return NextResponse.json({ ok: true });
    }

    const { id, content, isVisible, metadata } = body || {};
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

    const data: any = {};
    if (typeof content === 'string') data.content = content;
    if (typeof isVisible === 'boolean') data.isVisible = isVisible;
    if (metadata !== undefined) {
      // Sprint 3 : DynamicBlockInspector envoie déjà metadata sous forme de string JSON.
      data.metadata = metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null;
    }

    const block = await prisma.contentBlock.update({ where: { id }, data });
    return NextResponse.json(block);
  } catch (e) {
    console.error('Error updating block:', e);
    return NextResponse.json({ error: 'Failed to update block' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const id = Number(request.nextUrl.searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
    await prisma.contentBlock.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Error deleting block:', e);
    return NextResponse.json({ error: 'Failed to delete block' }, { status: 500 });
  }
}
