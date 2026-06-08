// DELETE /api/admin/snapshots/[id]

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = parseInt(idParam);
  if (isNaN(id)) return NextResponse.json({ error: 'ID invalide' }, { status: 400 });

  await prisma.contentSnapshot.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
