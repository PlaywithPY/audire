import { CardData } from './card-helpers';

// Définition de la structure d'une page avec ses cards
export interface PageCardsDefinition {
  pageKey: string;
  pageLabel: string;
  cards: CardData[];
}

// Définitions des cards par page
export const PAGE_CARDS: PageCardsDefinition[] = [
  {
    pageKey: 'home',
    pageLabel: 'Page d\'accueil',
    cards: [
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
    ],
  },
  {
    pageKey: 'notre-accompagnement',
    pageLabel: 'Notre accompagnement',
    cards: [
      {
        cardKey: 'approach-step-contact',
        imageSrc: '/images/approach-contact.jpg',
        title: 'Premier contact',
        description: 'Vous nous appelez ou vous venez nous voir. On discute de votre situation, sans engagement.',
        imageAlt: 'Premier contact avec Audire',
        href: '#',
        imagePosition: 'center center',
        fallbackEmoji: '👋',
      },
      {
        cardKey: 'approach-step-test',
        imageSrc: '/images/approach-test.jpg',
        title: 'Test auditif gratuit',
        description: 'Un test complet de 30 minutes pour comprendre votre audition.',
        imageAlt: 'Test auditif professionnel',
        href: '#',
        imagePosition: 'center center',
        fallbackEmoji: '🎧',
      },
      {
        cardKey: 'approach-step-conseil',
        imageSrc: '/images/approach-conseil.jpg',
        title: 'Conseil personnalisé',
        description: 'On vous propose des solutions adaptées à votre situation et à votre budget.',
        imageAlt: 'Conseil personnalisé',
        href: '#',
        imagePosition: 'center center',
        fallbackEmoji: '💬',
      },
      {
        cardKey: 'approach-step-essai',
        imageSrc: '/images/approach-essai.jpg',
        title: 'Essai sans engagement',
        description: 'Vous testez les appareils dans votre quotidien.',
        imageAlt: 'Essai d\'appareil auditif',
        href: '#',
        imagePosition: 'center center',
        fallbackEmoji: '🔍',
      },
      {
        cardKey: 'approach-step-reglages',
        imageSrc: '/images/approach-reglages.jpg',
        title: 'Réglages progressifs',
        description: 'On se voit régulièrement pour affiner les réglages.',
        imageAlt: 'Réglages de l\'appareil',
        href: '#',
        imagePosition: 'center center',
        fallbackEmoji: '🔧',
      },
      {
        cardKey: 'approach-step-suivi',
        imageSrc: '/images/approach-suivi.jpg',
        title: 'Suivi dans la durée',
        description: 'Même après l\'achat, on reste là pour vous accompagner.',
        imageAlt: 'Suivi à long terme',
        href: '#',
        imagePosition: 'center center',
        fallbackEmoji: '🤝',
      },
      {
        cardKey: 'approach-independance',
        imageSrc: '/images/approach-independance.jpg',
        title: 'Indépendance',
        description: 'Centre indépendant, sans objectifs de vente imposés.',
        imageAlt: 'Centre indépendant',
        href: '#',
        imagePosition: 'center center',
        fallbackEmoji: '🎯',
      },
      {
        cardKey: 'approach-transparence',
        imageSrc: '/images/approach-transparence.jpg',
        title: 'Transparence',
        description: 'Prix clairs, remboursements expliqués, pas de frais cachés.',
        imageAlt: 'Transparence des prix',
        href: '#',
        imagePosition: 'center center',
        fallbackEmoji: '💎',
      },
      {
        cardKey: 'approach-disponibilite',
        imageSrc: '/images/approach-disponibilite.jpg',
        title: 'Disponibilité',
        description: 'Un problème ? Une question ? On est là.',
        imageAlt: 'Disponibilité et réactivité',
        href: '#',
        imagePosition: 'center center',
        fallbackEmoji: '⚡',
      },
      {
        cardKey: 'approach-proximite',
        imageSrc: '/images/approach-proximite.jpg',
        title: 'Proximité',
        description: 'On prend le temps de vous écouter et de vous accompagner vraiment.',
        imageAlt: 'Proximité et écoute',
        href: '#',
        imagePosition: 'center center',
        fallbackEmoji: '💙',
      },
    ],
  },
];

// Helper pour récupérer les cards d'une page spécifique
export function getDefaultCardsForPage(pageKey: string): CardData[] {
  const pageDef = PAGE_CARDS.find(p => p.pageKey === pageKey);
  return pageDef?.cards || [];
}

// Helper pour récupérer toutes les pages avec leurs cards
export function getAllPages(): PageCardsDefinition[] {
  return PAGE_CARDS;
}
