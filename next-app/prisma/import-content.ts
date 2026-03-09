import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

/**
 * Script d'importation du contenu existant des pages
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

async function main() {
  console.log('🚀 Démarrage de l\'importation du contenu...\n');

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
        },
        create: {
          pageKey: block.pageKey,
          blockKey: block.blockKey,
          blockType: block.blockType,
          content: block.content,
          order: block.order,
          isVisible: true,
        },
      });

      const action = result.createdAt.getTime() === result.updatedAt.getTime() ? 'créé' : 'mis à jour';
      if (action === 'créé') created++;
      else updated++;

      console.log(`✅ [${block.pageKey}] ${block.blockKey} - ${action}`);
    } catch (error) {
      errors++;
      console.error(`❌ [${block.pageKey}] ${block.blockKey} - Erreur:`, error);
    }
  }

  console.log(`\n📊 Résumé:`);
  console.log(`   • ${created} blocs créés`);
  console.log(`   • ${updated} blocs mis à jour`);
  console.log(`   • ${errors} erreurs`);
  console.log(`\n✨ Importation terminée !`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
