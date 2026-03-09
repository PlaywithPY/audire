import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notre accompagnement — Audire",
  description: "Découvrez notre accompagnement personnalisé, du test auditif au suivi dans la durée.",
};

export default function NotreAccompagnement() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                Notre méthode
              </span>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Notre accompagnement
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                Chez Audire, <strong>vous n'êtes pas un numéro</strong>. Nous prenons le temps
                de comprendre votre quotidien, vos difficultés et vos attentes pour vous proposer
                un accompagnement vraiment personnalisé.
              </p>
            </div>
          </div>
        </section>

        {/* Notre approche */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block bg-secondary text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
                Étape par étape
              </span>
              <h2 className="text-4xl font-bold mb-4">Comment ça se passe ?</h2>
              <p className="text-xl text-text-light max-w-3xl mx-auto">
                Un accompagnement en plusieurs étapes, à votre rythme et sans pression.
              </p>
            </div>

            <div className="max-w-5xl mx-auto space-y-8">
              {[
                {
                  step: '1',
                  title: 'Premier contact',
                  desc: 'Vous nous appelez ou vous venez nous voir. On discute de votre situation, sans engagement. Parfois la meilleure réponse est "pas maintenant" — et on vous le dira.',
                  icon: '👋'
                },
                {
                  step: '2',
                  title: 'Test auditif gratuit',
                  desc: 'Un test complet de 30 minutes pour comprendre votre audition. On vous explique les résultats avec des mots simples, pas du jargon médical.',
                  icon: '🎧'
                },
                {
                  step: '3',
                  title: 'Conseil personnalisé',
                  desc: 'On vous propose une ou plusieurs solutions adaptées à votre situation et à votre budget. Pas de vente forcée, juste des conseils honnêtes.',
                  icon: '💬'
                },
                {
                  step: '4',
                  title: 'Essai sans engagement',
                  desc: 'Vous testez les appareils dans votre quotidien. Au travail, en famille, dans le bruit... C\'est comme ça qu\'on sait si ça marche vraiment.',
                  icon: '🔍'
                },
                {
                  step: '5',
                  title: 'Réglages progressifs',
                  desc: 'L\'adaptation prend du temps. On se voit régulièrement pour affiner les réglages jusqu\'à ce que ce soit parfait pour vous.',
                  icon: '🔧'
                },
                {
                  step: '6',
                  title: 'Suivi dans la durée',
                  desc: 'Même après l\'achat, on reste là. Entretien, nettoyage, petits réglages... On vous accompagne aussi longtemps que nécessaire.',
                  icon: '🤝'
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-6 items-start bg-bg p-8 rounded-2xl hover:shadow-lg transition-all">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      {item.step}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">{item.icon}</span>
                      <h3 className="text-2xl font-bold">{item.title}</h3>
                    </div>
                    <p className="text-text-light text-lg leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ce qui nous différencie */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Ce qui nous différencie</h2>
              <p className="text-xl text-text-light max-w-3xl mx-auto">
                Pourquoi nos clients nous recommandent à leurs proches ?
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[
                {
                  title: 'Indépendance',
                  desc: 'Nous sommes un centre indépendant, sans objectifs de vente imposés. Notre seul but : vous aider à mieux entendre.',
                  icon: '🎯'
                },
                {
                  title: 'Transparence',
                  desc: 'Prix clairs, remboursements expliqués, pas de frais cachés. Vous savez exactement ce que vous payez.',
                  icon: '💎'
                },
                {
                  title: 'Disponibilité',
                  desc: 'Un problème ? Une question ? On est là. Pas besoin d\'attendre 3 semaines pour un rendez-vous.',
                  icon: '⚡'
                },
                {
                  title: 'Proximité',
                  desc: 'On prend le temps de vous écouter, de comprendre vos besoins et de vous accompagner vraiment.',
                  icon: '💙'
                },
              ].map((item) => (
                <div key={item.title} className="bg-white p-8 rounded-2xl hover:shadow-lg transition-all">
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-text-light leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Témoignage */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-secondary border-l-4 border-primary p-8 rounded-xl">
                <div className="text-5xl mb-4">💬</div>
                <blockquote className="text-xl text-text-light italic mb-4 leading-relaxed">
                  "Ce que j'ai apprécié chez Audire, c'est qu'on a pris le temps de m'écouter.
                  Pas de pression, pas de vente forcée. Juste des conseils honnêtes et un suivi
                  régulier pour adapter mes appareils. Aujourd'hui je recommande Audire à tous mes amis."
                </blockquote>
                <p className="font-semibold">— Marie, 68 ans, Liège</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Prêt à commencer ?</h2>
            <p className="text-xl text-text-light mb-8 max-w-2xl mx-auto">
              Prenez rendez-vous pour un test auditif gratuit et sans engagement.
            </p>
            <a
              href="/test-auditif-gratuit"
              className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-dark transition-all shadow-lg"
            >
              📅 Réserver maintenant
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
