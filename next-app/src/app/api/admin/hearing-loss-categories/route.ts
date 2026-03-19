import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// GET - Récupérer toutes les catégories de perte auditive
export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const categories = await prisma.hearingLossCategory.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching hearing loss categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST - Créer une nouvelle catégorie
export async function POST(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { name, slug, minDb, maxDb, description, order } = body;

    const category = await prisma.hearingLossCategory.create({
      data: {
        name,
        slug,
        minDb: minDb ? parseInt(minDb) : null,
        maxDb: maxDb ? parseInt(maxDb) : null,
        description,
        order: order || 0,
      },
    });

    revalidatePath('/admin/products');

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

// PUT - Mettre à jour une catégorie
export async function PUT(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { id, name, slug, minDb, maxDb, description, order } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const category = await prisma.hearingLossCategory.update({
      where: { id: parseInt(id) },
      data: {
        name,
        slug,
        minDb: minDb ? parseInt(minDb) : null,
        maxDb: maxDb ? parseInt(maxDb) : null,
        description,
        order,
      },
    });

    revalidatePath('/admin/products');

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE - Supprimer une catégorie
export async function DELETE(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await prisma.hearingLossCategory.delete({
      where: { id: parseInt(id) },
    });

    revalidatePath('/admin/products');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
