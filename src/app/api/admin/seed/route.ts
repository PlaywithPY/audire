import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { seedDatabase } from '../../../../../prisma/seed-function';

export async function POST() {
  const prisma = new PrismaClient();
  const logs: string[] = [];

  try {
    // TODO: Ajouter l'authentification si nécessaire
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    // }

    // Exécuter le seed
    await seedDatabase(prisma, logs);

    return NextResponse.json({
      success: true,
      message: 'Base de données initialisée avec succès',
      output: logs.join('\n')
    });
  } catch (error: unknown) {
    console.error('Error seeding database:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    logs.push(`❌ Erreur: ${errorMessage}`);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'initialisation de la base de données',
      details: errorMessage,
      logs: logs.join('\n')
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
