import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// GET - Récupérer tous les avis
export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

// POST - Créer un nouvel avis
export async function POST(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { name, text, rating, location, isVisible, isFeatured } = body;

    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        text,
        rating: rating || 5,
        location,
        isVisible: isVisible !== undefined ? isVisible : true,
        isFeatured: isFeatured || false,
      },
    });

    // Invalider le cache des pages qui affichent les avis
    revalidatePath('/');

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}

// PUT - Mettre à jour un avis
export async function PUT(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { id, name, text, rating, location, isVisible, isFeatured, showAsGoogle } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        name,
        text,
        rating,
        location,
        isVisible,
        isFeatured,
        showAsGoogle,
      },
    });

    // Invalider le cache
    revalidatePath('/');

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}

// DELETE - Supprimer un avis
export async function DELETE(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await prisma.testimonial.delete({
      where: { id: parseInt(id) },
    });

    // Invalider le cache
    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}
