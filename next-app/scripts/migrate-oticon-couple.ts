/**
 * Script pour migrer l'image oticon-couple hardcodée vers la base de données
 * Usage: npx tsx scripts/migrate-oticon-couple.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Migration de l\'image oticon-couple vers la base de données...');

  try {
    const imageEffect = await prisma.imageEffect.upsert({
      where: {
        pageKey_sectionKey: {
          pageKey: 'home',
          sectionKey: 'after-hero',
        },
      },
      update: {
        imageUrl: '/images/oticon-couple.jpg',
        effectType: 'parallax',
        effectSpeed: 0.6,
        effectScale: 1.2,
        alt: 'Couple dans un environnement élégant avec Oticon',
        overlayColor: 'rgba(0, 0, 0, 0.3)',
        minHeight: '600px',
        isVisible: true,
        order: 0,
      },
      create: {
        imageUrl: '/images/oticon-couple.jpg',
        effectType: 'parallax',
        effectSpeed: 0.6,
        effectScale: 1.2,
        pageKey: 'home',
        sectionKey: 'after-hero',
        order: 0,
        isVisible: true,
        alt: 'Couple dans un environnement élégant avec Oticon',
        overlayColor: 'rgba(0, 0, 0, 0.3)',
        minHeight: '600px',
      },
    });

    console.log('✅ Image oticon-couple migrée avec succès !');
    console.log('📦 Détails:', imageEffect);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
