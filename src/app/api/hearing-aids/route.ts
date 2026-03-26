import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/hearing-aids - Liste tous les appareils auditifs
export async function GET() {
  try {
    const hearingAids = await prisma.hearingAid.findMany({
      where: {
        isVisible: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(hearingAids);
  } catch (error) {
    console.error('Error fetching hearing aids:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hearing aids' },
      { status: 500 }
    );
  }
}
