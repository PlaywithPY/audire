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

  // ==========================================
  // CENTRES AUDIRE (MULTI-CENTRES)
  // ==========================================

  // Centre 1: Audire Jemeppe (centre principal existant)
  const centreJemeppe = await prisma.centre.upsert({
    where: { slug: 'jemeppe' },
    update: {},
    create: {
      name: 'Audire Jemeppe',
      slug: 'jemeppe',
      phoneFixe: '+32 4 234 56 78',
      phoneMobile: '+32 476 12 34 56',
      email: 'jemeppe@audire.be',
      address: 'Rue de la Station, 4\n4101 Jemeppe-sur-Meuse',
      postalCode: '4101',
      city: 'Jemeppe-sur-Meuse',
      isActive: true,
      isDefault: true,
      latitude: 50.6197,
      longitude: 5.4981,
    },
  });

  // Centre 2: Audire Liège (centre fictif pour l'exemple)
  const centreLiege = await prisma.centre.upsert({
    where: { slug: 'liege' },
    update: {},
    create: {
      name: 'Audire Liège Centre',
      slug: 'liege',
      phoneFixe: '+32 4 222 33 44',
      phoneMobile: '+32 477 55 66 77',
      email: 'liege@audire.be',
      address: 'Place du Marché, 15\n4000 Liège',
      postalCode: '4000',
      city: 'Liège',
      isActive: true,
      isDefault: false,
      latitude: 50.6412,
      longitude: 5.5719,
    },
  });

  // Horaires pour le centre de Jemeppe
  const jemeppeHours = [
    { centreId: centreJemeppe.id, dayOfWeek: 0, isOpen: false }, // Dimanche - Fermé
    { centreId: centreJemeppe.id, dayOfWeek: 1, isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '13:00', afternoonClose: '17:00' }, // Lundi
    { centreId: centreJemeppe.id, dayOfWeek: 2, isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '13:00', afternoonClose: '17:00' }, // Mardi
    { centreId: centreJemeppe.id, dayOfWeek: 3, isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '13:00', afternoonClose: '17:00' }, // Mercredi
    { centreId: centreJemeppe.id, dayOfWeek: 4, isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '13:00', afternoonClose: '17:00' }, // Jeudi
    { centreId: centreJemeppe.id, dayOfWeek: 5, isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '13:00', afternoonClose: '17:00' }, // Vendredi
    { centreId: centreJemeppe.id, dayOfWeek: 6, isOpen: true, morningOpen: '09:00', morningClose: '12:30', afternoonOpen: null, afternoonClose: null }, // Samedi matin uniquement
  ];

  // Horaires pour le centre de Liège
  const liegeHours = [
    { centreId: centreLiege.id, dayOfWeek: 0, isOpen: false }, // Dimanche - Fermé
    { centreId: centreLiege.id, dayOfWeek: 1, isOpen: true, morningOpen: '08:30', morningClose: '12:00', afternoonOpen: '13:30', afternoonClose: '18:00' }, // Lundi
    { centreId: centreLiege.id, dayOfWeek: 2, isOpen: true, morningOpen: '08:30', morningClose: '12:00', afternoonOpen: '13:30', afternoonClose: '18:00' }, // Mardi
    { centreId: centreLiege.id, dayOfWeek: 3, isOpen: true, morningOpen: '08:30', morningClose: '12:00', afternoonOpen: '13:30', afternoonClose: '18:00' }, // Mercredi
    { centreId: centreLiege.id, dayOfWeek: 4, isOpen: true, morningOpen: '08:30', morningClose: '12:00', afternoonOpen: '13:30', afternoonClose: '18:00' }, // Jeudi
    { centreId: centreLiege.id, dayOfWeek: 5, isOpen: true, morningOpen: '08:30', morningClose: '12:00', afternoonOpen: '13:30', afternoonClose: '18:00' }, // Vendredi
    { centreId: centreLiege.id, dayOfWeek: 6, isOpen: false }, // Samedi - Fermé
  ];

  // Créer les horaires pour Jemeppe
  for (const hours of jemeppeHours) {
    await prisma.openingHours.upsert({
      where: {
        centreId_dayOfWeek: {
          centreId: hours.centreId,
          dayOfWeek: hours.dayOfWeek,
        },
      },
      update: {},
      create: hours,
    });
  }

  // Créer les horaires pour Liège
  for (const hours of liegeHours) {
    await prisma.openingHours.upsert({
      where: {
        centreId_dayOfWeek: {
          centreId: hours.centreId,
          dayOfWeek: hours.dayOfWeek,
        },
      },
      update: {},
      create: hours,
    });
  }

  // ==========================================
  // AVIS CLIENTS
  // ==========================================

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
  console.log(`   - ${jemeppeHours.length} horaires créés pour ${centreJemeppe.name}`);
  console.log(`   - ${liegeHours.length} horaires créés pour ${centreLiege.name}`);
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
