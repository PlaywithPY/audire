// POST /api/admin/snapshots/[id]/restore
// Réapplique le contenu du snapshot directement en base (upsert).

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type SnapshotData = {
  pageTexts: { pageKey: string; textKey: string; content: string; label?: string | null }[];
  faqCategories: {
    id: number; name: string; slug: string; imageUrl?: string | null;
    description?: string | null; order: number; isVisible: boolean;
  }[];
  faqs: {
    id: number; question: string; answer: string; order: number;
    isVisible: boolean; categoryId?: number | null; category?: string | null;
  }[];
};

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'ID invalide' }, { status: 400 });

  const snapshot = await prisma.contentSnapshot.findUnique({ where: { id } });
  if (!snapshot) return NextResponse.json({ error: 'Snapshot introuvable' }, { status: 404 });

  const { pageTexts, faqCategories, faqs }: SnapshotData = JSON.parse(snapshot.data);

  await prisma.$transaction(async (tx) => {
    // 1. PageTexts — upsert par (pageKey, textKey)
    for (const pt of pageTexts) {
      await tx.pageText.upsert({
        where: { pageKey_textKey: { pageKey: pt.pageKey, textKey: pt.textKey } },
        update: { content: pt.content },
        create: { pageKey: pt.pageKey, textKey: pt.textKey, content: pt.content, label: pt.label ?? null },
      });
    }

    // 2. FAQCategories — upsert par slug
    const catIdMap: Record<number, number> = {};
    for (const cat of faqCategories) {
      const upserted = await tx.fAQCategory.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, imageUrl: cat.imageUrl, description: cat.description, order: cat.order, isVisible: cat.isVisible },
        create: { name: cat.name, slug: cat.slug, imageUrl: cat.imageUrl, description: cat.description, order: cat.order, isVisible: cat.isVisible },
      });
      catIdMap[cat.id] = upserted.id;
    }

    // 3. FAQs — upsert par id si existe, sinon créer
    for (const faq of faqs) {
      const mappedCatId = faq.categoryId != null ? (catIdMap[faq.categoryId] ?? faq.categoryId) : null;
      const existing = await tx.fAQ.findUnique({ where: { id: faq.id } });
      if (existing) {
        await tx.fAQ.update({
          where: { id: faq.id },
          data: { question: faq.question, answer: faq.answer, order: faq.order, isVisible: faq.isVisible, categoryId: mappedCatId, category: faq.category ?? null },
        });
      } else {
        await tx.fAQ.create({
          data: { question: faq.question, answer: faq.answer, order: faq.order, isVisible: faq.isVisible, categoryId: mappedCatId, category: faq.category ?? null },
        });
      }
    }
  });

  return NextResponse.json({ ok: true });
}
