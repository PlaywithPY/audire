import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAppointmentReminder } from '@/lib/sms-helpers';

/**
 * GET /api/auto-send-reminders
 * Cette API est appelée automatiquement pour envoyer les rappels SMS en attente
 * Elle peut être appelée depuis n'importe quelle page sans authentification
 */
export async function GET(req: NextRequest) {
  try {
    const now = new Date();

    // Récupérer les rendez-vous confirmés avec rappel non envoyé et date de rappel passée
    const pendingReminders = await prisma.appointment.findMany({
      where: {
        status: 'confirmed',
        reminderSent: false,
        reminderDate: {
          lte: now,
        },
        smsConsent: true,
      },
      include: {
        centre: true,
        timeSlot: true,
      },
      take: 10, // Limiter à 10 rappels par appel pour éviter les timeouts
    });

    if (pendingReminders.length === 0) {
      return NextResponse.json({
        message: 'No reminders to send',
        count: 0,
      });
    }

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Envoyer les rappels
    for (const appointment of pendingReminders) {
      try {
        const result = await sendAppointmentReminder(appointment.id);
        if (result.success) {
          results.sent++;
        } else {
          results.failed++;
          results.errors.push(
            `Appointment ${appointment.id}: ${result.error || 'Unknown error'}`
          );
        }
      } catch (error) {
        results.failed++;
        results.errors.push(
          `Appointment ${appointment.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return NextResponse.json({
      message: 'Reminders processed',
      total: pendingReminders.length,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors,
    });
  } catch (error) {
    console.error('Error in auto-send reminders:', error);
    return NextResponse.json(
      { error: 'Failed to process reminders' },
      { status: 500 }
    );
  }
}
