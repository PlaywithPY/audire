'use client';

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";

interface SolutionCardProps {
  title: string;
  icon: string;
  shortDesc: string;
  fullDesc: string;
  avantages: string[];
  inconvenients: string[];
}

function SolutionCard({ title, icon, shortDesc, fullDesc, avantages, inconvenients }: SolutionCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Card cliquable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-8 text-left hover:bg-primary/5 transition-colors"
      >
        <div className="text-5xl mb-4 inline-block animate-float">{icon}</div>
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-text-light mb-4">{shortDesc}</p>
        <div className="flex items-center gap-2 text-primary font-semibold">
          <span>{isOpen ? '▼' : '▶'}</span>
          <span>{isOpen ? 'Voir moins' : 'En savoir plus'}</span>
        </div>
      </button>

      {/* Contenu détaillé (accordion) */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-8 pb-8 border-t border-border">
          <div className="pt-6 space-y-6">
            {/* Description complète */}
            <div>
              <h4 className="font-bold text-lg mb-2">Description</h4>
              <p className="text-text-light">{fullDesc}</p>
            </div>

            {/* Tableau avantages/inconvénients */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Avantages */}
              <div className="bg-green-50 p-4 rounded-xl">
                <h4 className="font-bold text-lg mb-3 text-green-800">✅ Avantages</h4>
                <ul className="space-y-2">
                  {avantages.map((av, idx) => (
                    <li key={idx} className="text-sm text-green-900">• {av}</li>
                  ))}
                </ul>
              </div>

              {/* Inconvénients */}
              <div className="bg-orange-50 p-4 rounded-xl">
                <h4 className="font-bold text-lg mb-3 text-orange-800">⚠️ Points d'attention</h4>
                <ul className="space-y-2">
                  {inconvenients.map((inc, idx) => (
                    <li key={idx} className="text-sm text-orange-900">• {inc}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SolutionsAuditives() {
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

        {/* Types d'appareils */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Types d'appareils</h2>
              <p className="text-xl text-text-light max-w-3xl mx-auto">
                Nous proposons différents types d'appareils auditifs, adaptés à vos besoins et à votre mode de vie.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <SolutionCard
                title="Contours d'oreille"
                icon="👂"
                shortDesc="Discrets et confortables, ils se placent derrière l'oreille."
                fullDesc="Les contours d'oreille (BTE - Behind The Ear) sont les appareils auditifs les plus polyvalents. Ils se placent confortablement derrière l'oreille et conviennent à tous types de pertes auditives, de légères à profondes."
                avantages={[
                  'Adaptés à toutes les pertes auditives',
                  'Faciles à manipuler',
                  'Batterie longue durée',
                  'Entretien simple',
                  'Excellente qualité sonore'
                ]}
                inconvenients={[
                  'Légèrement plus visibles',
                  'Peuvent interférer avec les lunettes',
                  'Sensibles au vent'
                ]}
              />
              <SolutionCard
                title="Intra-auriculaires"
                icon="🔍"
                shortDesc="Presque invisibles, placés dans le conduit auditif."
                fullDesc="Les appareils intra-auriculaires (ITE/CIC) sont fabriqués sur mesure pour s'adapter parfaitement à votre conduit auditif. Ils offrent une discrétion maximale tout en délivrant une excellente qualité sonore."
                avantages={[
                  'Très discrets, presque invisibles',
                  'Confort optimal (sur mesure)',
                  'Qualité sonore naturelle',
                  'Pas d\'interférence avec lunettes',
                  'Bonne localisation des sons'
                ]}
                inconvenients={[
                  'Nécessitent une bonne dextérité',
                  'Batterie plus petite',
                  'Entretien plus délicat',
                  'Non adaptés aux pertes sévères'
                ]}
              />
              <SolutionCard
                title="Rechargeables"
                icon="🔋"
                shortDesc="Plus besoin de piles ! Autonomie d'une journée complète."
                fullDesc="Les appareils rechargeables représentent l'avenir de l'audiologie. Plus besoin de manipuler de petites piles : déposez simplement vos appareils dans leur station de charge la nuit."
                avantages={[
                  'Plus de piles à changer',
                  'Écologique et économique',
                  'Charge rapide (3-4h)',
                  'Autonomie 24h',
                  'Facilité d\'utilisation'
                ]}
                inconvenients={[
                  'Nécessite accès à électricité',
                  'Légèrement plus chers',
                  'Station de charge à transporter en voyage'
                ]}
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
