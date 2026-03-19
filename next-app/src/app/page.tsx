import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageFeatureCard from "@/components/ImageFeatureCard";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import DynamicBlockRenderer from "@/components/DynamicBlockRenderer";
import ParallaxSection from "@/components/ParallaxSection";

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen relative">
        {/* Couche d'overlay pour les blocs en position absolue uniquement */}
        <DynamicBlockRenderer
          pageKey="home"
          absoluteOnly={true}
          className="absolute inset-0 pointer-events-none"
        />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
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

      {/* Parallax Image Section */}
      <ParallaxSection
        imageSrc="/images/oticon-couple.jpg"
        alt="Couple dans un environnement élégant avec Oticon"
        speed={0.6}
        height="600px"
        overlay={true}
      >
        <div className="container mx-auto px-4 text-white text-center">
          <h2 className="text-5xl font-bold mb-4 drop-shadow-lg">
            Une technologie qui change la vie
          </h2>
          <p className="text-xl max-w-2xl mx-auto drop-shadow-md">
            Redécouvrez les conversations, les moments partagés et la beauté des sons du quotidien
          </p>
        </div>
      </ParallaxSection>

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
            <ImageFeatureCard
              imageSrc="/images/hearing-test.jpg"
              title="Test auditif gratuit"
              description="Un test complet et sans engagement pour comprendre votre audition."
              imageAlt="Test auditif avec casque professionnel"
              href="/test-auditif-gratuit"
              imagePosition="center 35%"
              fallbackEmoji="👂"
            />
            <ImageFeatureCard
              imageSrc="/images/human-support.jpg"
              title="Accompagnement humain"
              description="Pas de jargon technique, pas de pression commerciale."
              imageAlt="Accompagnement personnalisé et humain"
              href="/notre-accompagnement"
              fallbackEmoji="💬"
            />
            <ImageFeatureCard
              imageSrc="/images/personalized-follow-up.jpg"
              title="Suivi personnalisé"
              description="Réglages progressifs, adaptations, suivi régulier."
              imageAlt="Suivi personnalisé de votre appareil auditif"
              href="/notre-accompagnement"
              fallbackEmoji="🔧"
            />
            <ImageFeatureCard
              imageSrc="/images/quality-solutions.jpg"
              title="Solutions de qualité"
              description="Oticon et Bernafon, deux marques reconnues."
              imageAlt="Appareils auditifs de qualité"
              href="/solutions-auditives"
              fallbackEmoji="🏆"
            />
            <ImageFeatureCard
              imageSrc="/images/independent-center.jpg"
              title="Centre indépendant"
              description="Pas d'objectifs de vente, pas de réseau à satisfaire."
              imageAlt="Centre auditif indépendant"
              href="/notre-accompagnement"
              fallbackEmoji="🎯"
            />
            <ImageFeatureCard
              imageSrc="/images/price-transparency.jpg"
              title="Transparence des prix"
              description="Prix clairs, remboursements expliqués."
              imageAlt="Transparence des prix et remboursements"
              href="/remboursements"
              fallbackEmoji="💰"
            />
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

    </main>
      <Footer />
    </>
  );
}
