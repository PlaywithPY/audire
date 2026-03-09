import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const hours = await prisma.openingHours.findMany({
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json(hours);
  } catch (error) {
    console.error('Error fetching hours:', error);
    return NextResponse.json({ error: 'Failed to fetch hours' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { dayOfWeek, isOpen, morningOpen, morningClose, afternoonOpen, afternoonClose } = body;

    const hours = await prisma.openingHours.upsert({
      where: { dayOfWeek },
      update: {
        isOpen,
        morningOpen: isOpen ? morningOpen : null,
        morningClose: isOpen ? morningClose : null,
        afternoonOpen: isOpen ? afternoonOpen : null,
        afternoonClose: isOpen ? afternoonClose : null,
      },
      create: {
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
