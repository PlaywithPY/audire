import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * API Route pour tester la connexion à la base de données
 */
export async function GET() {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const logs: string[] = [];
    let success = true;
    let error: string | null = null;

    // Test 1: Connexion à la base de données
    logs.push('🔍 Test de connexion à la base de données...');

    try {
      await prisma.$connect();
      logs.push('✅ Connexion réussie');
    } catch (err) {
      logs.push(`❌ Échec de connexion: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      success = false;
      error = err instanceof Error ? err.message : 'Erreur de connexion';
    }

    // Test 2: Vérifier si la table PageText existe
    if (success) {
      logs.push('\n🔍 Vérification de la table PageText...');
      try {
        const count = await prisma.pageText.count();
        logs.push(`✅ Table PageText trouvée (${count} entrées)`);
      } catch (err) {
        logs.push(`❌ Table PageText introuvable ou inaccessible`);
        logs.push(`   Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
        success = false;
        error = 'Table PageText inexistante - migrations Prisma non appliquées';
      }
    }

    // Test 3: Vérifier la configuration DATABASE_URL
    logs.push('\n🔍 Configuration de la base de données:');
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      // Masquer le mot de passe dans l'URL
      const safeUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
      logs.push(`   DATABASE_URL: ${safeUrl}`);

      if (dbUrl.startsWith('file:')) {
        logs.push('⚠️  Base de données SQLite détectée');
        logs.push('   Note: Le schema Prisma indique "postgresql"');
        logs.push('   Vérifiez la cohérence entre schema.prisma et .env');
      } else if (dbUrl.startsWith('postgres')) {
        logs.push('✅ Base de données PostgreSQL détectée');
      }
    } else {
      logs.push('❌ DATABASE_URL non définie');
      success = false;
      error = 'DATABASE_URL manquante';
    }

    // Test 4: Liste de toutes les tables accessibles
    if (success) {
      logs.push('\n🔍 Tables accessibles:');
      try {
        // Essayer d'accéder à différents modèles
        const models = [
          { name: 'PageText', fn: () => prisma.pageText.count() },
          { name: 'CardImage', fn: () => prisma.cardImage.count() },
          { name: 'Centre', fn: () => prisma.centre.count() },
          { name: 'SiteSettings', fn: () => prisma.siteSettings.count() },
          { name: 'Solution', fn: () => prisma.solution.count() },
        ];

        for (const model of models) {
          try {
            const count = await model.fn();
            logs.push(`   ✅ ${model.name}: ${count} entrées`);
          } catch {
            logs.push(`   ❌ ${model.name}: inaccessible`);
          }
        }
      } catch (err) {
        logs.push(`   ❌ Impossible de lister les tables`);
      }
    }

    return NextResponse.json({
      success,
      error,
      logs,
      databaseUrl: dbUrl ? dbUrl.replace(/:[^:@]+@/, ':****@') : 'Non définie',
    });
  } catch (error) {
    console.error('Erreur lors du test de connexion:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors du test de connexion',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        logs: [`❌ Erreur fatale: ${error instanceof Error ? error.message : 'Erreur inconnue'}`],
      },
      { status: 500 }
    );
  }
}
