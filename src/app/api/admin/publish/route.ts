// src/app/api/admin/publish/route.ts
// Phase 4 — gère textes, FAQs, catégories : updates, créations, suppressions.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Payload = {
  pageTexts?: Record<string, string>;
  faqItems?: Record<string, { question?: string; answer?: string; categoryId?: number | null }>;
  categories?: Record<string, { name?: string; description?: string; imageUrl?: string }>;
  newFaqs?: Array<{ tempId: string; question: string; answer: string; categoryId?: number | null }>;
  newCategories?: Array<{ tempId: string; name: string; description?: string; imageUrl?: string }>;
  deletedFaqIds?: number[];
  deletedCategoryIds?: number[];
};

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'cat';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Payload;
    const results = {
      pageTexts: 0, faqItems: 0, categories: 0,
      newFaqs: 0, newCategories: 0, deletedFaqs: 0, deletedCategories: 0,
    };

    // 1. Suppressions (d'abord, pour libérer les contraintes)
    if (body.deletedFaqIds?.length) {
      const r = await prisma.fAQ.deleteMany({ where: { id: { in: body.deletedFaqIds } } });
      results.deletedFaqs = r.count;
    }
    if (body.deletedCategoryIds?.length) {
      const r = await prisma.fAQCategory.deleteMany({ where: { id: { in: body.deletedCategoryIds } } });
      results.deletedCategories = r.count;
    }

    // 2. Créations de catégories (avant les FAQs, qui peuvent référencer)
    const tempCatIdMap = new Map<string, number>();
    for (const cat of body.newCategories ?? []) {
      const created = await prisma.fAQCategory.create({
        data: {
          name: cat.name,
          slug: slugify(cat.name),
          description: cat.description ?? null,
          imageUrl: cat.imageUrl ?? null,
        },
      });
      tempCatIdMap.set(cat.tempId, created.id);
      results.newCategories++;
    }

    // 3. Créations de FAQs (peut référencer une catégorie nouvelle via tempId)
    for (const faq of body.newFaqs ?? []) {
      let categoryId: number | null = faq.categoryId ?? null;
      if (typeof categoryId === 'string' && (categoryId as string).startsWith('tmp-')) {
        categoryId = tempCatIdMap.get(categoryId as string) ?? null;
      }
      await prisma.fAQ.create({
        data: { question: faq.question, answer: faq.answer, categoryId },
      });
      results.newFaqs++;
    }

    // 4. Updates page texts
    for (const [blockKey, content] of Object.entries(body.pageTexts ?? {})) {
      const [pageKey, ...keyParts] = blockKey.split('.');
      const textKey = keyParts.join('.');
      if (!pageKey || !textKey) continue;
      await prisma.pageText.upsert({
        where:  { pageKey_textKey: { pageKey, textKey } },
        create: { pageKey, textKey, content },
        update: { content },
      });
      results.pageTexts++;
    }

    // 5. Updates FAQ existantes
    for (const [id, fields] of Object.entries(body.faqItems ?? {})) {
      const data: any = {};
      if (fields.question !== undefined) data.question = fields.question;
      if (fields.answer   !== undefined) data.answer   = fields.answer;
      if (fields.categoryId !== undefined) data.categoryId = fields.categoryId;
      if (Object.keys(data).length === 0) continue;
      await prisma.fAQ.update({ where: { id: Number(id) }, data });
      results.faqItems++;
    }

    // 6. Updates catégories existantes
    for (const [id, fields] of Object.entries(body.categories ?? {})) {
      const data: any = {};
      if (fields.name        !== undefined) { data.name = fields.name; data.slug = slugify(fields.name); }
      if (fields.description !== undefined) data.description = fields.description;
      if (fields.imageUrl    !== undefined) data.imageUrl = fields.imageUrl;
      if (Object.keys(data).length === 0) continue;
      await prisma.fAQCategory.update({ where: { id: Number(id) }, data });
      results.categories++;
    }

    return NextResponse.json({ ok: true, results });
  } catch (error: any) {
    console.error('Publish error:', error);
    return NextResponse.json(
      { error: 'Failed to publish', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
