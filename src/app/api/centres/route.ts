import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Récupérer tous les centres actifs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    // Si un slug est fourni, retourner un seul centre avec ses horaires
    if (slug) {
      const centre = await prisma.centre.findUnique({
        where: { slug, isActive: true },
        include: {
          openingHours: {
            orderBy: { dayOfWeek: 'asc' },
          },
        },
      });

      if (!centre) {
        return NextResponse.json({ error: 'Centre non trouvé' }, { status: 404 });
      }

      return NextResponse.json(centre);
    }

    // Sinon, retourner tous les centres actifs
    const centres = await prisma.centre.findMany({
      where: { isActive: true },
      include: {
        openingHours: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
      orderBy: [
        { isDefault: 'desc' }, // Le centre par défaut en premier
        { name: 'asc' },
      ],
    });

    return NextResponse.json(centres);
  } catch (error) {
    console.error('Erreur lors de la récupération des centres:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// GET - Récupérer le centre par défaut
export async function getDefaultCentre() {
  try {
    const centre = await prisma.centre.findFirst({
      where: { isDefault: true, isActive: true },
      include: {
        openingHours: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    return centre;
  } catch (error) {
    console.error('Erreur lors de la récupération du centre par défaut:', error);
    return null;
  }
}
