import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

/**
 * Route API pour importer le contenu existant des pages
 * Convertit le contenu hardcodé en blocs modifiables
 */

const contentBlocks = [
  // ========== PAGE D'ACCUEIL ==========
  {
    pageKey: 'home',
    blockKey: 'hero-badge',
    blockType: 'text',
    content: 'Centre auditif indépendant • Province de Liège',
    order: 1,
  },
  {
    pageKey: 'home',
    blockKey: 'hero-title',
    blockType: 'title',
    content: 'Mieux entendre, simplement.',
    order: 2,
  },
  {
    pageKey: 'home',
    blockKey: 'hero-subtitle',
    blockType: 'text',
    content: 'Chez Audire, on commence par comprendre votre quotidien et vos difficultés. Puis on vous propose une suite claire et sans pression. Test auditif gratuit, explications pédagogiques, réglages et suivi dans la durée.',
    order: 3,
  },
  {
    pageKey: 'home',
    blockKey: 'hero-cta-primary',
    blockType: 'button',
    content: '📅 Prendre rendez-vous|/contact',
    order: 4,
  },
  {
    pageKey: 'home',
    blockKey: 'hero-cta-secondary',
    blockType: 'button',
    content: '📞 Nous contacter|/contact',
    order: 5,
  },
  {
    pageKey: 'home',
    blockKey: 'hero-reassurance',
    blockType: 'text',
    content: 'Vous hésitez ? Venez juste faire le point. Parfois la meilleure réponse est "pas maintenant" — et on vous le dira.',
    order: 6,
  },

  // ========== CARDS PAGE D'ACCUEIL ==========
  {
    pageKey: 'home',
    blockKey: 'hero-features-test',
    blockType: 'card',
    content: 'Test auditif gratuit',
    metadata: JSON.stringify({ icon: '👂', description: 'Un test complet et sans engagement pour comprendre votre audition.' }),
    order: 10,
  },
  {
    pageKey: 'home',
    blockKey: 'hero-features-accompagnement',
    blockType: 'card',
    content: 'Accompagnement humain',
    metadata: JSON.stringify({ icon: '💬', description: 'Pas de jargon technique, pas de pression commerciale.' }),
    order: 11,
  },
  {
    pageKey: 'home',
    blockKey: 'hero-features-suivi',
    blockType: 'card',
    content: 'Suivi personnalisé',
    metadata: JSON.stringify({ icon: '🔧', description: 'Réglages progressifs, adaptations, suivi régulier.' }),
    order: 12,
  },
  {
    pageKey: 'home',
    blockKey: 'hero-features-qualite',
    blockType: 'card',
    content: 'Solutions de qualité',
    metadata: JSON.stringify({ icon: '🏆', description: 'Oticon et Bernafon, deux marques reconnues.' }),
    order: 13,
  },
  {
    pageKey: 'home',
    blockKey: 'hero-features-independant',
    blockType: 'card',
    content: 'Centre indépendant',
    metadata: JSON.stringify({ icon: '🎯', description: "Pas d'objectifs de vente, pas de réseau à satisfaire." }),
    order: 14,
  },
  {
    pageKey: 'home',
    blockKey: 'hero-features-transparence',
    blockType: 'card',
    content: 'Transparence des prix',
    metadata: JSON.stringify({ icon: '💰', description: 'Prix clairs, remboursements expliqués.' }),
    order: 15,
  },

  // ========== PAGE CONTACT ==========
  {
    pageKey: 'contact',
    blockKey: 'hero-title',
    blockType: 'title',
    content: 'Contactez-nous',
    order: 1,
  },
  {
    pageKey: 'contact',
    blockKey: 'hero-subtitle',
    blockType: 'text',
    content: 'Une question ? Besoin d\'un rendez-vous ? N\'hésitez pas à nous contacter.',
    order: 2,
  },
  {
    pageKey: 'contact',
    blockKey: 'address-title',
    blockType: 'text',
    content: 'Notre adresse',
    order: 3,
  },
  {
    pageKey: 'contact',
    blockKey: 'address',
    blockType: 'text',
    content: 'Rue de la Station, 4\n4101 Jemeppe-sur-Meuse',
    order: 4,
  },

  // ========== PAGE FAQ ==========
  {
    pageKey: 'faq',
    blockKey: 'hero-title',
    blockType: 'title',
    content: 'Questions fréquentes',
    order: 1,
  },
  {
    pageKey: 'faq',
    blockKey: 'hero-subtitle',
    blockType: 'text',
    content: 'Vous trouverez ici les réponses aux questions les plus fréquentes.',
    order: 2,
  },

  // ========== PAGE SOLUTIONS AUDITIVES ==========
  {
    pageKey: 'solutions-auditives',
    blockKey: 'hero-title',
    blockType: 'title',
    content: 'Solutions auditives',
    order: 1,
  },
  {
    pageKey: 'solutions-auditives',
    blockKey: 'hero-subtitle',
    blockType: 'text',
    content: 'Nous proposons des solutions auditives adaptées à chaque personne.',
    order: 2,
  },
  {
    pageKey: 'solutions-auditives',
    blockKey: 'oticon-title',
    blockType: 'text',
    content: 'Oticon',
    order: 3,
  },
  {
    pageKey: 'solutions-auditives',
    blockKey: 'oticon-description',
    blockType: 'text',
    content: 'Leader mondial en audiologie, Oticon développe des appareils auditifs innovants.',
    order: 4,
  },
  {
    pageKey: 'solutions-auditives',
    blockKey: 'bernafon-title',
    blockType: 'text',
    content: 'Bernafon',
    order: 5,
  },
  {
    pageKey: 'solutions-auditives',
    blockKey: 'bernafon-description',
    blockType: 'text',
    content: 'Solutions auditives suisses reconnues pour leur qualité et leur confort.',
    order: 6,
  },

  // ========== PAGE TEST AUDITIF GRATUIT ==========
  {
    pageKey: 'test-auditif-gratuit',
    blockKey: 'hero-title',
    blockType: 'title',
    content: 'Test auditif gratuit',
    order: 1,
  },
  {
    pageKey: 'test-auditif-gratuit',
    blockKey: 'hero-subtitle',
    blockType: 'text',
    content: 'Prenez rendez-vous pour un test auditif complet et gratuit, sans engagement.',
    order: 2,
  },
  {
    pageKey: 'test-auditif-gratuit',
    blockKey: 'process-title',
    blockType: 'text',
    content: 'Comment se déroule le test ?',
    order: 3,
  },
  {
    pageKey: 'test-auditif-gratuit',
    blockKey: 'process-description',
    blockType: 'text',
    content: 'Le test auditif dure environ 30 minutes. Nous évaluons votre audition et vous expliquons les résultats de manière claire et pédagogique.',
    order: 4,
  },

  // ========== PAGE NOTRE ACCOMPAGNEMENT ==========
  {
    pageKey: 'notre-accompagnement',
    blockKey: 'hero-title',
    blockType: 'title',
    content: 'Notre accompagnement',
    order: 1,
  },
  {
    pageKey: 'notre-accompagnement',
    blockKey: 'hero-subtitle',
    blockType: 'text',
    content: 'Un suivi personnalisé tout au long de votre parcours auditif.',
    order: 2,
  },
  {
    pageKey: 'notre-accompagnement',
    blockKey: 'approach-title',
    blockType: 'text',
    content: 'Notre approche',
    order: 3,
  },
  {
    pageKey: 'notre-accompagnement',
    blockKey: 'approach-description',
    blockType: 'text',
    content: 'Nous prenons le temps de comprendre vos besoins et votre quotidien pour vous proposer des solutions adaptées.',
    order: 4,
  },

  // ========== PAGE REMBOURSEMENTS ==========
  {
    pageKey: 'remboursements',
    blockKey: 'hero-title',
    blockType: 'title',
    content: 'Remboursements',
    order: 1,
  },
  {
    pageKey: 'remboursements',
    blockKey: 'hero-subtitle',
    blockType: 'text',
    content: 'Informations sur les remboursements et les aides financières.',
    order: 2,
  },
  {
    pageKey: 'remboursements',
    blockKey: 'mutuelle-title',
    blockType: 'text',
    content: 'Remboursement mutuelle',
    order: 3,
  },
  {
    pageKey: 'remboursements',
    blockKey: 'mutuelle-description',
    blockType: 'text',
    content: 'Les appareils auditifs sont partiellement remboursés par la mutuelle selon votre âge et votre perte auditive.',
    order: 4,
  },

  // ========== PAGE PARTENAIRES PHARMACIENS ==========
  {
    pageKey: 'partenaires-pharmaciens',
    blockKey: 'hero-title',
    blockType: 'title',
    content: 'Partenaires pharmaciens',
    order: 1,
  },
  {
    pageKey: 'partenaires-pharmaciens',
    blockKey: 'hero-subtitle',
    blockType: 'text',
    content: 'Nous collaborons avec des pharmacies de la région.',
    order: 2,
  },
  {
    pageKey: 'partenaires-pharmaciens',
    blockKey: 'partnership-title',
    blockType: 'text',
    content: 'Un réseau de confiance',
    order: 3,
  },
  {
    pageKey: 'partenaires-pharmaciens',
    blockKey: 'partnership-description',
    blockType: 'text',
    content: 'Nos pharmaciens partenaires peuvent vous orienter vers notre centre pour un test auditif.',
    order: 4,
  },
];

export async function POST() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const block of contentBlocks) {
      try {
        const result = await prisma.contentBlock.upsert({
          where: {
            pageKey_blockKey: {
              pageKey: block.pageKey,
              blockKey: block.blockKey,
            },
          },
          update: {
            content: block.content,
            blockType: block.blockType,
            order: block.order,
            metadata: (block as any).metadata || null,
          },
          create: {
            pageKey: block.pageKey,
            blockKey: block.blockKey,
            blockType: block.blockType,
            content: block.content,
            order: block.order,
            metadata: (block as any).metadata || null,
            isVisible: true,
          },
        });

        // Déterminer si c'est une création ou une mise à jour
        if (result.createdAt.getTime() === result.updatedAt.getTime()) {
          created++;
        } else {
          updated++;
        }
      } catch (error) {
        errors++;
        console.error(`Error importing block [${block.pageKey}] ${block.blockKey}:`, error);
      }
    }

    // Invalider le cache
    revalidatePath('/', 'layout');

    return NextResponse.json({
      success: true,
      created,
      updated,
      errors,
      total: contentBlocks.length,
    });
  } catch (error) {
    console.error('Error importing content:', error);
    return NextResponse.json({ error: 'Failed to import content' }, { status: 500 });
  }
}
