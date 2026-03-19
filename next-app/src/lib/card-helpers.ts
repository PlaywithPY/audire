import { prisma } from '@/lib/prisma';

export interface CardData {
  cardKey: string;
  imageSrc: string;
  title: string;
  description: string;
  imageAlt: string;
  href: string;
  imagePosition: string;
  fallbackEmoji: string;
}

// Définitions par défaut des cards (fallback si pas dans la DB)
// IMPORTANT: Les cardKey doivent correspondre à ceux définis dans /admin/feature-cards
const DEFAULT_CARDS: CardData[] = [
  {
    cardKey: 'hearing-test',
    imageSrc: '/images/hearing-test.jpg',
    title: 'Test auditif gratuit',
    description: 'Un test complet et sans engagement pour comprendre votre audition.',
    imageAlt: 'Test auditif avec casque professionnel',
    href: '/test-auditif-gratuit',
    imagePosition: 'center 35%',
    fallbackEmoji: '👂',
  },
  {
    cardKey: 'human-support',
    imageSrc: '/images/human-support.jpg',
    title: 'Accompagnement humain',
    description: 'Pas de jargon technique, pas de pression commerciale.',
    imageAlt: 'Accompagnement personnalisé et humain',
    href: '/notre-accompagnement',
    imagePosition: 'center center',
    fallbackEmoji: '💬',
  },
  {
    cardKey: 'personalized-follow-up',
    imageSrc: '/images/personalized-follow-up.jpg',
    title: 'Suivi personnalisé',
    description: 'Réglages progressifs, adaptations, suivi régulier.',
    imageAlt: 'Suivi personnalisé de votre appareil auditif',
    href: '/notre-accompagnement',
    imagePosition: 'center center',
    fallbackEmoji: '🔧',
  },
  {
    cardKey: 'quality-solutions',
    imageSrc: '/images/quality-solutions.jpg',
    title: 'Solutions de qualité',
    description: 'Oticon et Bernafon, deux marques reconnues.',
    imageAlt: 'Appareils auditifs de qualité',
    href: '/solutions-auditives',
    imagePosition: 'center center',
    fallbackEmoji: '🏆',
  },
  {
    cardKey: 'independent-center',
    imageSrc: '/images/independent-center.jpg',
    title: 'Centre indépendant',
    description: 'Pas d\'objectifs de vente, pas de réseau à satisfaire.',
    imageAlt: 'Centre auditif indépendant',
    href: '/notre-accompagnement',
    imagePosition: 'center center',
    fallbackEmoji: '🎯',
  },
  {
    cardKey: 'price-transparency',
    imageSrc: '/images/price-transparency.jpg',
    title: 'Transparence des prix',
    description: 'Prix clairs, remboursements expliqués.',
    imageAlt: 'Transparence des prix et remboursements',
    href: '/remboursements',
    imagePosition: 'center center',
    fallbackEmoji: '💰',
  },
];

/**
 * Récupère les cards depuis la DB et merge avec les valeurs par défaut
 */
export async function getFeatureCards(): Promise<CardData[]> {
  try {
    const dbCards = await prisma.cardImage.findMany({
      orderBy: { cardKey: 'asc' },
    });

    // Créer un map des cards DB par cardKey
    const dbCardMap = new Map(dbCards.map(card => [card.cardKey, card]));

    // Merger les cards par défaut avec les données DB
    return DEFAULT_CARDS.map(defaultCard => {
      const dbCard = dbCardMap.get(defaultCard.cardKey);

      if (!dbCard) {
        return defaultCard; // Utiliser les valeurs par défaut
      }

      // Merger : priorité aux valeurs DB
      return {
        cardKey: defaultCard.cardKey,
        imageSrc: dbCard.imageUrl || defaultCard.imageSrc,
        title: dbCard.title || defaultCard.title,
        description: dbCard.description || defaultCard.description,
        imageAlt: dbCard.imageAlt || defaultCard.imageAlt,
        href: dbCard.href || defaultCard.href,
        imagePosition: dbCard.imagePosition || defaultCard.imagePosition,
        fallbackEmoji: dbCard.fallbackEmoji || defaultCard.fallbackEmoji,
      };
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des cards:', error);
    // En cas d'erreur, retourner les valeurs par défaut
    return DEFAULT_CARDS;
  }
}
