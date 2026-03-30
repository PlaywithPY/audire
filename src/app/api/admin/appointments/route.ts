import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { emailService } from '@/lib/email';
import { googleCalendar } from '@/lib/google-calendar';
import { sendAppointmentConfirmation, sendAppointmentCancellation } from '@/lib/sms-helpers';

const prisma = new PrismaClient();

/**
 * GET /api/admin/appointments
 * Récupère tous les rendez-vous (admin uniquement)
 */
export async function GET(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const centreId = searchParams.get('centreId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};

    if (centreId) {
      where.centreId = parseInt(centreId);
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.timeSlot = {
        date: {},
      };
      if (startDate) {
        where.timeSlot.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.timeSlot.date.lte = new Date(endDate);
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        centre: true,
        timeSlot: true,
        prescriptions: true,
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/appointments
 * Met à jour un rendez-vous (statut, etc.)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Récupérer le rendez-vous avant la mise à jour pour comparer le statut
    const currentAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        centre: true,
        timeSlot: true,
      },
    });

    if (!currentAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: status || undefined,
      },
      include: {
        centre: true,
        timeSlot: true,
      },
    });

    // Si le statut passe à "confirmed", créer l'événement Google Calendar et envoyer l'email de confirmation
    if (status === 'confirmed' && currentAppointment.status !== 'confirmed' && appointment.timeSlot) {
      // Créer l'événement dans Google Calendar
      let title = '';
      if (appointment.civilite === 'monsieur') {
        title = 'Monsieur';
      } else if (appointment.civilite === 'madame') {
        title = 'Madame';
      } else if (appointment.civilite === 'autre') {
        title = '';
      } else {
        title = 'M/Mme';
      }
      const patientName = title ? `${title} ${appointment.lastName}` : appointment.lastName;
      const startDateTime = new Date(`${appointment.timeSlot.date.toISOString().split('T')[0]}T${appointment.timeSlot.startTime}:00`);
      const endDateTime = new Date(`${appointment.timeSlot.date.toISOString().split('T')[0]}T${appointment.timeSlot.endTime}:00`);

      const googleCalendarEventId = await googleCalendar.createAppointmentEvent(
        patientName,
        appointment.appointmentType,
        startDateTime.toISOString(),
        endDateTime.toISOString()
      );

      // Mettre à jour le RDV avec l'ID de l'événement Google Calendar
      if (googleCalendarEventId) {
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { googleCalendarEventId },
        });
      }

      // Email de confirmation finale au client (si email fourni ET consentement donné)
      if (appointment.email && appointment.emailConsent) {
        const appointmentDate = new Date(appointment.timeSlot.date).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const appointmentTime = `${appointment.timeSlot.startTime} - ${appointment.timeSlot.endTime}`;
        const centreAddress = `${appointment.centre.address}, ${appointment.centre.postalCode} ${appointment.centre.city}`;

        await emailService.sendClientFinalConfirmation({
          email: appointment.email,
          civilite: appointment.civilite,
          firstName: appointment.firstName,
          lastName: appointment.lastName,
          appointmentDate,
          appointmentTime,
          centreName: appointment.centre.name,
          centreAddress,
          centrePhone: appointment.centre.phoneFixe,
          appointmentType: appointment.appointmentType,
          startDateTime: startDateTime,
          endDateTime: endDateTime,
        });
      }

      // SMS de confirmation (si consentement donné)
      if (appointment.smsConsent) {
        try {
          await sendAppointmentConfirmation(appointment.id);
        } catch (error) {
          console.error('Error sending SMS confirmation:', error);
          // Ne pas bloquer la confirmation si l'envoi du SMS échoue
        }
      }
    }

    // Si annulé, libérer le créneau et supprimer l'événement Google Calendar
    if (status === 'cancelled' && currentAppointment.status !== 'cancelled' && appointment.timeSlotId) {
      await prisma.timeSlot.update({
        where: { id: appointment.timeSlotId },
        data: { isBooked: false },
      });

      // Supprimer l'événement du calendrier Google
      if (appointment.googleCalendarEventId) {
        await googleCalendar.deleteEvent(appointment.googleCalendarEventId);
      }

      // Envoyer un email d'annulation au client (si email fourni ET consentement donné)
      if (appointment.email && appointment.emailConsent && appointment.timeSlot) {
        const appointmentDate = new Date(appointment.timeSlot.date).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const appointmentTime = `${appointment.timeSlot.startTime} - ${appointment.timeSlot.endTime}`;

        await emailService.sendClientCancellationEmail({
          email: appointment.email,
          civilite: appointment.civilite,
          firstName: appointment.firstName,
          lastName: appointment.lastName,
          appointmentDate,
          appointmentTime,
          centreName: appointment.centre.name,
          centrePhone: appointment.centre.phoneFixe,
          appointmentType: appointment.appointmentType,
        });
      }

      // SMS d'annulation (si consentement donné)
      if (appointment.smsConsent) {
        try {
          await sendAppointmentCancellation(appointment.id);
        } catch (error) {
          console.error('Error sending SMS cancellation:', error);
          // Ne pas bloquer l'annulation si l'envoi du SMS échoue
        }
      }
    }

    return NextResponse.json({
      message: 'Appointment updated successfully',
      appointment,
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/appointments
 * Supprime un rendez-vous
 */
export async function DELETE(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Libérer le créneau
    if (appointment.timeSlotId) {
      await prisma.timeSlot.update({
        where: { id: appointment.timeSlotId },
        data: { isBooked: false },
      });
    }

    // Supprimer l'événement du calendrier Google
    if (appointment.googleCalendarEventId) {
      await googleCalendar.deleteEvent(appointment.googleCalendarEventId);
    }

    // Supprimer le rendez-vous
    await prisma.appointment.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      message: 'Appointment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}
