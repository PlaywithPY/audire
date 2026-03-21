import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const logs: string[] = [];
    logs.push('🚀 Démarrage de la configuration de la base de données...\n');

    // Étape 1: Migrations
    logs.push('📊 Étape 1/2: Application des migrations Prisma...');
    try {
      const { stdout: migrateStdout, stderr: migrateStderr } = await execAsync(
        'npx prisma migrate deploy',
        {
          cwd: process.cwd(),
          env: { ...process.env }
        }
      );

      if (migrateStdout) logs.push(migrateStdout);
      if (migrateStderr) logs.push(`⚠️ Warnings: ${migrateStderr}`);
      logs.push('✅ Migrations appliquées avec succès!\n');
    } catch (error: any) {
      logs.push(`❌ Erreur lors des migrations: ${error.message}`);
      if (error.stdout) logs.push(error.stdout);
      if (error.stderr) logs.push(error.stderr);

      return NextResponse.json({
        success: false,
        error: 'Erreur lors de l\'application des migrations',
        logs,
      });
    }

    // Étape 2: Seed
    logs.push('🌱 Étape 2/2: Peuplement de la base de données (seed)...');
    try {
      const { stdout: seedStdout, stderr: seedStderr } = await execAsync(
        'npx tsx prisma/seed.ts',
        {
          cwd: process.cwd(),
          env: { ...process.env }
        }
      );

      if (seedStdout) logs.push(seedStdout);
      if (seedStderr) logs.push(`⚠️ Warnings: ${seedStderr}`);
      logs.push('✅ Seed exécuté avec succès!\n');
    } catch (error: any) {
      logs.push(`❌ Erreur lors du seed: ${error.message}`);
      if (error.stdout) logs.push(error.stdout);
      if (error.stderr) logs.push(error.stderr);

      return NextResponse.json({
        success: false,
        error: 'Erreur lors du peuplement de la base',
        logs,
      });
    }

    logs.push('🎉 Configuration terminée avec succès!');

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error: any) {
    console.error('Erreur lors de la configuration de la DB:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur inconnue',
        logs: [`❌ Erreur: ${error.message}`]
      },
      { status: 500 }
    );
  }
}
