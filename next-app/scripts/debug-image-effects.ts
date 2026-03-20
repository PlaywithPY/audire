import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const effects = await prisma.imageEffect.findMany({
    where: {
      pageKey: 'home',
    },
  });

  console.log('\n📊 Image effects pour la page "home":');
  console.log('==========================================');

  effects.forEach((effect) => {
    console.log(`\nID: ${effect.id}`);
    console.log(`Section Key: "${effect.sectionKey}"`);
    console.log(`Is Visible: ${effect.isVisible}`);
    console.log(`Image URL: ${effect.imageUrl}`);
    console.log(`Effect Type: ${effect.effectType}`);
  });

  console.log('\n==========================================\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
