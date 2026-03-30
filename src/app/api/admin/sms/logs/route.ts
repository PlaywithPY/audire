import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET: Récupérer l'historique des SMS
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const logs = await prisma.sMSLog.findMany({
      orderBy: {
        sentAt: 'desc',
      },
      take: 100, // Limiter aux 100 derniers SMS
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching SMS logs:', error);
    return NextResponse.json({ error: 'Failed to fetch SMS logs' }, { status: 500 });
  }
}
