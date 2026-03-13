'use client';

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";

interface SolutionData {
  id: string;
  title: string;
  icon: string;
  shortDesc: string;
}

interface ComparisonRow {
  category: string;
  contours: string;
  intra: string;
  oticon: string;
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
      className={`bg-white rounded-2xl shadow-md p-8 text-left hover:bg-primary/5 transition-all ${
        isActive ? 'ring-2 ring-primary' : ''
      }`}
    >
      <div className="text-5xl mb-4 inline-block animate-float">{solution.icon}</div>
      <h3 className="text-2xl font-bold mb-4">{solution.title}</h3>
      <p className="text-text-light mb-4">{solution.shortDesc}</p>
      <div className="flex items-center gap-2 text-primary font-semibold">
        <span>{isActive ? '▼' : '▶'}</span>
        <span>{isActive ? 'Voir moins' : 'En savoir plus'}</span>
      </div>
    </button>
  );
}

export default function SolutionsAuditives() {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const solutions: SolutionData[] = [
    {
      id: 'contours',
      title: "Contours d'oreille",
      icon: "👂",
      shortDesc: "Discrets et confortables, ils se placent derrière l'oreille."
    },
    {
      id: 'intra',
      title: "Intra-auriculaires",
      icon: "🔍",
      shortDesc: "Presque invisibles, placés dans le conduit auditif."
    },
    {
      id: 'oticon',
      title: "Oticon Intent",
      icon: "⭐",
      shortDesc: "Technologie intelligente qui s'adapte à vos intentions."
    }
  ];

  const comparisonData: ComparisonRow[] = [
    {
      category: "📍 Position",
      contours: "Derrière l'oreille avec embout dans le conduit",
      intra: "Directement dans le conduit auditif",
      oticon: "Derrière l'oreille (design miniature)"
    },
    {
      category: "👁️ Discrétion",
      contours: "Visible mais discret, plusieurs couleurs disponibles",
      intra: "Presque invisible, sur mesure",
      oticon: "Très discret, design moderne et élégant"
    },
    {
      category: "🎯 Adapté pour",
      contours: "Toutes pertes auditives (légère à profonde)",
      intra: "Pertes légères à modérées",
      oticon: "Pertes légères à sévères"
    },
    {
      category: "🔋 Autonomie",
      contours: "Batterie longue durée ou rechargeable",
      intra: "Pile plus petite, autonomie réduite",
      oticon: "Rechargeable lithium-ion, autonomie 24h+"
    },
    {
      category: "🎛️ Fonctionnalités",
      contours: "Bluetooth, réglages multiples, accessoires",
      intra: "Réglages basiques, discrétion maximale",
      oticon: "Intelligence artificielle, Bluetooth avancé, capteurs 4D"
    },
    {
      category: "✅ Avantages",
      contours: "Facile à manipuler • Batterie longue durée • Puissant • Connexions sans fil",
      intra: "Invisible • Confort sur mesure • Son naturel • Pas d'interférence avec lunettes",
      oticon: "Technologie révolutionnaire • S'adapte à vos intentions • Qualité sonore exceptionnelle • Connectivité premium"
    },
    {
      category: "⚠️ Points d'attention",
      contours: "Légèrement visible • Peut interférer avec lunettes • Sensible au vent",
      intra: "Nécessite dextérité • Batterie petite • Entretien délicat • Limité aux pertes modérées",
      oticon: "Prix premium • Nécessite adaptation • Fonctionnalités avancées à maîtriser"
    },
    {
      category: "💰 Gamme de prix",
      contours: "1 200€ - 2 500€ par oreille",
      intra: "1 500€ - 2 800€ par oreille",
      oticon: "2 500€ - 3 500€ par oreille"
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

        {/* Types d'appareils avec tableau comparatif */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Types d'appareils</h2>
              <p className="text-xl text-text-light max-w-3xl mx-auto">
                Nous proposons différents types d'appareils auditifs, adaptés à vos besoins et à votre mode de vie.
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              {/* Cartes des solutions */}
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                {solutions.map((solution) => (
                  <SolutionCard
                    key={solution.id}
                    solution={solution}
                    onToggle={() => handleToggle(solution.id)}
                    isActive={activeTab === solution.id}
                  />
                ))}
              </div>

              {/* Tableau comparatif (se déroule sous les 3 colonnes) */}
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  activeTab ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                {activeTab && (
                  <div className="bg-white rounded-2xl shadow-lg p-8 mt-4">
                    <h3 className="text-2xl font-bold mb-6 text-center">
                      Tableau comparatif détaillé
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-primary/10">
                            <th className="p-4 text-left font-bold border border-border">
                              Caractéristique
                            </th>
                            <th className="p-4 text-left font-bold border border-border">
                              👂 Contours d'oreille
                            </th>
                            <th className="p-4 text-left font-bold border border-border">
                              🔍 Intra-auriculaires
                            </th>
                            <th className="p-4 text-left font-bold border border-border">
                              ⭐ Oticon Intent
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparisonData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-primary/5 transition-colors">
                              <td className="p-4 font-semibold border border-border bg-bg">
                                {row.category}
                              </td>
                              <td className="p-4 border border-border text-text-light whitespace-pre-line">
                                {row.contours}
                              </td>
                              <td className="p-4 border border-border text-text-light whitespace-pre-line">
                                {row.intra}
                              </td>
                              <td className="p-4 border border-border text-text-light whitespace-pre-line">
                                {row.oticon}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6 text-center">
                      <button
                        onClick={() => setActiveTab(null)}
                        className="text-primary hover:text-primary-dark font-semibold"
                      >
                        ▲ Fermer le tableau
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
