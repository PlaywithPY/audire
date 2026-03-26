import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// Récupérer les horaires d'un centre spécifique (utilisé par l'admin)
export async function GET(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const centreIdParam = searchParams.get('centreId');

    let centreId: number;

    if (centreIdParam) {
      // Si un centreId est fourni, l'utiliser
      centreId = parseInt(centreIdParam, 10);
    } else {
      // Sinon, utiliser le centre par défaut
      const defaultCentre = await prisma.centre.findFirst({
        where: { isDefault: true },
      });

      if (!defaultCentre) {
        return NextResponse.json({ error: 'No default centre found' }, { status: 404 });
      }

      centreId = defaultCentre.id;
    }

    const hours = await prisma.openingHours.findMany({
      where: { centreId },
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json(hours);
  } catch (error) {
    console.error('Error fetching hours:', error);
    return NextResponse.json({ error: 'Failed to fetch hours' }, { status: 500 });
  }
}

// Mettre à jour les horaires d'un centre spécifique (utilisé par l'admin)
export async function PUT(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { centreId, dayOfWeek, isOpen, morningOpen, morningClose, afternoonOpen, afternoonClose } = body;

    let targetCentreId: number;

    if (centreId) {
      // Si un centreId est fourni, l'utiliser
      targetCentreId = centreId;
    } else {
      // Sinon, utiliser le centre par défaut (rétrocompatibilité)
      const defaultCentre = await prisma.centre.findFirst({
        where: { isDefault: true },
      });

      if (!defaultCentre) {
        return NextResponse.json({ error: 'No default centre found' }, { status: 404 });
      }

      targetCentreId = defaultCentre.id;
    }

    const hours = await prisma.openingHours.upsert({
      where: {
        centreId_dayOfWeek: {
          centreId: targetCentreId,
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
        centreId: targetCentreId,
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
