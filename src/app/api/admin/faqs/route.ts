import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Récupérer toutes les FAQs (incluant les masquées)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: any = {};
    if (category) {
      where.category = category;
    }

    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ],
      include: {
        faqCategory: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
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

// POST: Créer une nouvelle FAQ
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { question, answer, order, isVisible, category, categoryId } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    const faq = await prisma.fAQ.create({
      data: {
        question,
        answer,
        order: order || 0,
        isVisible: isVisible !== undefined ? isVisible : true,
        category: category || null,
        categoryId: categoryId || null,
      },
      include: {
        faqCategory: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json(faq);
  } catch (error: any) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json({
      error: 'Failed to create FAQ',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

// PUT: Mettre à jour une FAQ existante
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, question, answer, order, isVisible, category, categoryId } = body;

    if (!id) {
      return NextResponse.json({ error: 'FAQ ID is required' }, { status: 400 });
    }

    const faq = await prisma.fAQ.update({
      where: { id },
      data: {
        question,
        answer,
        order,
        isVisible,
        category: category || null,
        categoryId: categoryId || null,
      },
      include: {
        faqCategory: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json(faq);
  } catch (error: any) {
    console.error('Error updating FAQ:', error);

    if (error?.code === 'P2025') {
      return NextResponse.json({
        error: 'FAQ not found',
        details: 'The FAQ with this ID does not exist.'
      }, { status: 404 });
    }

    return NextResponse.json({
      error: 'Failed to update FAQ',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE: Supprimer une FAQ
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    await prisma.fAQ.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting FAQ:', error);

    if (error?.code === 'P2025') {
      return NextResponse.json({
        error: 'FAQ not found',
        details: 'The FAQ with this ID does not exist.'
      }, { status: 404 });
    }

    return NextResponse.json({
      error: 'Failed to delete FAQ',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
