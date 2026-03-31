/**
 * Structure de contenu linéaire suivant l'ordre exact de rendu
 * Cette structure unifie tous les types de contenu (textes, images, cards, etc.)
 * dans l'ordre d'affichage sur la page
 */

export type ContentFieldType =
  | 'text'           // Texte court (input)
  | 'textarea'       // Texte long (textarea)
  | 'richtext'       // Texte riche (éditeur)
  | 'image'          // Image/placeholder
  | 'array-pills'    // Array de capsules/badges
  | 'array-ctas'     // Array de boutons CTA
  | 'array-cards'    // Array de cards
  | 'badge'          // Badge simple
  | 'reference';     // Référence à un autre contenu (testimonials, products, etc.)

export type ContentField = {
  key: string;                    // Clé unique du champ
  label: string;                  // Label pour l'interface d'édition
  type: ContentFieldType;         // Type de champ
  defaultValue?: any;             // Valeur par défaut
  rows?: number;                  // Nombre de lignes (pour textarea)
  placeholder?: string;           // Placeholder
  helpText?: string;              // Texte d'aide
  config?: any;                   // Configuration supplémentaire selon le type
};

export type PageContentStructure = {
  pageKey: string;
  pageLabel: string;
  fields: ContentField[];
};

/**
 * Structure de contenu pour la page d'accueil
 * Suit l'ordre exact de rendu de src/app/page.tsx
 */
