import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedHearingAids() {
  console.log('🌱 Seeding hearing aids...');

  // Exemple complet avec toutes les fonctionnalités pour Oticon Real
  const oticonReal = await prisma.hearingAid.upsert({
    where: { slug: 'oticon-real' },
    update: {},
    create: {
      slug: 'oticon-real',
      name: 'Oticon Real',
      brand: 'Oticon',
      range: 'Premium',
      type: 'Contour d\'oreille',
      shortDesc: 'Son naturel et réaliste, même dans les environnements bruyants',
      price: '2800€ - 3500€',
      isHighlight: true,
      isVisible: true,
      order: 1,

      // Hero Section
      heroGradientFrom: '#42a4ff',
      heroGradientTo: '#5ab3ff',
      heroImage: '/images/produits/oticon-real-hero.jpg',
      heroDescription: 'Profitez d\'un son naturel et équilibré dans toutes les situations. Oticon Real vous permet de vivre pleinement chaque moment, sans effort.',

      // Avantages
      advantages: JSON.stringify([
        {
          title: 'Son naturel',
          description: 'Reproduction fidèle des sons de votre environnement',
          icon: '🎵',
        },
        {
          title: 'Réduction du bruit',
          description: 'Suppression intelligente du bruit du vent',
          icon: '🌬️',
        },
        {
          title: 'Bluetooth',
          description: 'Connexion sans fil à tous vos appareils',
          icon: '📱',
        },
        {
          title: 'Rechargeable',
          description: 'Batterie longue durée avec chargeur pratique',
          icon: '🔋',
        },
      ]),

      // Section 1
      section1Title: 'Une technologie révolutionnaire',
      section1Description: 'Oticon Real utilise la technologie RealSound qui reproduit fidèlement tous les sons de votre environnement, même dans les situations bruyantes.\n\nGrâce à un traitement du son avancé, vous bénéficiez d\'une expérience auditive naturelle et confortable tout au long de la journée.',
      section1MediaUrl: '/images/produits/oticon-real-technology.jpg',
      section1MediaType: 'image',

      // Section 2
      section2Title: 'Design discret et confortable',
      section2Description: 'L\'Oticon Real se fait oublier tout en restant performant. Son design ergonomique s\'adapte parfaitement à votre oreille pour un confort optimal.\n\nDisponible en plusieurs couleurs pour s\'accorder à votre carnation.',
      section2Image: '/images/produits/oticon-real-design.jpg',

      // Highlight Box 1
      highlightBox1Title: 'Un son naturel pour un confort optimal',
      highlightBox1Description: 'Redécouvrez les plaisirs de la vie avec une audition claire et naturelle.',
      highlightBox1Image: '/images/produits/oticon-real-comfort.jpg',

      // Section 3
      section3Title: 'Connectivité universelle',
      section3Description: 'Connectez-vous facilement à votre smartphone, tablette ou télévision grâce à la technologie Bluetooth intégrée.\n\nStreaming audio en haute définition pour des appels clairs et une écoute musicale de qualité.',
      section3Image: '/images/produits/oticon-real-bluetooth.jpg',

      // Section 4
      section4Title: 'Autonomie longue durée',
      section4Description: 'Plus besoin de changer les piles ! L\'Oticon Real est équipé d\'une batterie rechargeable qui vous offre une journée complète d\'utilisation.\n\nLe chargeur compact se glisse facilement dans votre poche pour une recharge rapide où que vous soyez.',
      section4MediaUrl: '/images/produits/oticon-real-charger.mp4',
      section4MediaType: 'video',

      // Highlight Box 2
      highlightBox2Title: 'Disponible en plusieurs modèles',
      highlightBox2Images: JSON.stringify([
        '/images/produits/oticon-real-color1.jpg',
        '/images/produits/oticon-real-color2.jpg',
        '/images/produits/oticon-real-color3.jpg',
        '/images/produits/oticon-real-color4.jpg',
      ]),

      // FAQ spécifiques au produit
      productFAQs: JSON.stringify([
        {
          question: 'Quelle est l\'autonomie de la batterie ?',
          answer: 'L\'Oticon Real offre une autonomie de 24 heures avec une seule charge. Le chargement complet prend environ 3 heures.',
        },
        {
          question: 'Est-ce que l\'Oticon Real est résistant à l\'eau ?',
          answer: 'Oui, l\'Oticon Real est résistant à l\'eau et à la poussière (IP68). Vous pouvez le porter sous la pluie ou lors d\'activités sportives.',
        },
        {
          question: 'Puis-je le connecter à mon iPhone et Android ?',
          answer: 'Oui, l\'Oticon Real est compatible avec iOS et Android. Vous pouvez contrôler vos appareils via l\'application Oticon Companion.',
        },
      ]),
    },
  });

  console.log('✓ Oticon Real créé');

  // Créer des blocs de contenu flexibles pour Oticon Real (exemple)
  await prisma.productContentBlock.create({
    data: {
      hearingAidId: oticonReal.id,
      order: 1,
      isVisible: true,
      title: 'Adaptation personnalisée',
      description: 'Nos audioprothésistes prennent le temps de régler précisément votre Oticon Real selon votre profil auditif unique.\n\nVous bénéficiez de plusieurs rendez-vous de suivi gratuits pour optimiser votre confort.',
      mediaUrl: '/images/produits/oticon-real-fitting.jpg',
      mediaType: 'image',
      mediaPosition: 'left',
      backgroundColor: '#f9fafb',
    },
  });

  console.log('✓ Blocs de contenu flexibles créés pour Oticon Real');

  // Produits plus simples (sans toutes les sections)
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
      price: '2500€ - 3200€',
      isHighlight: false,
      isVisible: true,
      order: 2,
      heroGradientFrom: '#42a4ff',
      heroGradientTo: '#5ab3ff',
      heroDescription: 'Accès complet à tous les sons qui vous entourent grâce à l\'intelligence artificielle.',
      advantages: JSON.stringify([
        { title: 'Deep Neural Network', description: 'IA embarquée', icon: '🧠' },
        { title: '360° de son', description: 'Tous les sons autour de vous', icon: '🔊' },
        { title: 'Connexion sans fil', description: 'Bluetooth intégré', icon: '📡' },
        { title: 'Discrétion maximale', description: 'Design invisible', icon: '👁️' },
      ]),
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
      price: '1800€ - 2400€',
      isHighlight: false,
      isVisible: true,
      order: 3,
      heroGradientFrom: '#42a4ff',
      heroGradientTo: '#5ab3ff',
      heroDescription: 'Confort et discrétion optimaux avec un moulage personnalisé.',
    },
  });

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
      price: '2400€ - 3000€',
      isHighlight: true,
      isVisible: true,
      order: 4,
      heroGradientFrom: '#1e40af',
      heroGradientTo: '#3b82f6',
      heroDescription: 'Clarté de parole optimale, même dans les environnements complexes.',
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
      price: '1500€ - 2000€',
      isHighlight: false,
      isVisible: true,
      order: 5,
      heroGradientFrom: '#1e40af',
      heroGradientTo: '#3b82f6',
      heroDescription: 'Excellent rapport qualité-prix pour une audition améliorée.',
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
      price: '1200€ - 1600€',
      isHighlight: false,
      isVisible: true,
      order: 6,
      heroGradientFrom: '#1e40af',
      heroGradientTo: '#3b82f6',
      heroDescription: 'Idéal pour débuter avec un appareil auditif performant.',
    },
  });

  console.log('✅ Hearing aids seeded! 6 produits créés.');
}

seedHearingAids()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
