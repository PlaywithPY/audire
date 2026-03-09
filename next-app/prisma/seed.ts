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

  // Numéros de téléphone par défaut
  await prisma.siteSettings.upsert({
    where: { key: 'phone_fixe' },
    update: {},
    create: {
      key: 'phone_fixe',
      value: '+32 4 123 45 67',
    },
  });

  await prisma.siteSettings.upsert({
    where: { key: 'phone_mobile' },
    update: {},
    create: {
      key: 'phone_mobile',
      value: '+32 476 12 34 56',
    },
  });

  // Email par défaut
  await prisma.siteSettings.upsert({
    where: { key: 'email' },
    update: {},
    create: {
      key: 'email',
      value: 'centre.audire@gmail.com',
    },
  });

  // Adresse physique par défaut
  await prisma.siteSettings.upsert({
    where: { key: 'address' },
    update: {},
    create: {
      key: 'address',
      value: 'Rue de la Station, 4\n4101 Jemeppe-sur-Meuse',
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

  // Avis clients par défaut
  await prisma.testimonial.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Marie D.',
      text: 'Excellent accueil et professionnalisme. On prend vraiment le temps d\'expliquer et de répondre aux questions. Je recommande vivement !',
      rating: 5,
      location: 'Liège',
      isVisible: true,
      isFeatured: true,
    },
  });

  await prisma.testimonial.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Jean-Pierre L.',
      text: 'Très satisfait de mon appareil auditif. Le suivi est impeccable, toujours disponible pour les réglages.',
      rating: 5,
      location: 'Seraing',
      isVisible: true,
      isFeatured: true,
    },
  });

  await prisma.testimonial.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Sophie M.',
      text: 'Merci pour la patience et les explications claires. Enfin un centre qui écoute vraiment !',
      rating: 5,
      location: 'Herstal',
      isVisible: true,
      isFeatured: false,
    },
  });

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
