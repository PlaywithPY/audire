import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import pageDefinitions from '../../../../../PAGE_DEFINITIONS';

/**
 * API Route pour peupler la base de données avec les textes des pages
 * Équivalent à: npx tsx scripts/populate-page-texts.ts
 */
export async function POST() {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    let created = 0;
    let skipped = 0;
    const logs: string[] = [];

    logs.push('🚀 Peuplement de la table PageText...\n');

    for (const page of pageDefinitions) {
      logs.push(`📄 Page: ${page.pageLabel}`);

      for (const text of page.texts) {
        const existing = await prisma.pageText.findUnique({
          where: {
            pageKey_textKey: {
              pageKey: page.pageKey,
              textKey: text.textKey,
            },
          },
        });

        if (existing) {
          logs.push(`  ⏭️  ${text.textKey} (existe déjà)`);
          skipped++;
        } else {
          await prisma.pageText.create({
            data: {
              pageKey: page.pageKey,
              textKey: text.textKey,
              content: text.defaultContent,
              label: text.label,
            },
          });
          logs.push(`  ✅ ${text.textKey}`);
          created++;
        }
      }
      logs.push('');
    }

    logs.push('📊 Résumé:');
    logs.push(`  ✅ Créés: ${created}`);
    logs.push(`  ⏭️  Ignorés (déjà existants): ${skipped}`);
    logs.push(`  📝 Total: ${created + skipped}`);

    return NextResponse.json({
      success: true,
      created,
      skipped,
      total: created + skipped,
      logs,
    });
  } catch (error) {
    console.error('Erreur lors du peuplement:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors du peuplement de la base de données',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
