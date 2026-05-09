import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

/**
 * API layout par bloc — stocke un JSON de classes de mise en page indexé par blockKey.
 * Stockage : table Settings, clé "layout.<blockKey>".
 *
 * GET  /api/admin/block-layout?key=home.hero-reassure-title
 * GET  /api/admin/block-layout?prefix=home.       (liste tous les layouts d'une page)
 * PUT  /api/admin/block-layout                    body: { key, layout: {…} | null }
 *
 * Forme attendue de "layout" :
 *   { maxWidth?: 'sm'|'md'|'lg'|'xl'|'2xl'|'3xl'|'4xl'|'5xl'|'6xl'|'7xl'|'full',
 *     align?: 'left'|'center'|'right',
 *     padding?: 'compact'|'normal'|'large',
 *     hideDesktop?: boolean, hideTablet?: boolean, hideMobile?: boolean }
 */

// Versions publiques (lues côté front pour appliquer le layout)
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const key = sp.get('key');
    const prefix = sp.get('prefix');

    if (key) {
      const row = await prisma.setting.findUnique({ where: { key: `layout.${key}` } });
      return NextResponse.json({ key, layout: row?.value ? JSON.parse(row.value) : null });
    }
    if (prefix) {
      const rows = await prisma.setting.findMany({
        where: { key: { startsWith: `layout.${prefix}` } },
      });
      const out: Record<string, any> = {};
      for (const r of rows) {
        try { out[r.key.replace(/^layout\./, '')] = JSON.parse(r.value); } catch {}
      }
      return NextResponse.json(out);
    }
    return NextResponse.json({ error: 'key ou prefix requis' }, { status: 400 });
  } catch (e) {
    console.error('block-layout GET:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { key, layout } = await request.json();
    if (!key) return NextResponse.json({ error: 'key requis' }, { status: 400 });

    const fullKey = `layout.${key}`;
    if (layout === null) {
      await prisma.setting.deleteMany({ where: { key: fullKey } });
      return NextResponse.json({ ok: true, cleared: true });
    }
    const value = JSON.stringify(layout);
    await prisma.setting.upsert({
      where: { key: fullKey },
      update: { value },
      create: { key: fullKey, value },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('block-layout PUT:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