export const homePageStructure: PageContentStructure = {
  pageKey: 'home',
  pageLabel: '🏠 Accueil',
  fields: [
    // ===== HERO SECTION =====
    {
      key: 'topBadge',
      label: '1. Top Badge',
      type: 'text',
      defaultValue: 'Centre auditif indépendant • Province de Liège',
      helpText: 'Badge affiché en haut de la section héro'
    },
    {
      key: 'heroTitle',
      label: '2. Hero Title (H1)',
      type: 'text',
      defaultValue: 'Mieux entendre, simplement.',
      helpText: 'Titre principal de la page'
    },
    {
      key: 'heroDescription',
      label: '3. Hero Description',
      type: 'textarea',
      rows: 4,
      defaultValue: 'Chez Audire, on commence par comprendre votre quotidien et vos difficultés. Puis on vous propose une suite claire et sans pression. Test auditif gratuit, explications pédagogiques, réglages et suivi dans la durée.',
      helpText: 'Description principale sous le titre'
    },
    {
      key: 'heroPills',
      label: '4. Hero Pills/Capsules',
      type: 'array-pills',
      defaultValue: [
        'Test gratuit et sans engagement',
        'Explications claires, sans jargon',
        'Oticon & Bernafon',
        'Suivi personnalisé'
      ],
      helpText: 'Les 4 capsules affichées sous la description',
      config: { maxItems: 6 }
    },
    {
      key: 'heroCtas',
      label: '5. Hero CTAs (Boutons)',
      type: 'array-ctas',
      defaultValue: [
        { text: '📅 Prendre rendez-vous', href: '/prendre-rendez-vous', style: 'primary' },
        { text: '📞 Nous contacter', href: '/contact', style: 'secondary' }
      ],
      helpText: 'Boutons d\'action sous les capsules',
      config: { maxItems: 3 }
    },
    {
      key: 'heroFooterText',
      label: '6. Hero Footer Text',
      type: 'text',
      defaultValue: 'Vous hésitez ? Venez juste faire le point. Parfois la meilleure réponse est "pas maintenant" — et on vous le dira.',
      helpText: 'Texte sous les boutons'
    },
    {
      key: 'heroImagePlaceholder',
      label: '7. Hero Image',
      type: 'image',
      defaultValue: null,
      helpText: 'Image affichée dans la section héro (géré via ImageEffects)'
    },

    // ===== FEATURES SECTION =====
    {
      key: 'approachBadge',
      label: '8. Approach Badge',
      type: 'badge',
      defaultValue: 'Notre approche',
      helpText: 'Badge au-dessus du titre de la section'
    },
    {
      key: 'approachTitle',
      label: '9. Approach Title',
      type: 'text',
      defaultValue: 'Pourquoi choisir Audire ?',
      helpText: 'Titre de la section features'
    },
    {
      key: 'approachDescription',
      label: '10. Approach Description',
      type: 'textarea',
      rows: 3,
      defaultValue: 'Parce que bien entendre, ce n\'est pas qu\'une question d\'appareil. C\'est une question d\'accompagnement, d\'écoute et de suivi dans la durée.',
      helpText: 'Description de la section features'
    },
    {
      key: 'featureCards',
      label: '11. Feature Cards',
      type: 'reference',
      defaultValue: null,
      helpText: 'Les 6 cards de features (géré via l\'API card-images)',
      config: { referenceType: 'card-images', pageKey: 'home' }
    },
    {
      key: 'featureImagePlaceholder',
      label: '12. Image après Features',
      type: 'image',
      defaultValue: null,
      helpText: 'Image entre la section features et les avis'
    },

    // ===== TESTIMONIALS SECTION =====
    {
      key: 'testimonialsTitle',
      label: '13. Testimonials Title',
      type: 'text',
      defaultValue: 'Ils nous font confiance',
      helpText: 'Titre de la section avis'
    },
    {
      key: 'testimonialsDescription',
      label: '14. Testimonials Description',
      type: 'text',
      defaultValue: 'Découvrez les avis de nos clients',
      helpText: 'Description de la section avis'
    },
    {
      key: 'testimonials',
      label: '15. Testimonials',
      type: 'reference',
      defaultValue: null,
      helpText: 'Les avis clients (géré via l\'API testimonials)',
      config: { referenceType: 'testimonials' }
    },
    {
      key: 'testimonialsImagePlaceholder',
      label: '16. Image après Testimonials',
      type: 'image',
      defaultValue: null,
      helpText: 'Image entre les avis et la section produits'
    },

    // ===== FEATURED PRODUCTS SECTION =====
    {
      key: 'productsBadge',
      label: '17. Products Badge',
      type: 'badge',
      defaultValue: 'Nos solutions',
      helpText: 'Badge au-dessus du titre de la section produits'
    },
    {
      key: 'productsTitle',
      label: '18. Products Title',
      type: 'text',
      defaultValue: 'Appareils auditifs mis en avant',
      helpText: 'Titre de la section produits'
    },
    {
      key: 'productsDescription',
      label: '19. Products Description',
      type: 'textarea',
      rows: 2,
      defaultValue: 'Découvrez nos appareils auditifs recommandés pour une meilleure audition',
      helpText: 'Description de la section produits'
    },
    {
      key: 'featuredProducts',
      label: '20. Featured Products',
      type: 'reference',
      defaultValue: null,
      helpText: 'Les produits mis en avant (géré via l\'API hearing-aids/featured)',
      config: { referenceType: 'hearing-aids-featured' }
    },
    {
      key: 'productsLinkText',
      label: '21. Products Link Text',
      type: 'text',
      defaultValue: 'Voir toutes nos solutions auditives',
      helpText: 'Texte du lien vers toutes les solutions'
    },

    // ===== CTA SECTION =====
    {
      key: 'ctaBadge',
      label: '22. CTA Badge (optionnel)',
      type: 'badge',
      defaultValue: '',
      helpText: 'Badge au-dessus du titre CTA (optionnel)'
    },
    {
      key: 'ctaTitle',
      label: '23. CTA Title',
      type: 'text',
      defaultValue: 'Prêt à mieux entendre ?',
      helpText: 'Titre de la section CTA finale'
    },
    {
      key: 'ctaDescription',
      label: '24. CTA Description',
      type: 'textarea',
      rows: 2,
      defaultValue: 'Prenez rendez-vous pour un test auditif gratuit et sans engagement.',
      helpText: 'Description de la section CTA'
    },
    {
      key: 'ctaButtonText',
      label: '25. CTA Button Text',
      type: 'text',
      defaultValue: '📅 Réserver maintenant',
      helpText: 'Texte du bouton CTA'
    },
    {
      key: 'ctaFooterText',
      label: '26. CTA Footer Text',
      type: 'text',
      defaultValue: 'Test gratuit • Sans engagement • Conseils personnalisés',
      helpText: 'Texte sous le bouton CTA'
    },
  ]
};

