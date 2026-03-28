import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { emailService } from '@/lib/email';

const prisma = new PrismaClient();

/**
 * POST /api/appointments/prescription
 * Upload d'une prescription pour un rendez-vous
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const appointmentId = formData.get('appointmentId') as string;

    if (!file || !appointmentId) {
      return NextResponse.json(
        { error: 'File and appointment ID are required' },
        { status: 400 }
      );
    }

    // Vérifier que le rendez-vous existe
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(appointmentId) },
      include: {
        centre: true,
        timeSlot: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    if (!appointment.timeSlot) {
      return NextResponse.json(
        { error: 'Appointment time slot not found' },
        { status: 400 }
      );
    }

    // Valider le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG and PDF are allowed' },
        { status: 400 }
      );
    }

    // Valider la taille du fichier (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    let fileUrl: string;
    const fileName = `prescription-${appointmentId}-${Date.now()}-${file.name}`;

    // Upload du fichier
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Utiliser Vercel Blob en production
      const blob = await put(fileName, file, {
        access: 'public',
        addRandomSuffix: false,
      });
      fileUrl = blob.url;
    } else {
      // Utiliser le filesystem local en développement
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'prescriptions');
      await mkdir(uploadDir, { recursive: true });

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = join(uploadDir, fileName);

      await writeFile(filePath, buffer);
      fileUrl = `/uploads/prescriptions/${fileName}`;
    }

    // Calculer la date d'expiration (1 mois après la date du RDV)
    const appointmentDate = new Date(appointment.timeSlot.date);
    const expiresAt = new Date(appointmentDate);
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    // Créer l'enregistrement de prescription
    const prescription = await prisma.prescription.create({
      data: {
        appointmentId: parseInt(appointmentId),
        fileUrl,
        fileName: file.name,
        expiresAt,
      },
    });

    // Mettre à jour le rendez-vous
    await prisma.appointment.update({
      where: { id: parseInt(appointmentId) },
      data: { hasPrescription: true },
    });

    // Envoyer l'email avec la prescription
    const patientName = `${appointment.firstName} ${appointment.lastName}`;
    const appointmentDateStr = new Date(appointment.timeSlot.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const appointmentTimeStr = `${appointment.timeSlot.startTime} - ${appointment.timeSlot.endTime}`;

    const emailSent = await emailService.sendPrescriptionEmail({
      patientName,
      appointmentDate: `${appointmentDateStr} à ${appointmentTimeStr}`,
      appointmentType: appointment.appointmentType,
      prescriptionUrl: process.env.BLOB_READ_WRITE_TOKEN
        ? fileUrl
        : `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${fileUrl}`,
      prescriptionFileName: file.name,
    });

    // Mettre à jour le statut d'envoi de l'email
    if (emailSent) {
      await prisma.prescription.update({
        where: { id: prescription.id },
        data: { emailSent: true },
      });
    }

    return NextResponse.json(
      {
        message: 'Prescription uploaded successfully',
        prescription,
        emailSent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading prescription:', error);
    return NextResponse.json(
      { error: 'Failed to upload prescription' },
      { status: 500 }
    );
  }
}
