import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Récupérer tous les pageKeys uniques
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const imageEffects = await prisma.imageEffect.findMany({
      select: {
        pageKey: true,
      },
    });

    // Extraire les pageKeys uniques
    const uniquePageKeys = [...new Set(imageEffects.map(effect => effect.pageKey))];

    console.log('📋 All unique pageKeys in database:', uniquePageKeys);

    return NextResponse.json({ pageKeys: uniquePageKeys });
  } catch (error) {
    console.error('Error fetching all page keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page keys' },
      { status: 500 }
    );
  }
}