/**
 * Structure de contenu pour Solutions Auditives
 */
export const solutionsPageStructure: PageContentStructure = {
  pageKey: 'solutions-auditives',
  pageLabel: '🎧 Solutions Auditives',
  fields: [
    { key: 'heroTitle', label: '1. Hero Title (H1)', type: 'text', defaultValue: 'Solutions auditives' },
    { key: 'heroDescription', label: '2. Hero Description', type: 'textarea', rows: 4, defaultValue: 'Chez Audire, nous proposons des solutions Oticon et Bernafon, deux marques reconnues pour leur qualité et leur innovation. Nos appareils sont discrets, performants et adaptés à votre quotidien.' },
    { key: 'brandsBadge', label: '3. Brands Badge', type: 'badge', defaultValue: 'Nos marques' },
    { key: 'brandsTitle', label: '4. Brands Title', type: 'text', defaultValue: 'Oticon & Bernafon' },
    { key: 'brandsDescription', label: '5. Brands Description', type: 'textarea', rows: 3, defaultValue: 'Deux marques de référence, reconnues dans le monde entier pour leur innovation et leur qualité.' },
    { key: 'brandsImage', label: '6. Brands Image', type: 'image', defaultValue: null },
    { key: 'typesBadge', label: '7. Types Badge', type: 'badge', defaultValue: 'Types d\'appareils' },
    { key: 'typesTitle', label: '8. Types Title', type: 'text', defaultValue: 'Nos solutions' },
    { key: 'typesDescription', label: '9. Types Description', type: 'textarea', rows: 3, defaultValue: 'Cliquez sur une carte pour découvrir tous les détails de chaque solution auditive.' },
    { key: 'solutionCards', label: '10. Solution Cards', type: 'reference', defaultValue: null, helpText: 'Les cards de solutions (géré via l\'API solutions)', config: { referenceType: 'solutions' } },
    { key: 'ctaBadge', label: '11. CTA Badge', type: 'badge', defaultValue: 'Besoin d\'aide ?' },
    { key: 'ctaTitle', label: '12. CTA Title', type: 'text', defaultValue: 'Trouvez votre solution' },
    { key: 'ctaDescription', label: '13. CTA Description', type: 'textarea', rows: 3, defaultValue: 'Chaque personne est unique. Nous prenons le temps de comprendre vos besoins pour vous proposer la solution la plus adaptée.' },
  ]
};

/**
 * Structure de contenu pour Remboursements
 */
