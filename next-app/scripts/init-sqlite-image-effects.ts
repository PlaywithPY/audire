import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Initialisation de la table ImageEffect pour SQLite...\n');

  // Vérifier si la table existe (essayer de compter les lignes)
  try {
    const count = await prisma.imageEffect.count();
    console.log(`✅ Table ImageEffect existe déjà avec ${count} enregistrement(s)`);
  } catch (error) {
    console.log('❌ Table ImageEffect n\'existe pas, création en cours...');
    // Ici on pourrait utiliser prisma migrate deploy mais on va juste insérer les données
  }

  // Insérer ou mettre à jour l'image oticon-couple
  console.log('\n📸 Insertion de l\'image oticon-couple...');

  try {
    // Supprimer l'ancienne entrée si elle existe
    await prisma.imageEffect.deleteMany({
      where: {
        pageKey: 'home',
        sectionKey: 'after-hero',
      },
    });

    // Insérer la nouvelle entrée
    const imageEffect = await prisma.imageEffect.create({
      data: {
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

    console.log('✅ Image oticon-couple insérée avec succès !');
    console.log(`   ID: ${imageEffect.id}`);
    console.log(`   Page: ${imageEffect.pageKey}`);
    console.log(`   Section: ${imageEffect.sectionKey}`);
    console.log(`   Effect: ${imageEffect.effectType}`);
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion:', error);
    throw error;
  }

  console.log('\n🎉 Initialisation terminée !');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
