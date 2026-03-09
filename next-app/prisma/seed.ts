import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function main() {
  console.log('🌱 Seeding database...');

  // Couleurs par défaut
  await prisma.themeColors.upsert({
    where: { id: 1 },
    update: {},
    create: {
      primary: '#42a4ff',
      primaryLight: '#5ab3ff',
      primaryDark: '#2d87e6',
      secondary: '#EBF5FF',
    },
  });

  // Horaires par défaut
  const defaultHours = [
    { dayOfWeek: 0, isOpen: false }, // Dimanche - Fermé
    { dayOfWeek: 1, isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '13:00', afternoonClose: '17:00' }, // Lundi
    { dayOfWeek: 2, isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '13:00', afternoonClose: '17:00' }, // Mardi
    { dayOfWeek: 3, isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '13:00', afternoonClose: '17:00' }, // Mercredi
    { dayOfWeek: 4, isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '13:00', afternoonClose: '17:00' }, // Jeudi
    { dayOfWeek: 5, isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '13:00', afternoonClose: '17:00' }, // Vendredi
    { dayOfWeek: 6, isOpen: false }, // Samedi - Sur rendez-vous (fermé par défaut)
  ];

  for (const hours of defaultHours) {
    await prisma.openingHours.upsert({
      where: { dayOfWeek: hours.dayOfWeek },
      update: {},
      create: hours,
    });
  }

  console.log('✅ Database seeded!');
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