export const remboursementsPageStructure: PageContentStructure = {
  pageKey: 'remboursements',
  pageLabel: '💰 Remboursements',
  fields: [
    { key: 'heroTitle', label: '1. Hero Title (H1)', type: 'text', defaultValue: 'Remboursements' },
    { key: 'heroDescription', label: '2. Hero Description', type: 'textarea', rows: 4, defaultValue: 'Chez Audire, nous vous accompagnons dans toutes les démarches administratives. Vous comprenez exactement ce que vous allez payer, sans surprise.' },
    { key: 'howBadge', label: '3. How Badge', type: 'badge', defaultValue: 'Le système' },
    { key: 'howTitle', label: '4. How Title', type: 'text', defaultValue: 'Comment ça marche ?' },
    { key: 'howDescription', label: '5. How Description', type: 'textarea', rows: 3, defaultValue: 'Le système de remboursement belge est parfois complexe. Nous vous expliquons tout, étape par étape.' },
    { key: 'inamiBadge', label: '6. INAMI Badge', type: 'badge', defaultValue: 'INAMI' },
    { key: 'inamiTitle', label: '7. INAMI Title', type: 'text', defaultValue: 'Interventions INAMI' },
    { key: 'inamiDescription', label: '8. INAMI Description', type: 'textarea', rows: 3, defaultValue: 'L\'INAMI intervient différemment selon votre âge et votre situation.' },
    { key: 'ctaBadge', label: '9. CTA Badge', type: 'badge', defaultValue: 'Besoin d\'aide ?' },
    { key: 'ctaTitle', label: '10. CTA Title', type: 'text', defaultValue: 'Une question sur les remboursements ?' },
    { key: 'ctaDescription', label: '11. CTA Description', type: 'textarea', rows: 3, defaultValue: 'Nous sommes là pour vous aider. Prenez rendez-vous et nous vous expliquerons tout en détail.' },
  ]
};

/**
 * Structure de contenu pour Notre Accompagnement
 */
export const accompagnementPageStructure: PageContentStructure = {
  pageKey: 'notre-accompagnement',
  pageLabel: '🤝 Notre Accompagnement',
  fields: [
    { key: 'heroTitle', label: '1. Hero Title (H1)', type: 'text', defaultValue: 'Notre accompagnement' },
    { key: 'heroDescription', label: '2. Hero Description', type: 'textarea', rows: 4, defaultValue: 'Chez Audire, vous n\'êtes pas un numéro. Nous prenons le temps de comprendre votre quotidien, vos difficultés et vos attentes pour vous proposer un accompagnement vraiment personnalisé.' },
    { key: 'processBadge', label: '3. Process Badge', type: 'badge', defaultValue: 'Le processus' },
    { key: 'processTitle', label: '4. Process Title', type: 'text', defaultValue: 'Comment ça se passe ?' },
    { key: 'processDescription', label: '5. Process Description', type: 'textarea', rows: 3, defaultValue: 'Un accompagnement en plusieurs étapes, à votre rythme et sans pression.' },
    { key: 'differenceBadge', label: '6. Difference Badge', type: 'badge', defaultValue: 'Nos atouts' },
    { key: 'differenceTitle', label: '7. Difference Title', type: 'text', defaultValue: 'Ce qui nous différencie' },
    { key: 'differenceDescription', label: '8. Difference Description', type: 'textarea', rows: 3, defaultValue: 'Pourquoi nos clients nous recommandent à leurs proches ?' },
    { key: 'ctaBadge', label: '9. CTA Badge', type: 'badge', defaultValue: 'C\'est parti !' },
    { key: 'ctaTitle', label: '10. CTA Title', type: 'text', defaultValue: 'Prêt à commencer ?' },
    { key: 'ctaDescription', label: '11. CTA Description', type: 'textarea', rows: 3, defaultValue: 'Prenez rendez-vous pour un test auditif gratuit et sans engagement.' },
  ]
};

/**
 * Structure de contenu pour Test Auditif Gratuit
 */
