// src/app/api/admin/publish/route.ts
// Endpoint qui reçoit toutes les modifications en attente et les écrit en base.
// Appelé par le bouton "Publier" depuis /admin/editor.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Payload = {
  pageTexts?: Record<string, string>;            // "faq.hero-title" → "..."
  faqItems?: Record<string, { question?: string; answer?: string }>;
  categories?: Record<string, { name?: string; description?: string; imageUrl?: string }>;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Payload;
    const results = { pageTexts: 0, faqItems: 0, categories: 0 };

    // 1. Page texts
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

    // 2. FAQ items
    for (const [id, fields] of Object.entries(body.faqItems ?? {})) {
      const data: { question?: string; answer?: string } = {};
      if (fields.question !== undefined) data.question = fields.question;
      if (fields.answer   !== undefined) data.answer   = fields.answer;
      if (Object.keys(data).length === 0) continue;
      await prisma.fAQ.update({ where: { id: Number(id) }, data });
      results.faqItems++;
    }

    // 3. Categories
    for (const [id, fields] of Object.entries(body.categories ?? {})) {
      const data: { name?: string; description?: string; imageUrl?: string } = {};
      if (fields.name        !== undefined) data.name        = fields.name;
      if (fields.description !== undefined) data.description = fields.description;
      if (fields.imageUrl    !== undefined) data.imageUrl    = fields.imageUrl;
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
