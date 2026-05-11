import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';

// Sprint 5.5 — extension : PATCH (édition inline) + POST (création depuis InsertZone) + DELETE.
// GET reste public (lecture côté frontend).

export async function GET(request: NextRequest) {
  try {
    const pageKey = request.nextUrl.searchParams.get('pageKey');
    if (!pageKey) return NextResponse.json({ error: 'pageKey required' }, { status: 400 });
    const items = await prisma.imageEffect.findMany({
      where: { pageKey, isVisible: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(items);
  } catch (e) {
    console.error('GET image-effects', e);
    return NextResponse.json({ error: 'Failed to fetch image effects' }, { status: 500 });
  }
}

// PATCH /api/image-effects  body: { id, ...partial }
export async function PATCH(request: NextRequest) {
  const guard = await requireAdmin(); if (guard) return guard;
  try {
    const body = await request.json();
    const { id, ...patch } = body || {};
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const updated = await prisma.imageEffect.update({
      where: { id: Number(id) },
      data: patch,
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error('PATCH image-effects', e);
    return NextResponse.json({ error: 'Failed to patch' }, { status: 500 });
  }
}

// POST /api/image-effects  body: { pageKey, sectionKey, imageUrl?, effectType?, ... }
export async function POST(request: NextRequest) {
  const guard = await requireAdmin(); if (guard) return guard;
  try {
    const body = await request.json();
    const { pageKey, sectionKey } = body || {};
    if (!pageKey || !sectionKey) return NextResponse.json({ error: 'pageKey + sectionKey required' }, { status: 400 });

    // ordre = max existant + 1
    const last = await prisma.imageEffect.findFirst({ where: { pageKey }, orderBy: { order: 'desc' } });
    const created = await prisma.imageEffect.create({
      data: {
        pageKey,
        sectionKey,
        imageUrl: body.imageUrl ?? '',
        effectType: body.effectType ?? 'parallax',
        effectSpeed: body.effectSpeed ?? 0.5,
        effectScale: body.effectScale ?? 1.2,
        order: (last?.order ?? 0) + 1,
        isVisible: body.isVisible ?? true,
        alt: body.alt ?? null,
        overlayColor: body.overlayColor ?? null,
        minHeight: body.minHeight ?? '600px',
      },
    });
    return NextResponse.json(created);
  } catch (e) {
    console.error('POST image-effects', e);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

// DELETE /api/image-effects?id=12
export async function DELETE(request: NextRequest) {
  const guard = await requireAdmin(); if (guard) return guard;
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await prisma.imageEffect.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE image-effects', e);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
