import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    const validStatuses = ['confirmed', 'cancelled', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
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

    // Si annulé, libérer le créneau
    if (status === 'cancelled') {
      await prisma.timeSlot.update({
        where: { id: appointment.timeSlotId },
        data: { isBooked: false },
      });
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
    await prisma.timeSlot.update({
      where: { id: appointment.timeSlotId },
      data: { isBooked: false },
    });

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
