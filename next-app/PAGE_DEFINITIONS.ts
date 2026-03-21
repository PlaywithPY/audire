type PageDefinition = {
  pageKey: string;
  pageLabel: string;
  texts: {
    textKey: string;
    label: string;
    defaultContent: string;
    type?: 'text' | 'textarea';
    rows?: number;
  }[];
};

const pageDefinitions: PageDefinition[] = [
  {
    pageKey: 'home',
    pageLabel: '🏠 Home',
    texts: [
      { textKey: 'hero-title', label: 'Titre principal (H1)', defaultContent: `Mieux entendre, simplement.`, type: 'text' },
      { textKey: 'section-1-title', label: 'Titre section 1', defaultContent: `Pourquoi choisir Audire ?`, type: 'text' },
      { textKey: 'section-2-title', label: 'Titre section 2', defaultContent: `Prêt à mieux entendre ?`, type: 'text' },
      { textKey: 'description-1', label: 'Description 1', defaultContent: `Chez Audire, on commence par comprendre votre quotidien et vos difficultés.
              Puis on vous propose une suite claire et sans pression. Test auditif gratuit, explications pédagogiques,
              réglages et suivi dans la durée.`, type: 'textarea', rows: 5 },
      { textKey: 'description-2', label: 'Description 2', defaultContent: `Parce que bien entendre, ce n'est pas qu'une question d'appareil.
              C'est une question d'accompagnement, d'écoute et de suivi dans la durée.`, type: 'textarea', rows: 5 },
      { textKey: 'description-3', label: 'Description 3', defaultContent: `Prenez rendez-vous pour un test auditif gratuit et sans engagement.`, type: 'textarea', rows: 3 },
      { textKey: 'hero-kicker', label: 'Badge/Kicker', defaultContent: `Centre auditif indépendant • Province de Liège`, type: 'text' },
    ]
  },
  {
    pageKey: 'test-auditif-gratuit',
    pageLabel: '👂 Test Auditif Gratuit',
    texts: [
      { textKey: 'hero-title', label: 'Titre principal (H1)', defaultContent: `Test auditif gratuit`, type: 'text' },
      { textKey: 'section-1-title', label: 'Titre section 1', defaultContent: `Pourquoi faire un test auditif ?`, type: 'text' },
      { textKey: 'section-2-title', label: 'Titre section 2', defaultContent: `Comment se déroule le test ?`, type: 'text' },
      { textKey: 'section-3-title', label: 'Titre section 3', defaultContent: `Réservez votre test gratuit`, type: 'text' },
      { textKey: 'section-4-title', label: 'Titre section 4', defaultContent: `Ou contactez-nous directement`, type: 'text' },
      { textKey: 'description-1', label: 'Description 1', defaultContent: `Un test complet de 30 minutes pour comprendre votre audition.
                Gratuit, sans engagement, et expliqué avec des mots simples.`, type: 'textarea', rows: 3 },
      { textKey: 'description-2', label: 'Description 2', defaultContent: `La perte auditive est progressive et souvent difficile à détecter soi-même.`, type: 'textarea', rows: 3 },
      { textKey: 'description-3', label: 'Description 3', defaultContent: `Un test simple, indolore et complet en 30 minutes.`, type: 'textarea', rows: 3 },
      { textKey: 'description-4', label: 'Description 4', defaultContent: `Remplissez le formulaire ci-dessous et nous vous recontactons rapidement pour fixer un rendez-vous.`, type: 'textarea', rows: 3 },
      { textKey: 'description-5', label: 'Description 5', defaultContent: `Vous préférez nous appeler ? Nous sommes là pour vous.`, type: 'textarea', rows: 3 },
    ]
  },
  {
    pageKey: 'notre-accompagnement',
    pageLabel: '🤝 Notre Accompagnement',
    texts: [
      { textKey: 'hero-title', label: 'Titre principal (H1)', defaultContent: `Notre accompagnement`, type: 'text' },
      { textKey: 'section-1-title', label: 'Titre section 1', defaultContent: `Comment ça se passe ?`, type: 'text' },
      { textKey: 'section-2-title', label: 'Titre section 2', defaultContent: `Ce qui nous différencie`, type: 'text' },
      { textKey: 'section-3-title', label: 'Titre section 3', defaultContent: `Prêt à commencer ?`, type: 'text' },
      { textKey: 'description-1', label: 'Description 1', defaultContent: `Chez Audire, vous n'êtes pas un numéro. Nous prenons le temps
                de comprendre votre quotidien, vos difficultés et vos attentes pour vous proposer
                un accompagnement vraiment personnalisé.`, type: 'textarea', rows: 5 },
      { textKey: 'description-2', label: 'Description 2', defaultContent: `Un accompagnement en plusieurs étapes, à votre rythme et sans pression.`, type: 'textarea', rows: 3 },
      { textKey: 'description-3', label: 'Description 3', defaultContent: `Pourquoi nos clients nous recommandent à leurs proches ?`, type: 'textarea', rows: 3 },
      { textKey: 'description-4', label: 'Description 4', defaultContent: `Prenez rendez-vous pour un test auditif gratuit et sans engagement.`, type: 'textarea', rows: 3 },
    ]
  },
  {
    pageKey: 'solutions-auditives',
    pageLabel: '🎧 Solutions Auditives',
    texts: [
      { textKey: 'hero-title', label: 'Titre principal (H1)', defaultContent: `Solutions auditives`, type: 'text' },
      { textKey: 'section-1-title', label: 'Titre section 1', defaultContent: `Oticon & Bernafon`, type: 'text' },
      { textKey: 'section-2-title', label: 'Titre section 2', defaultContent: `Types d'appareils`, type: 'text' },
      { textKey: 'section-3-title', label: 'Titre section 3', defaultContent: `Trouvez votre solution`, type: 'text' },
      { textKey: 'description-1', label: 'Description 1', defaultContent: `Chez Audire, nous proposons des solutions Oticon et Bernafon,
                deux marques reconnues pour leur qualité et leur innovation. Nos appareils
                sont discrets, performants et adaptés à votre quotidien.`, type: 'textarea', rows: 5 },
      { textKey: 'description-2', label: 'Description 2', defaultContent: `Deux marques de référence, reconnues dans le monde entier pour leur innovation et leur qualité.`, type: 'textarea', rows: 3 },
      { textKey: 'description-3', label: 'Description 3', defaultContent: `Cliquez sur une carte pour découvrir tous les détails de chaque solution auditive.`, type: 'textarea', rows: 3 },
      { textKey: 'description-4', label: 'Description 4', defaultContent: `Chaque personne est unique. Nous prenons le temps de comprendre vos besoins
              pour vous proposer la solution la plus adaptée.`, type: 'textarea', rows: 3 },
    ]
  },
  {
    pageKey: 'remboursements',
    pageLabel: '💰 Remboursements',
    texts: [
      { textKey: 'hero-title', label: 'Titre principal (H1)', defaultContent: `Remboursements`, type: 'text' },
      { textKey: 'section-1-title', label: 'Titre section 1', defaultContent: `Comment ça marche ?`, type: 'text' },
      { textKey: 'section-2-title', label: 'Titre section 2', defaultContent: `Interventions INAMI`, type: 'text' },
      { textKey: 'section-3-title', label: 'Titre section 3', defaultContent: `Une question sur les remboursements ?`, type: 'text' },
      { textKey: 'description-1', label: 'Description 1', defaultContent: `Chez Audire, nous vous accompagnons dans toutes les démarches administratives.
                Vous comprenez exactement ce que vous allez payer, sans surprise.`, type: 'textarea', rows: 5 },
      { textKey: 'description-2', label: 'Description 2', defaultContent: `Le système de remboursement belge est parfois complexe. Nous vous expliquons tout, étape par étape.`, type: 'textarea', rows: 3 },
      { textKey: 'description-3', label: 'Description 3', defaultContent: `L'INAMI intervient différemment selon votre âge et votre situation.`, type: 'textarea', rows: 3 },
      { textKey: 'description-4', label: 'Description 4', defaultContent: `Nous sommes là pour vous aider. Prenez rendez-vous et nous vous expliquerons tout en détail.`, type: 'textarea', rows: 3 },
    ]
  },
  {
    pageKey: 'faq',
    pageLabel: '❓ Faq',
    texts: [
      { textKey: 'hero-title', label: 'Titre principal (H1)', defaultContent: `Questions fréquentes`, type: 'text' },
      { textKey: 'section-1-title', label: 'Titre section 1', defaultContent: `Vous ne trouvez pas votre réponse ?`, type: 'text' },
      { textKey: 'description-1', label: 'Description 1', defaultContent: `Vous vous posez des questions sur les appareils auditifs, les remboursements ou notre accompagnement ?
                Vous trouverez ici les réponses aux questions les plus fréquentes.`, type: 'textarea', rows: 5 },
      { textKey: 'description-2', label: 'Description 2', defaultContent: `Contactez-nous ! Nous sommes là pour répondre à toutes vos questions.`, type: 'textarea', rows: 3 },
    ]
  },
  {
    pageKey: 'contact',
    pageLabel: '📍 Contact',
    texts: [
      { textKey: 'hero-title', label: 'Titre principal (H1)', defaultContent: `Contact`, type: 'text' },
      { textKey: 'section-1-title', label: 'Titre section 1', defaultContent: `Horaires d'ouverture`, type: 'text' },
      { textKey: 'section-2-title', label: 'Titre section 2', defaultContent: `Envoyez-nous un message`, type: 'text' },
      { textKey: 'description-1', label: 'Description 1', defaultContent: `Une question ? Envie de prendre rendez-vous ? Nous sommes là pour vous accompagner.`, type: 'textarea', rows: 3 },
      { textKey: 'description-2', label: 'Description 2', defaultContent: `Nous sommes ouverts du lundi au vendredi. Le samedi sur rendez-vous uniquement.`, type: 'textarea', rows: 3 },
      { textKey: 'description-3', label: 'Description 3', defaultContent: `Vous avez une question ? Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.`, type: 'textarea', rows: 3 },
    ]
  },
  {
    pageKey: 'partenaires-pharmaciens',
    pageLabel: '💊 Partenaires Pharmaciens',
    texts: [
      { textKey: 'hero-title', label: 'Titre principal (H1)', defaultContent: `Partenaires pharmaciens`, type: 'text' },
      { textKey: 'section-1-title', label: 'Titre section 1', defaultContent: `Pourquoi nous recommander ?`, type: 'text' },
      { textKey: 'section-2-title', label: 'Titre section 2', defaultContent: `Comment orienter vos patients ?`, type: 'text' },
      { textKey: 'section-3-title', label: 'Titre section 3', defaultContent: `Matériel de communication`, type: 'text' },
      { textKey: 'section-4-title', label: 'Titre section 4', defaultContent: `Devenons partenaires`, type: 'text' },
      { textKey: 'description-1', label: 'Description 1', defaultContent: `Vous êtes pharmacien en province de Liège ? Orientez vos patients vers
                 un accompagnement de qualité pour leurs besoins auditifs.`, type: 'textarea', rows: 3 },
      { textKey: 'description-2', label: 'Description 2', defaultContent: `Un partenariat basé sur la confiance et l'excellence du service.`, type: 'textarea', rows: 3 },
      { textKey: 'description-3', label: 'Description 3', defaultContent: `Un processus simple et efficace pour vos patients.`, type: 'textarea', rows: 3 },
      { textKey: 'description-4', label: 'Description 4', defaultContent: `Nous mettons à votre disposition du matériel pour informer vos patients.`, type: 'textarea', rows: 3 },
      { textKey: 'description-5', label: 'Description 5', defaultContent: `Vous souhaitez devenir partenaire ou obtenir plus d'informations ?
              Contactez-nous dès maintenant.`, type: 'textarea', rows: 3 },
    ]
  },
];

export default pageDefinitions;
