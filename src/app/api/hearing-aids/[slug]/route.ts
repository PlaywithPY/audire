import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/hearing-aids/:slug - Récupère un appareil auditif par son slug
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const hearingAid = await prisma.hearingAid.findUnique({
      where: {
        slug,
        isVisible: true,
      },
    });

    if (!hearingAid) {
      return NextResponse.json(
        { error: 'Hearing aid not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(hearingAid);
  } catch (error) {
    console.error('Error fetching hearing aid:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hearing aid' },
      { status: 500 }
    );
  }
}
