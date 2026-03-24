import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Récupérer toutes les FAQs visibles (route publique)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: any = { isVisible: true };
    if (category) {
      where.category = category;
    }

    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    return NextResponse.json(faqs);
  } catch (error: any) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json({
      error: 'Failed to fetch FAQs',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
