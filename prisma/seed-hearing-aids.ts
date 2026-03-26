import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedHearingAids() {
  console.log('🌱 Seeding hearing aids...');

  // Produits Oticon
  await prisma.hearingAid.upsert({
    where: { slug: 'oticon-real' },
    update: {},
    create: {
      slug: 'oticon-real',
      name: 'Oticon Real',
      brand: 'Oticon',
      range: 'Premium',
      type: 'Contour d\'oreille',
      shortDesc: 'La technologie RealSound qui reproduit fidèlement tous les sons de votre environnement.',
      fullDesc: 'La technologie RealSound qui reproduit fidèlement tous les sons de votre environnement, même dans les situations bruyantes. Oticon Real révolutionne l\'audition en offrant un accès complet à tous les sons qui vous entourent, même dans les environnements les plus complexes.',
      mainImage: '/images/produits/oticon-real.jpg',
      features: JSON.stringify([
        'Réduction du bruit du vent',
        'Son naturel et équilibré',
        'Connectivité Bluetooth',
        'Batterie rechargeable',
      ]),
      price: '2800€ - 3500€',
      isHighlight: true,
      isVisible: true,
      order: 1,
    },
  });

  await prisma.hearingAid.upsert({
    where: { slug: 'oticon-more' },
    update: {},
    create: {
      slug: 'oticon-more',
      name: 'Oticon More',
      brand: 'Oticon',
      range: 'Premium',
      type: 'Intra-auriculaire',
      shortDesc: 'Intelligence artificielle embarquée pour un traitement du son révolutionnaire.',
      fullDesc: 'Intelligence artificielle embarquée pour un traitement du son révolutionnaire. Accès complet à tous les sons qui vous entourent grâce au Deep Neural Network qui traite plus de 12 millions de sons réels pour une expérience auditive naturelle.',
      mainImage: '/images/produits/oticon-more.jpg',
      features: JSON.stringify([
        'Deep Neural Network (IA)',
        '360° de son',
        'Connexion sans fil',
        'Discrétion maximale',
      ]),
      price: '2500€ - 3200€',
      isHighlight: false,
      isVisible: true,
      order: 2,
    },
  });

  await prisma.hearingAid.upsert({
    where: { slug: 'oticon-own' },
    update: {},
    create: {
      slug: 'oticon-own',
      name: 'Oticon Own',
      brand: 'Oticon',
      range: 'Confort',
      type: 'Intra-auriculaire sur mesure',
      shortDesc: 'Appareil invisible moulé sur mesure pour votre oreille.',
      fullDesc: 'Appareil invisible moulé sur mesure pour votre oreille. Confort et discrétion optimaux. Chaque appareil est unique, fabriqué spécifiquement pour s\'adapter parfaitement à votre conduit auditif.',
      mainImage: '/images/produits/oticon-own.jpg',
      features: JSON.stringify([
        '100% invisible',
        'Moulage personnalisé',
        'Son naturel',
        'Facile à manipuler',
      ]),
      price: '1800€ - 2400€',
      isHighlight: false,
      isVisible: true,
      order: 3,
    },
  });

  // Produits Bernafon
  await prisma.hearingAid.upsert({
    where: { slug: 'bernafon-alpha' },
    update: {},
    create: {
      slug: 'bernafon-alpha',
      name: 'Bernafon Alpha',
      brand: 'Bernafon',
      range: 'Premium',
      type: 'Contour d\'oreille',
      shortDesc: 'Performance exceptionnelle avec réduction avancée du bruit.',
      fullDesc: 'Performance exceptionnelle avec réduction avancée du bruit et clarté de parole optimale, même dans les environnements complexes. La technologie Hybrid Technology™ combine le meilleur de deux mondes pour une expérience auditive naturelle.',
      mainImage: '/images/produits/bernafon-alpha.jpg',
      features: JSON.stringify([
        'Hybrid Technology™',
        'Réduction bruit intelligente',
        'Streaming audio HD',
        'Autonomie longue durée',
      ]),
      price: '2400€ - 3000€',
      isHighlight: true,
      isVisible: true,
      order: 4,
    },
  });

  await prisma.hearingAid.upsert({
    where: { slug: 'bernafon-viron' },
    update: {},
    create: {
      slug: 'bernafon-viron',
      name: 'Bernafon Viron',
      brand: 'Bernafon',
      range: 'Confort',
      type: 'Contour d\'oreille',
      shortDesc: 'Solution fiable et performante pour un usage quotidien confortable.',
      fullDesc: 'Solution fiable et performante pour un usage quotidien confortable. Excellent rapport qualité-prix. Idéal pour ceux qui recherchent une solution auditive fiable sans compromis sur la qualité.',
      mainImage: '/images/produits/bernafon-viron.jpg',
      features: JSON.stringify([
        'Programmes automatiques',
        'Design ergonomique',
        'Facile d\'utilisation',
        'Robuste et fiable',
      ]),
      price: '1500€ - 2000€',
      isHighlight: false,
      isVisible: true,
      order: 5,
    },
  });

  await prisma.hearingAid.upsert({
    where: { slug: 'bernafon-everest' },
    update: {},
    create: {
      slug: 'bernafon-everest',
      name: 'Bernafon Everest',
      brand: 'Bernafon',
      range: 'Essentiel',
      type: 'Contour d\'oreille',
      shortDesc: 'Solution économique sans compromis sur la qualité.',
      fullDesc: 'Solution économique sans compromis sur la qualité. Idéal pour débuter avec un appareil auditif. Offre toutes les fonctionnalités essentielles pour une amélioration significative de votre audition.',
      mainImage: '/images/produits/bernafon-everest.jpg',
      features: JSON.stringify([
        'Simplicité d\'usage',
        'Son clair et confortable',
        'Pile longue durée',
        'Prix accessible',
      ]),
      price: '1200€ - 1600€',
      isHighlight: false,
      isVisible: true,
      order: 6,
    },
  });

  console.log('✅ Hearing aids seeded!');
}

seedHearingAids()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
