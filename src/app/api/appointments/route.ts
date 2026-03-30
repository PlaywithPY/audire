import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { googleCalendar } from '@/lib/google-calendar';
import { emailService } from '@/lib/email';
import { sendAppointmentRequestConfirmation } from '@/lib/sms-helpers';

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

    const allSlots = await prisma.timeSlot.findMany({
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

    // Filtrer les créneaux à moins de 24h
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const availableSlots = allSlots.filter((slot) => {
      // Créer un datetime complet en combinant date et heure de début
      const slotDate = new Date(slot.date);
      const [hours, minutes] = slot.startTime.split(':').map(Number);
      slotDate.setHours(hours, minutes, 0, 0);

      // Le créneau doit être à plus de 24h dans le futur
      return slotDate >= in24Hours;
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
      emailConsent,
      smsConsent,
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

    // Vérifier qu'au moins un consentement est donné (email ou SMS)
    if (!emailConsent && !smsConsent) {
      return NextResponse.json(
        { error: 'At least one consent (email or SMS) is required' },
        { status: 400 }
      );
    }

    // Si consentement email donné, l'email doit être renseigné
    if (emailConsent && !email) {
      return NextResponse.json(
        { error: 'Email is required when email consent is given' },
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

    // Calculer la date de rappel (par défaut 1 jour avant)
    const timeSlotDate = new Date(timeSlot.date);
    const [hours, minutes] = timeSlot.startTime.split(':').map(Number);
    timeSlotDate.setHours(hours, minutes, 0, 0);

    const reminderDate = new Date(timeSlotDate);
    reminderDate.setDate(reminderDate.getDate() - 1); // 1 jour avant par défaut

    // Créer le rendez-vous dans la base de données (sans ajouter au calendrier Google pour l'instant)
    // L'événement Google Calendar sera créé uniquement lors de la confirmation par l'admin
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
        emailConsent: emailConsent || false,
        smsConsent: smsConsent || false,
        appointmentType,
        message: message || null,
        hasPrescription: false,
        googleCalendarEventId: null, // Sera ajouté lors de la confirmation
        reminderDaysBefore: 1, // Par défaut 1 jour avant
        reminderDate: reminderDate,
        reminderSent: false,
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

    // Envoyer un email au client pour lui dire que son RDV est en attente de confirmation
    // uniquement si le consentement a été donné
    if (email && emailConsent) {
      const appointmentDate = new Date(timeSlot.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const appointmentTime = `${timeSlot.startTime} - ${timeSlot.endTime}`;

      await emailService.sendClientPendingConfirmation({
        email,
        civilite: civilite || null,
        firstName,
        lastName,
        appointmentDate,
        appointmentTime,
        centreName: appointment.centre.name,
        appointmentType,
      });
    }

    // Envoyer immédiatement un email de notification au centre pour la nouvelle demande
    await emailService.sendAppointmentRequestEmail({
      civilite: appointment.civilite,
      firstName: appointment.firstName,
      lastName: appointment.lastName,
      phone: appointment.phone,
      email: appointment.email,
      message: appointment.message,
      appointmentType: appointment.appointmentType,
      centreName: appointment.centre.name,
    });

    // Envoyer le SMS de confirmation de demande si le consentement a été donné
    if (smsConsent) {
      try {
        await sendAppointmentRequestConfirmation(appointment.id);
      } catch (error) {
        console.error('Error sending SMS confirmation:', error);
        // Ne pas bloquer la création du rendez-vous si l'envoi du SMS échoue
      }
    }

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
