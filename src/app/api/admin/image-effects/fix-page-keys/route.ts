import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Récupérer tous les effets pour analyse
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allEffects = await prisma.imageEffect.findMany({
      orderBy: [
        { pageKey: 'asc' },
        { order: 'asc' }
      ]
    });

    // Sections valides par page
    const validSections: Record<string, string[]> = {
      'home': ['after-hero', 'after-features', 'after-testimonials'],
      'solutions-auditives': ['after-hero', 'after-solutions-grid'],
      'test-auditif-gratuit': ['after-hero', 'after-content'],
      'notre-accompagnement': ['after-hero', 'after-content'],
      'remboursements': ['after-hero', 'after-content'],
      'faq': ['after-hero'],
      'contact': ['after-hero'],
      'partenaires-pharmaciens': ['after-hero', 'after-content'],
    };

    // Détecter les incohérences
    const issues = allEffects.map(effect => {
      const validSectionsForPage = validSections[effect.pageKey] || [];
      const sectionExists = validSectionsForPage.includes(effect.sectionKey);

      // Trouver si ce sectionKey appartient à une autre page
      let suggestedPageKey: string | null = null;
      if (!sectionExists) {
        for (const [page, sections] of Object.entries(validSections)) {
          if (sections.includes(effect.sectionKey)) {
            suggestedPageKey = page;
            break;
          }
        }
      }

      return {
        ...effect,
        hasIssue: !sectionExists,
        suggestedPageKey,
        message: !sectionExists
          ? suggestedPageKey
            ? `⚠️ "${effect.sectionKey}" n'existe pas dans "${effect.pageKey}", devrait être dans "${suggestedPageKey}"`
            : `⚠️ "${effect.sectionKey}" n'existe dans aucune page connue`
          : '✅ OK',
      };
    });

    return NextResponse.json({
      total: allEffects.length,
      effects: issues,
      issuesCount: issues.filter(i => i.hasIssue).length,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST: Corriger automatiquement les pageKeys
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allEffects = await prisma.imageEffect.findMany();

    const validSections: Record<string, string[]> = {
      'home': ['after-hero', 'after-features', 'after-testimonials'],
      'solutions-auditives': ['after-hero', 'after-solutions-grid'],
      'test-auditif-gratuit': ['after-hero', 'after-content'],
      'notre-accompagnement': ['after-hero', 'after-content'],
      'remboursements': ['after-hero', 'after-content'],
      'faq': ['after-hero'],
      'contact': ['after-hero'],
      'partenaires-pharmaciens': ['after-hero', 'after-content'],
    };

    const corrections = [];

    for (const effect of allEffects) {
      const validSectionsForPage = validSections[effect.pageKey] || [];
      const sectionExists = validSectionsForPage.includes(effect.sectionKey);

      if (!sectionExists) {
        // Trouver la bonne page
        for (const [page, sections] of Object.entries(validSections)) {
          if (sections.includes(effect.sectionKey)) {
            await prisma.imageEffect.update({
              where: { id: effect.id },
              data: { pageKey: page },
            });
            corrections.push({
              id: effect.id,
              from: effect.pageKey,
              to: page,
              sectionKey: effect.sectionKey,
            });
            break;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      corrected: corrections.length,
      corrections,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
