import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    // TODO: Ajouter l'authentification si nécessaire
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    // }

    // Exécuter le seed
    const { stdout, stderr } = await execAsync('npx tsx prisma/seed.ts');

    console.log('Seed output:', stdout);
    if (stderr) {
      console.error('Seed errors:', stderr);
    }

    return NextResponse.json({
      success: true,
      message: 'Base de données initialisée avec succès',
      output: stdout
    });
  } catch (error: unknown) {
    console.error('Error seeding database:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'initialisation de la base de données',
      details: errorMessage
    }, { status: 500 });
  }
}
