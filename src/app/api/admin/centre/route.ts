import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// GET - Récupérer le centre par défaut
export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const centre = await prisma.centre.findFirst({
      where: { isDefault: true },
    });

    if (!centre) {
      return NextResponse.json({ error: 'No default centre found' }, { status: 404 });
    }

    return NextResponse.json(centre);
  } catch (error) {
    console.error('Error fetching centre:', error);
    return NextResponse.json({ error: 'Failed to fetch centre' }, { status: 500 });
  }
}

// PUT - Mettre à jour le centre par défaut
export async function PUT(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { phoneFixe, phoneMobile, email, address, postalCode, city } = body;

    // Trouver le centre par défaut
    const defaultCentre = await prisma.centre.findFirst({
      where: { isDefault: true },
    });

    if (!defaultCentre) {
      return NextResponse.json({ error: 'No default centre found' }, { status: 404 });
    }

    // Mettre à jour le centre
    const updatedCentre = await prisma.centre.update({
      where: { id: defaultCentre.id },
      data: {
        phoneFixe,
        phoneMobile,
        email,
        address,
        postalCode,
        city,
      },
    });

    return NextResponse.json(updatedCentre);
  } catch (error) {
    console.error('Error updating centre:', error);
    return NextResponse.json({ error: 'Failed to update centre' }, { status: 500 });
  }
}
