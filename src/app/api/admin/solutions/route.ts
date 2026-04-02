import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/admin/solutions - Récupérer toutes les solutions
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const solutions = await prisma.solution.findMany({
      orderBy: { solutionKey: 'asc' }
    });

    // Parser les JSON strings pour pros, cons, deviceLinks et accessoryLinks
    const parsedSolutions = solutions.map(s => ({
      ...s,
      pros: JSON.parse(s.pros),
      cons: JSON.parse(s.cons),
      deviceLinks: s.deviceLinks ? JSON.parse(s.deviceLinks) : [],
      accessoryLinks: s.accessoryLinks ? JSON.parse(s.accessoryLinks) : [],
    }));

    return NextResponse.json(parsedSolutions);
  } catch (error) {
    console.error('Error fetching solutions:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/admin/solutions - Créer une nouvelle solution
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { solutionKey, fullDesc, detailImage, detailEmoji, backgroundColor, pros, cons, deviceLinks, showDeviceLinks, accessoryLinks, showAccessoryLinks } = body;

    const solution = await prisma.solution.create({
      data: {
        solutionKey,
        fullDesc,
        detailImage: detailImage || null,
        detailEmoji: detailEmoji || '🎧',
        backgroundColor: backgroundColor || null,
        pros: JSON.stringify(pros || []),
        cons: JSON.stringify(cons || []),
        deviceLinks: JSON.stringify(deviceLinks || []),
        showDeviceLinks: showDeviceLinks !== undefined ? showDeviceLinks : true,
        accessoryLinks: JSON.stringify(accessoryLinks || []),
        showAccessoryLinks: showAccessoryLinks !== undefined ? showAccessoryLinks : true,
      }
    });

    return NextResponse.json({
      ...solution,
      pros: JSON.parse(solution.pros),
      cons: JSON.parse(solution.cons),
      deviceLinks: JSON.parse(solution.deviceLinks || '[]'),
      accessoryLinks: JSON.parse(solution.accessoryLinks || '[]'),
    });
  } catch (error) {
    console.error('Error creating solution:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/admin/solutions - Mettre à jour une solution
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, fullDesc, detailImage, detailEmoji, backgroundColor, pros, cons, deviceLinks, showDeviceLinks, accessoryLinks, showAccessoryLinks } = body;

    const solution = await prisma.solution.update({
      where: { id },
      data: {
        fullDesc,
        detailImage: detailImage || null,
        detailEmoji: detailEmoji || '🎧',
        backgroundColor: backgroundColor || null,
        pros: JSON.stringify(pros || []),
        cons: JSON.stringify(cons || []),
        deviceLinks: JSON.stringify(deviceLinks || []),
        showDeviceLinks: showDeviceLinks !== undefined ? showDeviceLinks : true,
        accessoryLinks: JSON.stringify(accessoryLinks || []),
        showAccessoryLinks: showAccessoryLinks !== undefined ? showAccessoryLinks : true,
      }
    });

    return NextResponse.json({
      ...solution,
      pros: JSON.parse(solution.pros),
      cons: JSON.parse(solution.cons),
      deviceLinks: JSON.parse(solution.deviceLinks || '[]'),
      accessoryLinks: JSON.parse(solution.accessoryLinks || '[]'),
    });
  } catch (error) {
    console.error('Error updating solution:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
