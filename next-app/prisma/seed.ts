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

  // ==========================================
  // CATÉGORIES DE PERTE AUDITIVE
  // ==========================================

  const categoryLegere = await prisma.hearingLossCategory.upsert({
    where: { slug: 'legere' },
    update: {},
    create: {
      name: 'Légère',
      slug: 'legere',
      minDb: 20,
      maxDb: 40,
      description: 'Difficulté à suivre une conversation dans un environnement bruyant',
      order: 1,
    },
  });

  const categoryMoyenne = await prisma.hearingLossCategory.upsert({
    where: { slug: 'moyenne' },
    update: {},
    create: {
      name: 'Moyenne',
      slug: 'moyenne',
      minDb: 41,
      maxDb: 70,
      description: 'Difficulté à suivre une conversation sans appareil auditif',
      order: 2,
    },
  });

  const categorySevere = await prisma.hearingLossCategory.upsert({
    where: { slug: 'severe' },
    update: {},
    create: {
      name: 'Sévère',
      slug: 'severe',
      minDb: 71,
      maxDb: 90,
      description: 'Seuls les sons très forts sont perçus',
      order: 3,
    },
  });

  const categoryProfonde = await prisma.hearingLossCategory.upsert({
    where: { slug: 'profonde' },
    update: {},
    create: {
      name: 'Profonde',
      slug: 'profonde',
      minDb: 91,
      maxDb: 120,
      description: 'Aucun son n\'est perçu sans appareil auditif puissant',
      order: 4,
    },
  });

  // ==========================================
  // TYPES D'APPAREILS
  // ==========================================

  const typeContour = await prisma.deviceType.upsert({
    where: { slug: 'contour' },
    update: {},
    create: {
      name: 'Contour d\'oreille',
      slug: 'contour',
      description: 'Appareil qui se porte derrière l\'oreille avec un tube relié à un embout',
      order: 1,
    },
  });

  const typeIntra = await prisma.deviceType.upsert({
    where: { slug: 'intra' },
    update: {},
    create: {
      name: 'Intra-auriculaire',
      slug: 'intra',
      description: 'Appareil sur mesure qui se glisse dans le conduit auditif',
      order: 2,
    },
  });

  const typeRic = await prisma.deviceType.upsert({
    where: { slug: 'ric' },
    update: {},
    create: {
      name: 'RIC (Écouteur déporté)',
      slug: 'ric',
      description: 'Appareil discret avec l\'écouteur placé dans le conduit auditif',
      order: 3,
    },
  });

  // ==========================================
  // PRODUITS EXEMPLES
  // ==========================================

  // Exemple de produit Oticon
  await prisma.product.upsert({
    where: { slug: 'oticon-intent' },
    update: {},
    create: {
      name: 'Oticon Intent',
      slug: 'oticon-intent',
      brand: 'Oticon',
      model: 'Intent',
      shortDescription: 'Aide auditive intelligente avec capteurs de mouvement pour une adaptation automatique à votre environnement.',
      fullDescription: 'L\'Oticon Intent est une aide auditive haut de gamme équipée de quatre capteurs de mouvement. Elle détecte vos gestes, vos déplacements et votre situation pour adapter automatiquement l\'amplification. La technologie BrainHearing™ d\'Oticon vous permet de profiter d\'un son naturel et clair dans tous les environnements.',
      priceRange: '2500€ - 3500€',
      imagePosition: 'center center',
      isVisible: true,
      isFeatured: true,
      order: 1,
      hearingLossCategoryId: categoryMoyenne.id,
      deviceTypeId: typeRic.id,
      features: JSON.stringify({
        bluetooth: true,
        rechargeable: true,
        waterproof: 'IP68',
        capteursMouvement: true,
        connectiviteTV: true,
        autonomie: '24 heures',
      }),
      pros: JSON.stringify([
        'Adaptation automatique à chaque situation',
        'Capteurs de mouvement intégrés',
        'Son clair et naturel dans le bruit',
        'Connectivité Bluetooth complète',
        'Batterie rechargeable longue durée',
        'Résistant à l\'eau et à la poussière (IP68)',
      ]),
      cons: JSON.stringify([
        'Tarif premium',
        'Nécessite un temps d\'adaptation aux réglages automatiques',
      ]),
    },
  });

  // Exemple de produit Bernafon
  await prisma.product.upsert({
    where: { slug: 'bernafon-alpha' },
    update: {},
    create: {
      name: 'Bernafon Alpha',
      slug: 'bernafon-alpha',
      brand: 'Bernafon',
      model: 'Alpha XT',
      shortDescription: 'Appareil auditif fiable avec un excellent rapport qualité-prix, idéal pour un usage quotidien.',
      fullDescription: 'Le Bernafon Alpha offre une qualité sonore exceptionnelle avec des fonctionnalités modernes à un prix accessible. Simple d\'utilisation, il s\'adapte à votre style de vie et vous permet de profiter pleinement de vos conversations et de vos activités quotidiennes.',
      priceRange: '1200€ - 1800€',
      imagePosition: 'center center',
      isVisible: true,
      isFeatured: false,
      order: 2,
      hearingLossCategoryId: categoryLegere.id,
      deviceTypeId: typeContour.id,
      features: JSON.stringify({
        bluetooth: true,
        rechargeable: false,
        pileType: 'P13',
        autonomiePile: '7-10 jours',
        connectiviteTV: false,
      }),
      pros: JSON.stringify([
        'Excellent rapport qualité-prix',
        'Facile à utiliser',
        'Confortable toute la journée',
        'Entretien simple',
        'Piles facilement disponibles',
      ]),
      cons: JSON.stringify([
        'Pas de batterie rechargeable',
        'Moins de fonctionnalités avancées',
      ]),
    },
  });

  console.log('✅ Database seeded!');
  console.log(`   - ${jemeppeHours.length} horaires créés pour ${centreJemeppe.name}`);
  console.log(`   - ${liegeHours.length} horaires créés pour ${centreLiege.name}`);
  console.log('   - 4 catégories de perte auditive créées');
  console.log('   - 3 types d\'appareils créés');
  console.log('   - 2 produits exemples créés');
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
