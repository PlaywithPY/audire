import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

export async function POST() {
  const prisma = new PrismaClient();
  const logs: string[] = [];

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    logs.push('🚀 Création de la table PageText...\n');

    try {
      // Créer la table PageText
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "PageText" (
          "id" SERIAL PRIMARY KEY,
          "pageKey" TEXT NOT NULL,
          "textKey" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "label" TEXT,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "PageText_pageKey_textKey_key" UNIQUE ("pageKey", "textKey")
        )
      `);
      logs.push('✅ Table PageText créée');

      // Créer l'index
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "PageText_pageKey_idx" ON "PageText"("pageKey")
      `);
      logs.push('✅ Index PageText_pageKey_idx créé');

      logs.push('\n🎉 Configuration terminée avec succès!');
      logs.push('Vous pouvez maintenant utiliser l\'éditeur de textes.');

      return NextResponse.json({
        success: true,
        logs,
      });
    } catch (error: any) {
      logs.push(`❌ Erreur: ${error.message}`);

      // Si la table existe déjà, ce n'est pas grave
      if (error.message.includes('already exists')) {
        logs.push('ℹ️  La table PageText existe déjà.');
        return NextResponse.json({
          success: true,
          logs,
        });
      }

      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la création de la table',
        logs,
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Erreur:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur inconnue',
        logs: [`❌ Erreur: ${error.message}`]
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
