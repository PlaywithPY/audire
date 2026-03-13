'use client';

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";

interface SolutionData {
  id: string;
  title: string;
  icon: string;
  shortDesc: string;
  fullDesc: string;
  image: string;
  pros: string[];
  cons: string[];
}

interface SolutionCardProps {
  solution: SolutionData;
  onToggle: () => void;
  isActive: boolean;
}

function SolutionCard({ solution, onToggle, isActive }: SolutionCardProps) {
  return (
    <button
      onClick={onToggle}
      className={`bg-white rounded-2xl shadow-md p-8 text-left hover:shadow-xl transition-all duration-300 ${
        isActive ? 'ring-2 ring-primary shadow-xl' : ''
      }`}
    >
      <div className="text-5xl mb-4 inline-block animate-float">{solution.icon}</div>
      <h3 className="text-2xl font-bold mb-4">{solution.title}</h3>
      <p className="text-text-light mb-4">{solution.shortDesc}</p>
      <div className="flex items-center gap-2 text-primary font-semibold">
        <span className="transition-transform duration-300" style={{ transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          ▶
        </span>
        <span>{isActive ? 'Voir moins' : 'En savoir plus'}</span>
      </div>
    </button>
  );
}

function SolutionDetailPanel({ solution }: { solution: SolutionData | null }) {
  const isOpen = solution !== null;

  return (
    <div
      className={`grid transition-all duration-500 ease-in-out ${
        isOpen ? 'grid-rows-[1fr] opacity-100 mt-8' : 'grid-rows-[0fr] opacity-0 mt-0'
      }`}
    >
      <div className="overflow-hidden">
        {solution && (
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            {/* Image */}
            <div className="mb-8 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary-light/10 aspect-video flex items-center justify-center max-w-2xl mx-auto">
              <span className="text-9xl">{solution.image}</span>
            </div>

            {/* Description détaillée */}
            <div className="mb-8 max-w-4xl mx-auto">
              <h4 className="text-2xl font-bold mb-4 text-primary">📝 Description complète</h4>
              <p className="text-text-light leading-relaxed text-lg">{solution.fullDesc}</p>
            </div>

            {/* Tableau Avantages / Inconvénients - PLEINE LARGEUR */}
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Avantages */}
              <div className="bg-green-50 rounded-xl p-8">
                <h4 className="text-xl font-bold mb-6 text-green-700 flex items-center gap-3">
                  <span className="text-3xl">✅</span>
                  Avantages
                </h4>
                <ul className="space-y-3">
                  {solution.pros.map((pro, idx) => (
                    <li key={idx} className="text-text-light flex items-start gap-3 text-base">
                      <span className="text-green-600 mt-1 text-xl">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Inconvénients */}
              <div className="bg-orange-50 rounded-xl p-8">
                <h4 className="text-xl font-bold mb-6 text-orange-700 flex items-center gap-3">
                  <span className="text-3xl">⚠️</span>
                  Points d'attention
                </h4>
                <ul className="space-y-3">
                  {solution.cons.map((con, idx) => (
                    <li key={idx} className="text-text-light flex items-start gap-3 text-base">
                      <span className="text-orange-600 mt-1 text-xl">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SolutionsAuditives() {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const solutions: SolutionData[] = [
    {
      id: 'contours',
      title: "Le contour d'oreille",
      icon: "🎧",
      shortDesc: "Modèle polyvalent et simple d'utilisation, le contour d'oreille se porte derrière le pavillon. Un tube fin relie l'appareil à un embout dans le conduit auditif. Il convient à la grande majorité des pertes auditives.",
      fullDesc: "Grâce à son boîtier positionné derrière l'oreille, le contour d'oreille est facile à manipuler et à entretenir au quotidien. Il peut intégrer une batterie rechargeable et une connexion Bluetooth pour s'associer à votre téléphone, votre télévision ou d'autres accessoires. Disponible dans différentes teintes pour se fondre dans la couleur de vos cheveux ou de votre peau, il reste très discret malgré son placement externe.",
      image: "🎧",
      pros: [
        "Convient à presque tous les degrés de perte auditive",
        "Facile à manipuler et à entretenir",
        "Batterie rechargeable disponible",
        "Connectivité Bluetooth (TV, téléphone…)",
        "Large choix de teintes discrètes"
      ],
      cons: [
        "Visible derrière l'oreille",
        "Peut parfois gêner le port de lunettes"
      ]
    },
    {
      id: 'intra',
      title: "L'intra-auriculaire",
      icon: "👁️",
      shortDesc: "Fabriqué sur mesure à partir d'une empreinte de votre conduit auditif, l'intra-auriculaire se glisse entièrement dans l'oreille. Sa discrétion en fait le choix préféré des personnes qui souhaitent un appareil quasi invisible.",
      fullDesc: "Positionné directement dans le conduit auditif, l'intra-auriculaire capte les sons de façon naturelle grâce à sa proximité avec le tympan. Il est particulièrement adapté aux personnes qui portent des lunettes, car son placement ne génère aucune interférence avec les branches. Sa conception sur mesure garantit un ajustement précis et un confort de port élevé.",
      image: "👁️",
      pros: [
        "Discrétion maximale",
        "Moulage personnalisé pour un confort optimal",
        "Son naturel grâce à la position dans l'oreille",
        "Pas de gêne avec les lunettes ou le casque"
      ],
      cons: [
        "Non adapté aux pertes sévères à profondes",
        "Manipulation plus délicate",
        "Entretien fréquent (cérumen)"
      ]
    },
    {
      id: 'oticon',
      title: "Oticon Intent",
      icon: "⭐",
      shortDesc: "L'Oticon Intent est une aide auditive haut de gamme équipée de capteurs de mouvement. Elle analyse vos gestes et vos déplacements pour adapter l'amplification à chaque situation, sans aucune intervention de votre part.",
      fullDesc: "Doté d'une puce de traitement performante et de quatre capteurs intégrés, l'Oticon Intent détecte en temps réel ce que vous faites et s'ajuste automatiquement pour vous offrir le son le plus clair possible dans chaque contexte. Sa connectivité Bluetooth vous permet de le coupler à votre smartphone ou à votre télévision. La batterie rechargeable tient toute la journée, et son boîtier est certifié résistant à l'eau et à la poussière (IP68).",
      image: "🚀",
      pros: [
        "Adaptation automatique à chaque situation",
        "Capteurs de mouvement intégrés",
        "Son clair et naturel dans le bruit",
        "Connectivité Bluetooth complète",
        "Batterie rechargeable longue durée",
        "Résistant à l'eau et à la poussière (IP68)"
      ],
      cons: [
        "Tarif haut de gamme",
        "Nécessite un temps d'adaptation"
      ]
    }
  ];

  const handleToggle = (id: string) => {
    setActiveTab(activeTab === id ? null : id);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                Nos solutions
              </span>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Solutions auditives
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                Chez Audire, nous proposons des solutions <strong>Oticon et Bernafon</strong>,
                deux marques reconnues pour leur qualité et leur innovation. Nos appareils
                sont discrets, performants et adaptés à votre quotidien.
              </p>
            </div>
          </div>
        </section>

        {/* Marques */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block bg-secondary text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
                Nos partenaires
              </span>
              <h2 className="text-4xl font-bold mb-4">Oticon & Bernafon</h2>
              <p className="text-xl text-text-light max-w-3xl mx-auto">
                Deux marques de référence, reconnues dans le monde entier pour leur innovation et leur qualité.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-bg p-8 rounded-2xl">
                <h3 className="text-2xl font-bold mb-4 text-primary">🔵 Oticon</h3>
                <p className="text-text-light mb-4">
                  Oticon est une marque danoise reconnue pour son innovation technologique.
                  Leurs appareils sont conçus pour vous aider à entendre de manière naturelle,
                  même dans les environnements bruyants.
                </p>
                <ul className="space-y-2 text-text-light">
                  <li>✅ Technologie BrainHearing™</li>
                  <li>✅ Connexion Bluetooth</li>
                  <li>✅ Design discret</li>
                  <li>✅ Batterie rechargeable</li>
                </ul>
              </div>

              <div className="bg-bg p-8 rounded-2xl">
                <h3 className="text-2xl font-bold mb-4 text-primary">🟢 Bernafon</h3>
                <p className="text-text-light mb-4">
                  Bernafon propose des solutions auditives fiables et abordables,
                  avec une attention particulière portée au confort et à la simplicité d'utilisation.
                </p>
                <ul className="space-y-2 text-text-light">
                  <li>✅ Excellent rapport qualité/prix</li>
                  <li>✅ Facilité d'utilisation</li>
                  <li>✅ Confort toute la journée</li>
                  <li>✅ Service fiable</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Types d'appareils avec détails déroulants */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Types d'appareils</h2>
              <p className="text-xl text-text-light max-w-3xl mx-auto">
                Cliquez sur une carte pour découvrir tous les détails de chaque solution auditive.
              </p>
            </div>

            <div className="max-w-7xl mx-auto">
              {/* Cartes des solutions - Grid 3 colonnes */}
              <div className="grid md:grid-cols-3 gap-8 mb-4">
                {solutions.map((solution) => (
                  <SolutionCard
                    key={solution.id}
                    solution={solution}
                    onToggle={() => handleToggle(solution.id)}
                    isActive={activeTab === solution.id}
                  />
                ))}
              </div>

              {/* Panneau détaillé - PLEINE LARGEUR en dessous */}
              <SolutionDetailPanel
                solution={solutions.find(s => s.id === activeTab) || null}
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Trouvez votre solution</h2>
            <p className="text-xl text-text-light mb-8 max-w-2xl mx-auto">
              Chaque personne est unique. Nous prenons le temps de comprendre vos besoins
              pour vous proposer la solution la plus adaptée.
            </p>
            <a
              href="/test-auditif-gratuit"
              className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-dark transition-all shadow-lg"
            >
              📅 Prendre rendez-vous
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
