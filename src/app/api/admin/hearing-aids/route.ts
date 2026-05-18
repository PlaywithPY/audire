import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// =====================================================
// /api/admin/hearing-aids — CRUD appareils auditifs (v2.1)
// =====================================================
// v2.1 : la PUT accepte désormais un tableau `contentBlocks` imbriqué.
// Stratégie : replace (suppression de tous les ProductContentBlock existants
// puis recréation depuis l'array). Atomique via transaction.

interface IncomingContentBlock {
  id?: number;
  order?: number;
  isVisible?: boolean;
  blockType?: string;
  afterBlockId?: string | null;
  metadata?: string | null;
  title?: string | null;
  description?: string | null;
  mediaUrl?: string | null;
  mediaType?: string;
  mediaAlt?: string | null;
  mediaPosition?: string;
  backgroundColor?: string | null;
}

// GET /api/admin/hearing-aids - Liste TOUS les appareils
export async function GET() {
  try {
    const hearingAids = await prisma.hearingAid.findMany({
      orderBy: [
        { isHighlight: 'desc' },
        { order: 'asc' },
        { name: 'asc' },
      ],
      include: {
        contentBlocks: { orderBy: { order: 'asc' } },
      },
    });
    return NextResponse.json(hearingAids);
  } catch (error) {
    console.error('Error fetching hearing aids:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hearing aids' },
      { status: 500 }
    );
  }
}

// POST /api/admin/hearing-aids - Créer un nouvel appareil
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { contentBlocks, ...rest } = data as Record<string, unknown> & { contentBlocks?: IncomingContentBlock[] };
    const slug = generateSlug(rest.name as string);

    const existing = await prisma.hearingAid.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: 'Un appareil avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    const created = await prisma.hearingAid.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { ...(rest as any), slug },
    });

    if (Array.isArray(contentBlocks) && contentBlocks.length > 0) {
      await prisma.productContentBlock.createMany({
        data: contentBlocks.map((b, idx) => normalizeContentBlock(b, created.id, idx)),
      });
    }

    const result = await prisma.hearingAid.findUnique({
      where: { id: created.id },
      include: { contentBlocks: { orderBy: { order: 'asc' } } },
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating hearing aid:', error);
    return NextResponse.json(
      { error: 'Failed to create hearing aid' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/hearing-aids - Mettre à jour
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, contentBlocks, ...updateData } = data as Record<string, unknown> & {
      id?: number;
      contentBlocks?: IncomingContentBlock[];
    };

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Nettoyer les champs non-éditables qui pourraient être renvoyés par le client
    delete (updateData as Record<string, unknown>).createdAt;
    delete (updateData as Record<string, unknown>).updatedAt;

    // Régénération du slug si le nom change (conserve la logique d'origine)
    if (typeof updateData.name === 'string' && updateData.name.trim().length > 0) {
      const newSlug = generateSlug(updateData.name);
      (updateData as Record<string, unknown>).slug = newSlug;
      const clash = await prisma.hearingAid.findFirst({
        where: { slug: newSlug, NOT: { id: id as number } },
      });
      if (clash) {
        return NextResponse.json(
          { error: 'Un appareil avec ce nom existe déjà' },
          { status: 400 }
        );
      }
    } else {
      delete (updateData as Record<string, unknown>).slug;
    }

    // Transaction : update HearingAid + replace contentBlocks
    const result = await prisma.$transaction(async (tx) => {
      await tx.hearingAid.update({
        where: { id: id as number },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: updateData as any,
      });

      if (Array.isArray(contentBlocks)) {
        // Replace strategy : suppression de tous puis recréation
        await tx.productContentBlock.deleteMany({ where: { hearingAidId: id as number } });
        if (contentBlocks.length > 0) {
          await tx.productContentBlock.createMany({
            data: contentBlocks.map((b, idx) => normalizeContentBlock(b, id as number, idx)),
          });
        }
      }

      return tx.hearingAid.findUnique({
        where: { id: id as number },
        include: { contentBlocks: { orderBy: { order: 'asc' } } },
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating hearing aid:', error);
    return NextResponse.json(
      { error: 'Failed to update hearing aid' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/hearing-aids?id=X
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    await prisma.hearingAid.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting hearing aid:', error);
    return NextResponse.json(
      { error: 'Failed to delete hearing aid' },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------
// Helpers
// ----------------------------------------------------

function normalizeContentBlock(b: IncomingContentBlock, hearingAidId: number, idx: number) {
  return {
    hearingAidId,
    order:           Number.isFinite(b.order as number) ? (b.order as number) : idx,
    isVisible:       b.isVisible !== false,
    blockType:       (b.blockType as string) || 'text-media',
    afterBlockId:    (b.afterBlockId as string | null) ?? null,
    metadata:        (b.metadata as string | null) ?? null,
    title:           (b.title as string | null) ?? null,
    description:     (b.description as string | null) ?? null,
    mediaUrl:        (b.mediaUrl as string | null) ?? null,
    mediaType:       (b.mediaType as string) || 'image',
    mediaAlt:        (b.mediaAlt as string | null) ?? null,
    mediaPosition:   (b.mediaPosition as string) || 'right',
    backgroundColor: (b.backgroundColor as string | null) ?? null,
  };
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
