import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer toutes les catégories visibles avec leurs FAQs
export async function GET() {
  try {
    const categories = await prisma.fAQCategory.findMany({
      where: { isVisible: true },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ],
      include: {
        faqs: {
          where: { isVisible: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            question: true,
            answer: true,
            order: true
          }
        }
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
