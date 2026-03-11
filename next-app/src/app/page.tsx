import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CardIcon from "@/components/CardIcon";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import DynamicBlockRenderer from "@/components/DynamicBlockRenderer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              <span className="text-sm font-medium">Centre auditif indépendant • Province de Liège</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Mieux entendre, simplement.
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Chez Audire, on commence par <strong>comprendre votre quotidien</strong> et vos difficultés.
              Puis on vous propose une suite claire et sans pression. Test auditif gratuit, explications pédagogiques,
              réglages et suivi dans la durée.
            </p>

            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {['Test gratuit et sans engagement', 'Explications claires, sans jargon', 'Oticon & Bernafon', 'Suivi personnalisé'].map((chip) => (
                <span key={chip} className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                  {chip}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button className="bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg">
                📅 Prendre rendez-vous
              </button>
              <button className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all">
                📞 Nous contacter
              </button>
            </div>

            <p className="mt-6 text-sm text-white/70">
              Vous hésitez ? Venez juste faire le point. Parfois la meilleure réponse est "pas maintenant" — et on vous le dira.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block bg-secondary text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Notre approche
            </span>
            <h2 className="text-4xl font-bold mb-4">Pourquoi choisir Audire ?</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">
              Parce que bien entendre, ce n'est pas qu'une question d'appareil.
              C'est une question d'accompagnement, d'écoute et de suivi dans la durée.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { cardKey: 'hero-features-test', icon: '👂', title: 'Test auditif gratuit', desc: 'Un test complet et sans engagement pour comprendre votre audition.' },
              { cardKey: 'hero-features-accompagnement', icon: '💬', title: 'Accompagnement humain', desc: 'Pas de jargon technique, pas de pression commerciale.' },
              { cardKey: 'hero-features-suivi', icon: '🔧', title: 'Suivi personnalisé', desc: 'Réglages progressifs, adaptations, suivi régulier.' },
              { cardKey: 'hero-features-qualite', icon: '🏆', title: 'Solutions de qualité', desc: 'Oticon et Bernafon, deux marques reconnues.' },
              { cardKey: 'hero-features-independant', icon: '🎯', title: 'Centre indépendant', desc: "Pas d'objectifs de vente, pas de réseau à satisfaire." },
              { cardKey: 'hero-features-transparence', icon: '💰', title: 'Transparence des prix', desc: 'Prix clairs, remboursements expliqués.' },
            ].map((feature) => (
              <div key={feature.title} className="bg-bg p-6 rounded-2xl hover:shadow-lg transition-all">
                <div className="mb-4">
                  <CardIcon cardKey={feature.cardKey} defaultEmoji={feature.icon} size={48} />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-text-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <TestimonialsCarousel />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-primary-light/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Prêt à mieux entendre ?</h2>
          <p className="text-xl text-text-light mb-8 max-w-2xl mx-auto">
            Prenez rendez-vous pour un test auditif gratuit et sans engagement.
          </p>
          <button className="bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-dark transition-all shadow-lg">
            📅 Réserver maintenant
          </button>
          <p className="mt-4 text-sm text-text-muted">
            Test gratuit • Sans engagement • Conseils personnalisés
          </p>
        </div>
      </section>

      {/* Dynamic Content from Admin */}
      <section className="relative py-12 bg-white">
        <div className="container mx-auto px-4">
          <DynamicBlockRenderer pageKey="home" className="space-y-6" />
        </div>
      </section>

    </main>
      <Footer />
    </>
  );
}
