import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    let colors = await prisma.themeColors.findFirst({
      where: { id: 1 },
    });

    if (!colors) {
      // Créer les couleurs par défaut si elles n'existent pas
      colors = await prisma.themeColors.create({
        data: {
          primary: '#42a4ff',
          primaryLight: '#5ab3ff',
          primaryDark: '#2d87e6',
          secondary: '#EBF5FF',
        },
      });
    }

    return NextResponse.json(colors);
  } catch (error) {
    console.error('Error fetching colors:', error);
    return NextResponse.json({ error: 'Failed to fetch colors' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { primary, primaryLight, primaryDark, secondary } = body;

    const colors = await prisma.themeColors.upsert({
      where: { id: 1 },
      update: {
        primary,
        primaryLight,
        primaryDark,
        secondary,
      },
      create: {
        primary,
        primaryLight,
        primaryDark,
        secondary,
      },
    });

    // Invalider le cache de toutes les pages pour appliquer les nouvelles couleurs
    revalidatePath('/', 'layout');

    return NextResponse.json(colors);
  } catch (error) {
    console.error('Error updating colors:', error);
    return NextResponse.json({ error: 'Failed to update colors' }, { status: 500 });
  }
}
