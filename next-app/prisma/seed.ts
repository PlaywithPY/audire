import { PrismaClient } from '@prisma/client';
import { seedDatabase } from './seed-function';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function main() {
  await seedDatabase(prisma);
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
