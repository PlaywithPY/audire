// GET  /api/admin/snapshots  — liste les 10 derniers snapshots
// POST /api/admin/snapshots  — crée un snapshot de l'état publié actuel

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const snapshots = await prisma.contentSnapshot.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, label: true, createdAt: true },
  });
  return NextResponse.json(snapshots);
}

export async function POST(req: NextRequest) {
  const { label } = await req.json();
  if (!label?.trim()) {
    return NextResponse.json({ error: 'Label requis' }, { status: 400 });
  }

  const [pageTexts, faqCategories, faqs] = await Promise.all([
    prisma.pageText.findMany({ select: { pageKey: true, textKey: true, content: true, label: true } }),
    prisma.fAQCategory.findMany({
      select: { id: true, name: true, slug: true, imageUrl: true, description: true, order: true, isVisible: true },
    }),
    prisma.fAQ.findMany({
      select: { id: true, question: true, answer: true, order: true, isVisible: true, categoryId: true, category: true },
    }),
  ]);

  const data = JSON.stringify({ pageTexts, faqCategories, faqs });

  const snapshot = await prisma.contentSnapshot.create({
    data: { label: label.trim(), data },
  });

  // Garder seulement les 10 derniers — supprimer les plus anciens
  const all = await prisma.contentSnapshot.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  });
  if (all.length > 10) {
    const toDelete = all.slice(10).map((s) => s.id);
    await prisma.contentSnapshot.deleteMany({ where: { id: { in: toDelete } } });
  }

  return NextResponse.json({ id: snapshot.id, label: snapshot.label, createdAt: snapshot.createdAt });
}
