import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { googleCalendar } from '@/lib/google-calendar';

const prisma = new PrismaClient();

/**
 * GET /api/appointments
 * Récupère les créneaux disponibles pour un centre et une période donnée
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const centreId = searchParams.get('centreId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!centreId) {
      return NextResponse.json(
        { error: 'Centre ID is required' },
        { status: 400 }
      );
    }

    const where: any = {
      centreId: parseInt(centreId),
      isBooked: false,
      date: {
        gte: startDate ? new Date(startDate) : new Date(),
      },
    };

    if (endDate) {
      where.date.lte = new Date(endDate);
    }

    const availableSlots = await prisma.timeSlot.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
      include: {
        centre: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            postalCode: true,
          },
        },
      },
    });

    return NextResponse.json(availableSlots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/appointments
 * Crée un nouveau rendez-vous
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      centreId,
      timeSlotId,
      civilite,
      firstName,
      lastName,
      address,
      phone,
      email,
      appointmentType,
      message,
    } = body;

    // Validation
    if (!centreId || !timeSlotId || !firstName || !lastName || !address || !phone || !appointmentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Vérifier que le type de RDV est valide
    const validTypes = ['premier-contact', 'premier-rdv', 'reglage'];
    if (!validTypes.includes(appointmentType)) {
      return NextResponse.json(
        { error: 'Invalid appointment type' },
        { status: 400 }
      );
    }

    // Vérifier que le créneau existe et est disponible
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
      include: { centre: true },
    });

    if (!timeSlot) {
      return NextResponse.json(
        { error: 'Time slot not found' },
        { status: 404 }
      );
    }

    if (timeSlot.isBooked) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 400 }
      );
    }

    // Créer l'événement dans Google Calendar
    let title = '';
    if (civilite === 'monsieur') {
      title = 'Monsieur';
    } else if (civilite === 'madame') {
      title = 'Madame';
    } else if (civilite === 'autre') {
      title = '';
    } else {
      title = 'M/Mme';
    }
    const patientName = title ? `${title} ${lastName}` : lastName;
    const startDateTime = new Date(`${timeSlot.date.toISOString().split('T')[0]}T${timeSlot.startTime}:00`);
    const endDateTime = new Date(`${timeSlot.date.toISOString().split('T')[0]}T${timeSlot.endTime}:00`);

    const googleCalendarEventId = await googleCalendar.createAppointmentEvent(
      patientName,
      appointmentType,
      startDateTime.toISOString(),
      endDateTime.toISOString()
    );

    // Créer le rendez-vous dans la base de données
    const appointment = await prisma.appointment.create({
      data: {
        centreId,
        timeSlotId,
        civilite: civilite || null,
        firstName,
        lastName,
        address,
        phone,
        email: email || null,
        appointmentType,
        message: message || null,
        hasPrescription: false,
        googleCalendarEventId: googleCalendarEventId || null,
      },
      include: {
        centre: true,
        timeSlot: true,
      },
    });

    // Marquer le créneau comme réservé
    await prisma.timeSlot.update({
      where: { id: timeSlotId },
      data: { isBooked: true },
    });

    return NextResponse.json(
      {
        message: 'Appointment created successfully',
        appointment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