export const testAuditifPageStructure: PageContentStructure = {
  pageKey: 'test-auditif-gratuit',
  pageLabel: '👂 Test Auditif Gratuit',
  fields: [
    { key: 'heroTitle', label: '1. Hero Title (H1)', type: 'text', defaultValue: 'Test auditif gratuit' },
    { key: 'heroDescription', label: '2. Hero Description', type: 'textarea', rows: 3, defaultValue: 'Un test complet de 30 minutes pour comprendre votre audition. Gratuit, sans engagement, et expliqué avec des mots simples.' },
    { key: 'whyBadge', label: '3. Why Badge', type: 'badge', defaultValue: 'Pourquoi ?' },
    { key: 'whyTitle', label: '4. Why Title', type: 'text', defaultValue: 'Pourquoi faire un test auditif ?' },
    { key: 'whyDescription', label: '5. Why Description', type: 'textarea', rows: 3, defaultValue: 'La perte auditive est progressive et souvent difficile à détecter soi-même.' },
    { key: 'howBadge', label: '6. How Badge', type: 'badge', defaultValue: 'Le déroulement' },
    { key: 'howTitle', label: '7. How Title', type: 'text', defaultValue: 'Comment se déroule le test ?' },
    { key: 'howDescription', label: '8. How Description', type: 'textarea', rows: 3, defaultValue: 'Un test simple, indolore et complet en 30 minutes.' },
    { key: 'bookBadge', label: '9. Book Badge', type: 'badge', defaultValue: 'Réservez' },
    { key: 'bookTitle', label: '10. Book Title', type: 'text', defaultValue: 'Réservez votre test gratuit' },
    { key: 'bookDescription', label: '11. Book Description', type: 'textarea', rows: 3, defaultValue: 'Remplissez le formulaire ci-dessous et nous vous recontactons rapidement pour fixer un rendez-vous.' },
    { key: 'contactBadge', label: '12. Contact Badge', type: 'badge', defaultValue: 'Contact' },
    { key: 'contactTitle', label: '13. Contact Title', type: 'text', defaultValue: 'Ou contactez-nous directement' },
    { key: 'contactDescription', label: '14. Contact Description', type: 'textarea', rows: 3, defaultValue: 'Vous préférez nous appeler ? Nous sommes là pour vous.' },
  ]
};

/**
 * Structure de contenu pour Contact
 */
export const contactPageStructure: PageContentStructure = {
  pageKey: 'contact',
  pageLabel: '📍 Contact',
  fields: [
    { key: 'heroTitle', label: '1. Hero Title (H1)', type: 'text', defaultValue: 'Contact' },
    { key: 'heroDescription', label: '2. Hero Description', type: 'textarea', rows: 3, defaultValue: 'Une question ? Envie de prendre rendez-vous ? Nous sommes là pour vous accompagner.' },
    { key: 'hoursBadge', label: '3. Hours Badge', type: 'badge', defaultValue: 'Horaires' },
    { key: 'hoursTitle', label: '4. Hours Title', type: 'text', defaultValue: 'Horaires d\'ouverture' },
    { key: 'hoursDescription', label: '5. Hours Description', type: 'textarea', rows: 3, defaultValue: 'Nous sommes ouverts du lundi au vendredi. Le samedi sur rendez-vous uniquement.' },
    { key: 'formBadge', label: '6. Form Badge', type: 'badge', defaultValue: 'Message' },
    { key: 'formTitle', label: '7. Form Title', type: 'text', defaultValue: 'Envoyez-nous un message' },
    { key: 'formDescription', label: '8. Form Description', type: 'textarea', rows: 3, defaultValue: 'Vous avez une question ? Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.' },
  ]
};

/**
 * Structure de contenu pour FAQ
 */
export const faqPageStructure: PageContentStructure = {
  pageKey: 'faq',
  pageLabel: '❓ FAQ',
  fields: [
    { key: 'heroTitle', label: '1. Hero Title (H1)', type: 'text', defaultValue: 'Questions fréquentes' },
    { key: 'heroDescription', label: '2. Hero Description', type: 'textarea', rows: 4, defaultValue: 'Vous vous posez des questions sur les appareils auditifs, les remboursements ou notre accompagnement ? Vous trouverez ici les réponses aux questions les plus fréquentes.' },
    { key: 'faqList', label: '3. FAQ List', type: 'reference', defaultValue: null, helpText: 'Les questions/réponses (géré via l\'API faqs)', config: { referenceType: 'faqs' } },
    { key: 'ctaBadge', label: '4. CTA Badge', type: 'badge', defaultValue: 'Besoin d\'aide ?' },
    { key: 'ctaTitle', label: '5. CTA Title', type: 'text', defaultValue: 'Vous ne trouvez pas votre réponse ?' },
    { key: 'ctaDescription', label: '6. CTA Description', type: 'textarea', rows: 3, defaultValue: 'Contactez-nous ! Nous sommes là pour répondre à toutes vos questions.' },
  ]
};

