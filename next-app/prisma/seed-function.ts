import { PrismaClient } from '@prisma/client';

export async function seedDatabase(prisma: PrismaClient, logs?: string[]) {
  const log = (message: string) => {
    console.log(message);
    if (logs) logs.push(message);
  };

  log('🌱 Seeding database...');

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
  log('   ✓ Couleurs du thème créées');

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
  log('   ✓ Centre Jemeppe créé');

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
  log('   ✓ Centre Liège créé');

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
  log('   ✓ Horaires Jemeppe créés');

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
  log('   ✓ Horaires Liège créés');

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
  log('   ✓ Témoignages créés');

  // ==========================================
  // FAQ - QUESTIONS FRÉQUENTES
  // ==========================================

  await prisma.fAQ.upsert({
    where: { id: 1 },
    update: {},
    create: {
      question: 'Comment savoir si j\'ai besoin d\'un appareil auditif ?',
      answer: 'Plusieurs signes peuvent indiquer une perte auditive : difficulté à suivre les conversations dans un environnement bruyant, besoin d\'augmenter le volume de la télévision, difficulté à comprendre les conversations téléphoniques. Nous proposons un test auditif gratuit et sans engagement pour évaluer votre audition.',
      order: 1,
      isVisible: true,
      category: 'tests',
    },
  });

  await prisma.fAQ.upsert({
    where: { id: 2 },
    update: {},
    create: {
      question: 'Le test auditif est-il vraiment gratuit ?',
      answer: 'Oui, le test auditif est totalement gratuit et sans engagement. Il dure environ 30 minutes et permet d\'établir un audiogramme complet de votre audition. Nous prenons le temps d\'expliquer les résultats et de répondre à toutes vos questions.',
      order: 2,
      isVisible: true,
      category: 'tests',
    },
  });

  await prisma.fAQ.upsert({
    where: { id: 3 },
    update: {},
    create: {
      question: 'Quel est le prix d\'un appareil auditif ?',
      answer: 'Le prix varie selon le type d\'appareil et les technologies choisies. Les appareils auditifs commencent à partir de 800€ par oreille. Nous proposons des solutions adaptées à tous les budgets et vous informons sur les possibilités de remboursement par la mutuelle.',
      order: 3,
      isVisible: true,
      category: 'appareils',
    },
  });

  await prisma.fAQ.upsert({
    where: { id: 4 },
    update: {},
    create: {
      question: 'Quel est le remboursement de la mutuelle ?',
      answer: 'En Belgique, l\'INAMI (mutuelle) intervient de manière différente selon votre situation. Pour les personnes de moins de 65 ans avec une perte moyenne à sévère, l\'intervention est de maximum 833€ par oreille. À partir de 65 ans avec une perte légère à moyenne, c\'est environ 720€ par oreille. Nous vous aidons dans toutes vos démarches administratives.',
      order: 4,
      isVisible: true,
      category: 'remboursements',
    },
  });

  await prisma.fAQ.upsert({
    where: { id: 5 },
    update: {},
    create: {
      question: 'Combien de temps dure la période d\'adaptation ?',
      answer: 'La période d\'adaptation varie selon les personnes, généralement entre 2 et 3 mois. Pendant cette période, nous vous proposons plusieurs rendez-vous de réglage gratuits pour optimiser le confort et la performance de vos appareils. Votre cerveau a besoin de se réhabituer aux sons que vous n\'entendiez plus.',
      order: 5,
      isVisible: true,
      category: 'appareils',
    },
  });

  await prisma.fAQ.upsert({
    where: { id: 6 },
    update: {},
    create: {
      question: 'Puis-je essayer un appareil avant de l\'acheter ?',
      answer: 'Absolument ! Nous proposons une période d\'essai gratuite de 30 jours pour que vous puissiez tester l\'appareil dans votre vie quotidienne. C\'est la meilleure façon de vous assurer que l\'appareil répond à vos besoins et attentes.',
      order: 6,
      isVisible: true,
      category: 'appareils',
    },
  });

  await prisma.fAQ.upsert({
    where: { id: 7 },
    update: {},
    create: {
      question: 'Quelle est la durée de vie d\'un appareil auditif ?',
      answer: 'En moyenne, un appareil auditif dure entre 5 et 7 ans avec un entretien régulier. La durée de vie dépend de l\'utilisation, de l\'entretien et des conditions environnementales. Nous proposons un service d\'entretien et de nettoyage pour prolonger la durée de vie de vos appareils.',
      order: 7,
      isVisible: true,
      category: 'appareils',
    },
  });

  await prisma.fAQ.upsert({
    where: { id: 8 },
    update: {},
    create: {
      question: 'Faut-il une ordonnance médicale ?',
      answer: 'Pour bénéficier de l\'intervention de l\'INAMI (mutuelle), vous aurez besoin d\'une prescription médicale d\'un médecin ORL. Cependant, pour effectuer un test auditif chez nous, aucune ordonnance n\'est nécessaire.',
      order: 8,
      isVisible: true,
      category: 'remboursements',
    },
  });

  await prisma.fAQ.upsert({
    where: { id: 9 },
    update: {},
    create: {
      question: 'Proposez-vous un service après-vente ?',
      answer: 'Oui, notre service après-vente est compris dans votre achat. Nous assurons les réglages, l\'entretien, le nettoyage et les réparations mineures gratuitement. En cas de panne, nous disposons d\'appareils de prêt pour que vous ne soyez jamais sans appareil auditif.',
      order: 9,
      isVisible: true,
      category: 'appareils',
    },
  });

  await prisma.fAQ.upsert({
    where: { id: 10 },
    update: {},
    create: {
      question: 'Comment entretenir mon appareil auditif ?',
      answer: 'L\'entretien quotidien est simple : nettoyez l\'appareil avec un chiffon sec, vérifiez que les ouvertures ne sont pas obstruées, et stockez-le dans un endroit sec la nuit (avec un déshumidificateur si possible). Nous vous montrons tous les gestes lors de la remise de votre appareil.',
      order: 10,
      isVisible: true,
      category: 'appareils',
    },
  });

  await prisma.fAQ.upsert({
    where: { id: 11 },
    update: {},
    create: {
      question: 'Les appareils auditifs sont-ils visibles ?',
      answer: 'Aujourd\'hui, les appareils auditifs sont très discrets. Selon vos préférences et votre perte auditive, nous pouvons vous proposer des appareils intra-auriculaires (invisibles dans l\'oreille) ou des contours d\'oreille miniaturisés disponibles dans différentes couleurs pour s\'adapter à votre carnation.',
      order: 11,
      isVisible: true,
      category: 'appareils',
    },
  });

  await prisma.fAQ.upsert({
    where: { id: 12 },
    update: {},
    create: {
      question: 'Puis-je connecter mon appareil auditif à mon smartphone ?',
      answer: 'Oui, la plupart des appareils auditifs modernes sont équipés de la technologie Bluetooth et peuvent se connecter à votre smartphone, tablette ou télévision. Vous pouvez ainsi recevoir des appels, écouter de la musique ou ajuster les réglages via une application mobile.',
      order: 12,
      isVisible: true,
      category: 'appareils',
    },
  });
  log('   ✓ 12 questions FAQ ajoutées');

  log('✅ Database seeded!');
  log(`   - ${jemeppeHours.length} horaires créés pour ${centreJemeppe.name}`);
  log(`   - ${liegeHours.length} horaires créés pour ${centreLiege.name}`);
}
