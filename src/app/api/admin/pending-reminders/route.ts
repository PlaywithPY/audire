import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { emailService } from '@/lib/email';

const prisma = new PrismaClient();

/**
 * GET /api/admin/pending-reminders
 * Vérifie les rendez-vous en attente depuis plus de 24h et envoie un email de rappel
 *
 * Cette route peut être appelée par un cron job externe (ex: cron-job.org)
 * Pour sécuriser, on peut ajouter un token d'authentification dans les headers
 */
export async function GET(request: NextRequest) {
  try {
    // Vérification du token de sécurité (optionnel mais recommandé)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Calculer la date d'il y a 24 heures
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    // Chercher les rendez-vous en attente depuis plus de 24h
    const pendingAppointments = await prisma.appointment.findMany({
      where: {
        status: 'pending',
        createdAt: {
          lt: oneDayAgo,
        },
      },
      include: {
        centre: true,
        timeSlot: true,
      },
    });

    // Si aucun rendez-vous en attente, ne rien faire
    if (pendingAppointments.length === 0) {
      return NextResponse.json({
        message: 'No pending appointments to remind',
        count: 0,
      });
    }

    // Envoyer l'email de rappel à l'admin
    const emailSent = await emailService.sendPendingAppointmentsReminder(
      pendingAppointments.length
    );

    if (emailSent) {
      return NextResponse.json({
        message: 'Reminder email sent successfully',
        count: pendingAppointments.length,
        appointments: pendingAppointments.map((apt) => ({
          id: apt.id,
          patient: `${apt.firstName} ${apt.lastName}`,
          createdAt: apt.createdAt,
          centre: apt.centre.name,
        })),
      });
    } else {
      return NextResponse.json(
        {
          error: 'Failed to send reminder email',
          count: pendingAppointments.length,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error checking pending appointments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
