import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solutions auditives — Audire",
  description: "Découvrez nos solutions auditives Oticon et Bernafon. Appareils discrets, performants et adaptés à votre quotidien.",
};

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
              {[
                {
                  title: 'Contours d\'oreille',
                  desc: 'Discrets et confortables, ils se placent derrière l\'oreille. Idéaux pour tous types de pertes auditives.',
                  icon: '👂'
                },
                {
                  title: 'Intra-auriculaires',
                  desc: 'Presque invisibles, ils se placent directement dans le conduit auditif. Parfaits pour un maximum de discrétion.',
                  icon: '🔍'
                },
                {
                  title: 'Rechargeables',
                  desc: 'Plus besoin de piles ! Rechargez vos appareils la nuit et profitez d\'une journée complète d\'autonomie.',
                  icon: '🔋'
                },
              ].map((type) => (
                <div key={type.title} className="bg-white p-8 rounded-2xl hover:shadow-lg transition-all">
                  <div className="text-5xl mb-4">{type.icon}</div>
                  <h3 className="text-2xl font-bold mb-4">{type.title}</h3>
                  <p className="text-text-light">{type.desc}</p>
                </div>
              ))}
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
