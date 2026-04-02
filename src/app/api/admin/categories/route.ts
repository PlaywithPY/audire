import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer toutes les catégories
export async function GET() {
  try {
    const categories = await prisma.fAQCategory.findMany({
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ],
      include: {
        faqs: {
          where: { isVisible: true },
          select: { id: true }
        }
      }
    });

    // Ajouter le nombre de FAQs par catégorie
    const categoriesWithCount = categories.map(cat => ({
      ...cat,
      faqCount: cat.faqs.length,
      faqs: undefined
    }));

    return NextResponse.json(categoriesWithCount);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST - Créer une nouvelle catégorie
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, slug, imageUrl, description, order, isVisible } = data;

    // Validation
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const category = await prisma.fAQCategory.create({
      data: {
        name,
        slug,
        imageUrl: imageUrl || null,
        description: description || null,
        order: order ?? 0,
        isVisible: isVisible ?? true
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);

    // Gérer les erreurs d'unicité
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A category with this name or slug already exists' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

// PUT - Mettre à jour une catégorie
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, name, slug, imageUrl, description, order, isVisible } = data;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const category = await prisma.fAQCategory.update({
      where: { id },
      data: {
        name,
        slug,
        imageUrl: imageUrl || null,
        description: description || null,
        order: order ?? 0,
        isVisible: isVisible ?? true
      }
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error('Error updating category:', error);

    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A category with this name or slug already exists' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE - Supprimer une catégorie
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    await prisma.fAQCategory.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
