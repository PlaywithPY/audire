// =====================================================
// /api/admin/accessories — Bibliothèque partagée d'accessoires
// =====================================================
// Stocke la liste d'accessoires dans un Setting (key = "accessories.shared")
// au format JSON. Chaque appareil référence des IDs via HearingAid.accessoryIds.
//
// GET  → renvoie le tableau d'accessoires (ou [] si pas encore initialisé)
// PUT  → remplace toute la liste (body = Accessory[])

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const SETTING_KEY = 'accessories.shared';

interface IncomingAccessory {
  id?: number;
  name?: string;
  imageUrl?: string | null;
  href?: string | null;
  description?: string | null;
}

// ----------------------------------------------------
// GET
// ----------------------------------------------------
export async function GET() {
  try {
    const row = await prisma.setting.findUnique({ where: { key: SETTING_KEY } });
    if (!row) return NextResponse.json([]);
    try {
      const arr = JSON.parse(row.value);
      return NextResponse.json(Array.isArray(arr) ? arr : []);
    } catch {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error fetching accessories:', error);
    return NextResponse.json({ error: 'Failed to fetch accessories' }, { status: 500 });
  }
}

// ----------------------------------------------------
// PUT — replace entire list
// ----------------------------------------------------
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Body must be an array of accessories' }, { status: 400 });
    }

    // Sanitize + assign stable IDs
    const incoming = body as IncomingAccessory[];
    const existingIds = new Set<number>();
    const normalized = incoming
      .filter((a) => a && typeof a.name === 'string' && a.name.trim().length > 0)
      .map((a, idx) => {
        let id = typeof a.id === 'number' && a.id > 0 ? a.id : 0;
        // Generate stable IDs that don't clash
        if (!id || existingIds.has(id)) {
          id = (existingIds.size > 0 ? Math.max(...existingIds) : 0) + idx + 1;
          while (existingIds.has(id)) id++;
        }
        existingIds.add(id);
        return {
          id,
          name: a.name!.trim(),
          imageUrl: typeof a.imageUrl === 'string' && a.imageUrl ? a.imageUrl : undefined,
          href: typeof a.href === 'string' && a.href ? a.href : undefined,
          description: typeof a.description === 'string' && a.description ? a.description : undefined,
        };
      });

    const value = JSON.stringify(normalized);
    await prisma.setting.upsert({
      where: { key: SETTING_KEY },
      update: { value },
      create: { key: SETTING_KEY, value },
    });
    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Error saving accessories:', error);
    return NextResponse.json({ error: 'Failed to save accessories' }, { status: 500 });
  }
}
