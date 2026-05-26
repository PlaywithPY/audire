// =====================================================
// POST /api/admin/hearing-aids/duplicate?id=X
// =====================================================
// Sprint 5.10 — Duplique un appareil (HearingAid + ProductContentBlock).
// Le nouveau slug est dérivé du slug source : "{slug}-copie",
// "{slug}-copie-2", etc. jusqu'à trouver un libre.
//
// Stratégie : full clone (toutes les colonnes JSON + tous les contentBlocks),
// sauf id/slug/createdAt/updatedAt (regénérés) et isVisible (mis à false
// pour éviter qu'une copie partielle apparaisse en ligne).

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const id = Number(request.nextUrl.searchParams.get('id'));
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const source = await prisma.hearingAid.findUnique({
      where: { id },
      include: { contentBlocks: { orderBy: { order: 'asc' } } },
    });
    if (!source) {
      return NextResponse.json({ error: 'Appareil introuvable' }, { status: 404 });
    }

    // Trouver un slug libre
    const baseSlug = source.slug;
    const newSlug = await findFreeSlug(baseSlug);
    const newName = `${source.name} (copie)`;

    // On retire les champs qui ne doivent pas être copiés tels quels
    const {
      id: _id,
      slug: _slug,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      contentBlocks,
      ...copyable
    } = source;
    // (les variables préfixées _ sont volontairement ignorées)
    void _id; void _slug; void _createdAt; void _updatedAt;

    const duplicated = await prisma.$transaction(async (tx) => {
      const created = await tx.hearingAid.create({
        data: {
          ...copyable,
          slug: newSlug,
          name: newName,
          isVisible: false,   // brouillon par défaut
          isHighlight: false, // on ne réplique pas le "mis en avant"
          order: (copyable.order || 0) + 1,
        },
      });

      if (contentBlocks && contentBlocks.length > 0) {
        await tx.productContentBlock.createMany({
          data: contentBlocks.map((b) => ({
            hearingAidId: created.id,
            order:           b.order,
            isVisible:       b.isVisible,
            blockType:       b.blockType,
            afterBlockId:    b.afterBlockId,
            metadata:        b.metadata,
            title:           b.title,
            description:     b.description,
            mediaUrl:        b.mediaUrl,
            mediaType:       b.mediaType,
            mediaAlt:        b.mediaAlt,
            mediaPosition:   b.mediaPosition,
            backgroundColor: b.backgroundColor,
          })),
        });
      }

      return tx.hearingAid.findUnique({
        where: { id: created.id },
        include: { contentBlocks: { orderBy: { order: 'asc' } } },
      });
    });

    return NextResponse.json(duplicated);
  } catch (error) {
    console.error('Error duplicating hearing aid:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate hearing aid' },
      { status: 500 }
    );
  }
}

async function findFreeSlug(baseSlug: string): Promise<string> {
  // Essaie "{base}-copie", puis "{base}-copie-2", etc.
  const candidates: string[] = [`${baseSlug}-copie`];
  for (let i = 2; i < 100; i++) candidates.push(`${baseSlug}-copie-${i}`);

  const existing = await prisma.hearingAid.findMany({
    where: { slug: { in: candidates } },
    select: { slug: true },
  });
  const taken = new Set(existing.map((e) => e.slug));
  for (const c of candidates) if (!taken.has(c)) return c;
  // Fallback : timestamp
  return `${baseSlug}-copie-${Date.now()}`;
}
