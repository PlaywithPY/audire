import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/admin/time-slots
 * Récupère tous les créneaux horaires (optionnellement filtrés par date et centre)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const centreId = searchParams.get('centreId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};

    if (centreId) {
      where.centreId = parseInt(centreId);
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.date = {
        gte: new Date(startDate),
      };
    }

    const timeSlots = await prisma.timeSlot.findMany({
      where,
      include: {
        centre: true,
        appointments: true,
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return NextResponse.json(timeSlots);
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time slots' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/time-slots
 * Crée un ou plusieurs créneaux horaires
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { centreId, date, startTime, endTime, multiple } = body;

    // Validation du centreId
    if (!centreId) {
      return NextResponse.json(
        { error: 'Missing centreId' },
        { status: 400 }
      );
    }

    // Vérifier que le centre existe
    const centre = await prisma.centre.findUnique({
      where: { id: centreId },
    });

    if (!centre) {
      return NextResponse.json(
        { error: 'Centre not found' },
        { status: 404 }
      );
    }

    // Si c'est une création multiple, on crée plusieurs créneaux
    if (multiple && Array.isArray(body.slots)) {
      if (body.slots.length === 0) {
        return NextResponse.json(
          { error: 'No slots provided' },
          { status: 400 }
        );
      }

      const timeSlots = await prisma.timeSlot.createMany({
        data: body.slots.map((slot: any) => ({
          centreId,
          date: new Date(slot.date),
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
        skipDuplicates: true,
      });

      return NextResponse.json(timeSlots, { status: 201 });
    }

    // Validation pour création d'un seul créneau
    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: date, startTime, endTime' },
        { status: 400 }
      );
    }

    // Création d'un seul créneau
    const timeSlot = await prisma.timeSlot.create({
      data: {
        centreId,
        date: new Date(date),
        startTime,
        endTime,
      },
      include: {
        centre: true,
      },
    });

    return NextResponse.json(timeSlot, { status: 201 });
  } catch (error) {
    console.error('Error creating time slot:', error);
    return NextResponse.json(
      { error: 'Failed to create time slot' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/time-slots
 * Met à jour un créneau horaire
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, date, startTime, endTime } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing time slot ID' },
        { status: 400 }
      );
    }

    // Vérifier que le créneau n'est pas déjà réservé
    const existingSlot = await prisma.timeSlot.findUnique({
      where: { id },
      include: { appointments: true },
    });

    if (!existingSlot) {
      return NextResponse.json(
        { error: 'Time slot not found' },
        { status: 404 }
      );
    }

    if (existingSlot.isBooked || existingSlot.appointments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot modify a booked time slot' },
        { status: 400 }
      );
    }

    const timeSlot = await prisma.timeSlot.update({
      where: { id },
      data: {
        ...(date && { date: new Date(date) }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
      },
      include: {
        centre: true,
      },
    });

    return NextResponse.json(timeSlot);
  } catch (error) {
    console.error('Error updating time slot:', error);
    return NextResponse.json(
      { error: 'Failed to update time slot' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/time-slots
 * Supprime un créneau horaire
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing time slot ID' },
        { status: 400 }
      );
    }

    // Vérifier que le créneau n'est pas réservé
    const existingSlot = await prisma.timeSlot.findUnique({
      where: { id: parseInt(id) },
      include: { appointments: true },
    });

    if (!existingSlot) {
      return NextResponse.json(
        { error: 'Time slot not found' },
        { status: 404 }
      );
    }

    if (existingSlot.isBooked || existingSlot.appointments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete a booked time slot' },
        { status: 400 }
      );
    }

    await prisma.timeSlot.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Time slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting time slot:', error);
    return NextResponse.json(
      { error: 'Failed to delete time slot' },
      { status: 500 }
    );
  }
}
