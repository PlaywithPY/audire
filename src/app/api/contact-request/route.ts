import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { emailService } from '@/lib/email';

const prisma = new PrismaClient();

/**
 * POST /api/contact-request
 * Crée une demande de contact/rendez-vous (sans créneau horaire fixe)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      civilite,
      firstName,
      lastName,
      address,
      phone,
      email,
      message,
      appointmentType,
    } = body;

    // Validation
    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: 'Prénom, nom et téléphone sont obligatoires' },
        { status: 400 }
      );
    }

    // Récupérer le centre par défaut
    const defaultCentre = await prisma.centre.findFirst({
      where: { isDefault: true },
    });

    if (!defaultCentre) {
      // Si pas de centre par défaut, prendre le premier centre actif
      const firstCentre = await prisma.centre.findFirst({
        where: { isActive: true },
      });

      if (!firstCentre) {
        return NextResponse.json(
          { error: 'Aucun centre disponible' },
          { status: 500 }
        );
      }

      // Créer la demande avec le premier centre trouvé
      const appointment = await prisma.appointment.create({
        data: {
          centreId: firstCentre.id,
          civilite: civilite || null,
          firstName,
          lastName,
          address: address || null,
          phone,
          email: email || null,
          appointmentType: appointmentType || 'premier-contact',
          message: message || null,
          hasPrescription: false,
          status: 'confirmed',
        },
        include: {
          centre: true,
        },
      });

      // Envoyer un email de notification
      await emailService.sendAppointmentRequestEmail({
        civilite: civilite || null,
        firstName,
        lastName,
        phone,
        email: email || null,
        message: message || null,
        appointmentType: appointmentType || 'premier-contact',
        centreName: firstCentre.name,
      });

      return NextResponse.json(
        {
          message: 'Demande de contact créée avec succès',
          appointment,
        },
        { status: 201 }
      );
    }

    // Créer la demande avec le centre par défaut
    const appointment = await prisma.appointment.create({
      data: {
        centreId: defaultCentre.id,
        civilite: civilite || null,
        firstName,
        lastName,
        address: address || null,
        phone,
        email: email || null,
        appointmentType: appointmentType || 'premier-contact',
        message: message || null,
        hasPrescription: false,
        status: 'confirmed',
      },
      include: {
        centre: true,
      },
    });

    // Envoyer un email de notification
    await emailService.sendAppointmentRequestEmail({
      civilite: civilite || null,
      firstName,
      lastName,
      phone,
      email: email || null,
      message: message || null,
      appointmentType: appointmentType || 'premier-contact',
      centreName: defaultCentre.name,
    });

    return NextResponse.json(
      {
        message: 'Demande de contact créée avec succès',
        appointment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contact request:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la demande' },
      { status: 500 }
    );
  }
}
