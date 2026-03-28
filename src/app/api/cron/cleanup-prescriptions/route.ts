import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { del } from '@vercel/blob';
import { unlink } from 'fs/promises';
import { join } from 'path';

const prisma = new PrismaClient();

/**
 * GET /api/cron/cleanup-prescriptions
 * Supprime les prescriptions expirées (appelé par un cron job)
 */
export async function GET(request: NextRequest) {
  try {
    // Vérification de sécurité : s'assurer que la requête vient d'un cron job autorisé
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Récupérer toutes les prescriptions expirées
    const expiredPrescriptions = await prisma.prescription.findMany({
      where: {
        expiresAt: {
          lte: now,
        },
      },
    });

    let deletedCount = 0;
    const errors: string[] = [];

    for (const prescription of expiredPrescriptions) {
      try {
        // Supprimer le fichier
        if (process.env.BLOB_READ_WRITE_TOKEN) {
          // Supprimer de Vercel Blob
          await del(prescription.fileUrl);
        } else {
          // Supprimer du filesystem local
          const filePath = join(process.cwd(), 'public', prescription.fileUrl);
          await unlink(filePath);
        }

        // Supprimer l'enregistrement de la base de données
        await prisma.prescription.delete({
          where: { id: prescription.id },
        });

        deletedCount++;
      } catch (error) {
        console.error(`Error deleting prescription ${prescription.id}:`, error);
        errors.push(`Failed to delete prescription ${prescription.id}`);
      }
    }

    return NextResponse.json({
      message: 'Prescription cleanup completed',
      deletedCount,
      totalExpired: expiredPrescriptions.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error cleaning up prescriptions:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup prescriptions' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
