import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendAppointmentReminder } from '@/lib/sms-helpers';

/**
 * GET /api/admin/sms-reminders
 * Récupère les rappels SMS en attente d'envoi
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
      orderBy: {
        reminderDate: 'asc',
      },
    });

    return NextResponse.json({
      count: pendingReminders.length,
      reminders: pendingReminders,
    });
  } catch (error) {
    console.error('Error fetching pending reminders:', error);
    return NextResponse.json({ error: 'Failed to fetch pending reminders' }, { status: 500 });
  }
}

/**
 * POST /api/admin/sms-reminders
 * Envoie tous les rappels SMS en attente
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
    });

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
    console.error('Error sending reminders:', error);
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 });
  }
}
