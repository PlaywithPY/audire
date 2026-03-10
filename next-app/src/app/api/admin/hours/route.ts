import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// Récupérer les horaires du centre par défaut (utilisé par l'admin)
export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    // Trouver le centre par défaut
    const defaultCentre = await prisma.centre.findFirst({
      where: { isDefault: true },
    });

    if (!defaultCentre) {
      return NextResponse.json({ error: 'No default centre found' }, { status: 404 });
    }

    const hours = await prisma.openingHours.findMany({
      where: { centreId: defaultCentre.id },
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json(hours);
  } catch (error) {
    console.error('Error fetching hours:', error);
    return NextResponse.json({ error: 'Failed to fetch hours' }, { status: 500 });
  }
}

// Mettre à jour les horaires du centre par défaut (utilisé par l'admin)
export async function PUT(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { dayOfWeek, isOpen, morningOpen, morningClose, afternoonOpen, afternoonClose } = body;

    // Trouver le centre par défaut
    const defaultCentre = await prisma.centre.findFirst({
      where: { isDefault: true },
    });

    if (!defaultCentre) {
      return NextResponse.json({ error: 'No default centre found' }, { status: 404 });
    }

    const hours = await prisma.openingHours.upsert({
      where: {
        centreId_dayOfWeek: {
          centreId: defaultCentre.id,
          dayOfWeek,
        },
      },
      update: {
        isOpen,
        morningOpen: isOpen ? morningOpen : null,
        morningClose: isOpen ? morningClose : null,
        afternoonOpen: isOpen ? afternoonOpen : null,
        afternoonClose: isOpen ? afternoonClose : null,
      },
      create: {
        centreId: defaultCentre.id,
        dayOfWeek,
        isOpen,
        morningOpen: isOpen ? morningOpen : null,
        morningClose: isOpen ? morningClose : null,
        afternoonOpen: isOpen ? afternoonOpen : null,
        afternoonClose: isOpen ? afternoonClose : null,
      },
    });

    return NextResponse.json(hours);
  } catch (error) {
    console.error('Error updating hours:', error);
    return NextResponse.json({ error: 'Failed to update hours' }, { status: 500 });
  }
}