/**
 * Structure de contenu pour Partenaires Pharmaciens
 */
export const partenairesPageStructure: PageContentStructure = {
  pageKey: 'partenaires-pharmaciens',
  pageLabel: '💊 Partenaires Pharmaciens',
  fields: [
    { key: 'heroTitle', label: '1. Hero Title (H1)', type: 'text', defaultValue: 'Partenaires pharmaciens' },
    { key: 'heroDescription', label: '2. Hero Description', type: 'textarea', rows: 3, defaultValue: 'Vous êtes pharmacien en province de Liège ? Orientez vos patients vers un accompagnement de qualité pour leurs besoins auditifs.' },
    { key: 'whyBadge', label: '3. Why Badge', type: 'badge', defaultValue: 'Avantages' },
    { key: 'whyTitle', label: '4. Why Title', type: 'text', defaultValue: 'Pourquoi nous recommander ?' },
    { key: 'whyDescription', label: '5. Why Description', type: 'textarea', rows: 3, defaultValue: 'Un partenariat basé sur la confiance et l\'excellence du service.' },
    { key: 'howBadge', label: '6. How Badge', type: 'badge', defaultValue: 'Processus' },
    { key: 'howTitle', label: '7. How Title', type: 'text', defaultValue: 'Comment orienter vos patients ?' },
    { key: 'howDescription', label: '8. How Description', type: 'textarea', rows: 3, defaultValue: 'Un processus simple et efficace pour vos patients.' },
    { key: 'materialBadge', label: '9. Material Badge', type: 'badge', defaultValue: 'Matériel' },
    { key: 'materialTitle', label: '10. Material Title', type: 'text', defaultValue: 'Matériel de communication' },
    { key: 'materialDescription', label: '11. Material Description', type: 'textarea', rows: 3, defaultValue: 'Nous mettons à votre disposition du matériel pour informer vos patients.' },
    { key: 'ctaBadge', label: '12. CTA Badge', type: 'badge', defaultValue: 'Rejoignez-nous' },
    { key: 'ctaTitle', label: '13. CTA Title', type: 'text', defaultValue: 'Devenons partenaires' },
    { key: 'ctaDescription', label: '14. CTA Description', type: 'textarea', rows: 3, defaultValue: 'Vous souhaitez devenir partenaire ou obtenir plus d\'informations ? Contactez-nous dès maintenant.' },
  ]
};

/**
 * Fonction pour obtenir toutes les structures de pages
 */
export function getAllPageStructures(): PageContentStructure[] {
  return [
    homePageStructure,
    solutionsPageStructure,
    remboursementsPageStructure,
    accompagnementPageStructure,
    testAuditifPageStructure,
    contactPageStructure,
    faqPageStructure,
    partenairesPageStructure,
  ];
}

/**
 * Fonction pour obtenir la structure d'une page spécifique
 */
export function getPageStructure(pageKey: string): PageContentStructure | undefined {
  return getAllPageStructures().find(p => p.pageKey === pageKey);
}

/**
 * Mapping des anciennes clés vers les nouvelles (pour migration)
 */
export const keyMigrationMap: Record<string, Record<string, string>> = {
  home: {
    'hero-kicker': 'topBadge',
    'hero-title': 'heroTitle',
    'description-1': 'heroDescription',
    'chip-1': 'heroPills[0]',
    'chip-2': 'heroPills[1]',
    'chip-3': 'heroPills[2]',
    'chip-4': 'heroPills[3]',
    'section-1-title': 'approachTitle',
    'description-2': 'approachDescription',
    'section-2-title': 'ctaTitle',
    'description-3': 'ctaDescription',
  }
};
