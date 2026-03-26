import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/hearing-aids/featured - Liste les appareils auditifs mis en avant
export async function GET() {
  try {
    const featuredAids = await prisma.hearingAid.findMany({
      where: {
        isVisible: true,
        isHighlight: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(featuredAids);
  } catch (error) {
    console.error('Error fetching featured hearing aids:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured hearing aids' },
      { status: 500 }
    );
  }
}
