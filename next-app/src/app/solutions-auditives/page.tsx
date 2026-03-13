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
  if (!solution) return null;

  return (
    <div className="grid transition-all duration-500 ease-in-out grid-rows-[1fr] opacity-100 mt-8">
      <div className="overflow-hidden">
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
      </div>
    </div>
  );
}

export default function SolutionsAuditives() {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const solutions: SolutionData[] = [
    {
      id: 'contours',
      title: "Contours d'oreille",
      icon: "👂",
      shortDesc: "Discrets et confortables, ils se placent derrière l'oreille.",
      fullDesc: "Les contours d'oreille sont des appareils auditifs polyvalents qui se positionnent derrière le pavillon de l'oreille. Un tube fin relie l'appareil à un embout placé dans le conduit auditif. Cette conception classique offre une excellente amplification pour tous les types de perte auditive, de légère à profonde. Ils sont faciles à manipuler et offrent une longue autonomie de batterie.",
      image: "🎧",
      pros: [
        "Adapté à toutes les pertes auditives (légère à profonde)",
        "Facile à manipuler et à entretenir",
        "Batterie longue durée ou option rechargeable",
        "Nombreuses fonctionnalités (Bluetooth, réglages multiples)",
        "Puissance d'amplification élevée",
        "Compatibilité avec de nombreux accessoires"
      ],
      cons: [
        "Légèrement visible derrière l'oreille",
        "Peut interférer avec les lunettes ou casques",
        "Sensible au vent lors d'activités extérieures",
        "Peut générer un effet d'occlusion (sensation d'oreille bouchée)"
      ]
    },
    {
      id: 'intra',
      title: "Intra-auriculaires",
      icon: "🔍",
      shortDesc: "Presque invisibles, placés dans le conduit auditif.",
      fullDesc: "Les appareils intra-auriculaires sont des solutions discrètes fabriquées sur mesure pour s'adapter parfaitement à votre conduit auditif. Ils sont quasiment invisibles de l'extérieur et offrent un son naturel grâce à leur positionnement dans l'oreille. Idéaux pour les pertes auditives légères à modérées, ils privilégient la discrétion maximale.",
      image: "👁️",
      pros: [
        "Pratiquement invisibles de l'extérieur",
        "Confort sur mesure adapté à votre oreille",
        "Son naturel grâce au positionnement dans le conduit",
        "Pas d'interférence avec lunettes, casques ou chapeaux",
        "Moins sensible au vent",
        "Discrétion absolue dans toutes les situations"
      ],
      cons: [
        "Nécessite une bonne dextérité pour manipulation",
        "Pile plus petite, autonomie réduite",
        "Entretien plus délicat (cérumen)",
        "Limité aux pertes auditives légères à modérées",
        "Peut être inconfortable pour certaines morphologies d'oreille"
      ]
    },
    {
      id: 'oticon',
      title: "Oticon Intent",
      icon: "⭐",
      shortDesc: "Technologie intelligente qui s'adapte à vos intentions.",
      fullDesc: "L'Oticon Intent représente le summum de la technologie auditive moderne. Équipé de capteurs 4D révolutionnaires, il détecte et s'adapte automatiquement à vos intentions : conversation, écoute, mouvement. L'intelligence artificielle intégrée analyse votre environnement sonore 500 fois par seconde pour offrir une expérience d'écoute exceptionnelle et naturelle.",
      image: "🚀",
      pros: [
        "Technologie révolutionnaire avec capteurs 4D",
        "Intelligence artificielle qui s'adapte à vos intentions",
        "Qualité sonore exceptionnelle et naturelle",
        "Bluetooth avancé pour connexions multiples",
        "Batterie rechargeable lithium-ion (autonomie 24h+)",
        "Design très discret et moderne",
        "Application mobile complète pour réglages personnalisés"
      ],
      cons: [
        "Prix premium (2 500€ - 3 500€ par oreille)",
        "Nécessite une période d'adaptation aux fonctionnalités",
        "Nombreuses fonctionnalités avancées à maîtriser",
        "Dépendance à la recharge quotidienne"
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
