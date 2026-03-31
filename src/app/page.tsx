'use client';

import ImageFeatureCard from "@/components/ImageFeatureCard";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import DynamicBlockRenderer from "@/components/DynamicBlockRenderer";
import ImageEffectsRenderer from "@/components/ImageEffectsRenderer";
import { useState, useEffect } from "react";
import { CardData } from "@/lib/card-helpers";
import Link from "next/link";

interface PageTexts {
  [key: string]: string;
}

interface FeaturedProduct {
  id: number;
  slug: string;
  name: string;
  brand: string;
  shortDesc: string | null;
  heroImage: string | null;
  price: string | null;
}

export default function Home() {
  const [featureCards, setFeatureCards] = useState<CardData[]>([]);
  const [texts, setTexts] = useState<PageTexts>({});
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [mutuelleReimbursement, setMutuelleReimbursement] = useState<number>(0);

  // Fonction pour extraire le premier prix numérique d'une chaîne
  const extractPrice = (priceString: string | null): number | null => {
    if (!priceString) return null;
    const match = priceString.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  // Fonction pour formater l'affichage du prix avec remboursement
  const formatPriceWithReimbursement = (priceString: string | null): JSX.Element | null => {
    const price = extractPrice(priceString);
    if (!price) {
      return priceString ? <span>{priceString}</span> : null;
    }

    const finalPrice = mutuelleReimbursement ? price - mutuelleReimbursement : price;

    return (
      <div>
        <div className="text-sm text-gray-600 mb-1">
          À partir de
        </div>
        <div className="text-lg font-semibold text-primary">
          {price}€
        </div>
        {mutuelleReimbursement > 0 && (
          <div className="text-sm text-gray-600">
            (-{mutuelleReimbursement}€ de la mutuelle donc {finalPrice}€)
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    async function loadData() {
      try {
        // Charger les feature cards
        const cardsRes = await fetch('/api/card-images?pageKey=home');
        if (cardsRes.ok) {
          const cardsData = await cardsRes.json();
          setFeatureCards(cardsData);
        }

        // Charger les textes de la page
        const textsRes = await fetch('/api/page-texts?pageKey=home');
        if (textsRes.ok) {
          const textsData = await textsRes.json();
          setTexts(textsData);
        }

        // Charger les produits mis en avant
        const productsRes = await fetch('/api/hearing-aids/featured');
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setFeaturedProducts(productsData);
        }

        // Charger le remboursement mutuelle
        const settingsRes = await fetch('/api/settings?key=mutuelle_reimbursement');
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setMutuelleReimbursement(parseFloat(settingsData.value || '0'));
        }
      } catch (error) {
        console.error('Error loading page data:', error);
      }
    }
    loadData();
  }, []);
  return (
    <>
      <main className="min-h-screen relative">
        {/* Couche d'overlay pour les blocs en position absolue uniquement */}
        <DynamicBlockRenderer
          pageKey="home"
          absoluteOnly={true}
          className="absolute inset-0 pointer-events-none"
        />

      {/* Hero Section */}
      <section data-section="hero" className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <span className="text-sm font-medium">{texts['hero-kicker'] || 'Centre auditif indépendant • Province de Liège'}</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {texts['hero-title'] || 'Mieux entendre, simplement.'}
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              {texts['description-1'] || 'Chez Audire, on commence par comprendre votre quotidien et vos difficultés. Puis on vous propose une suite claire et sans pression. Test auditif gratuit, explications pédagogiques, réglages et suivi dans la durée.'}
            </p>

            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {[
                { key: 'chip-1', default: 'Test gratuit et sans engagement' },
                { key: 'chip-2', default: 'Explications claires, sans jargon' },
                { key: 'chip-3', default: 'Oticon & Bernafon' },
                { key: 'chip-4', default: 'Suivi personnalisé' }
              ].map((chip) => (
                <span key={chip.key} className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                  {texts[chip.key] || chip.default}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/prendre-rendez-vous"
                className="bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg"
              >
                📅 Prendre rendez-vous
              </Link>
              <Link
                href="/contact"
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all"
              >
                📞 Nous contacter
              </Link>
            </div>

            <p className="mt-6 text-sm text-white/70">
              Vous hésitez ? Venez juste faire le point. Parfois la meilleure réponse est "pas maintenant" — et on vous le dira.
            </p>
          </div>
        </div>
      </section>

      {/* Image effect after hero */}
      <ImageEffectsRenderer pageKey="home" sectionKey="after-hero" />

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block bg-secondary text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Notre approche
            </span>
            <h2 className="text-4xl font-bold mb-4">{texts['section-1-title'] || 'Pourquoi choisir Audire ?'}</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">
              {texts['description-2'] || 'Parce que bien entendre, ce n\'est pas qu\'une question d\'appareil. C\'est une question d\'accompagnement, d\'écoute et de suivi dans la durée.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featureCards.map((card) => (
              <ImageFeatureCard
                key={card.cardKey}
                imageSrc={card.imageSrc}
                title={card.title}
                description={card.description}
                imageAlt={card.imageAlt}
                href={card.href}
                imagePosition={card.imagePosition}
                fallbackEmoji={card.fallbackEmoji}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Image effect after features */}
      <ImageEffectsRenderer pageKey="home" sectionKey="after-features" />

      {/* Testimonials Carousel */}
      <TestimonialsCarousel />

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
                Nos solutions
              </span>
              <h2 className="text-4xl font-bold mb-4">Appareils auditifs mis en avant</h2>
              <p className="text-xl text-text-light max-w-3xl mx-auto">
                Découvrez nos appareils auditifs recommandés pour une meilleure audition
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/appareils/${product.slug}`}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Image du produit */}
                  <div className="relative h-56 bg-gradient-to-br from-primary/10 to-primary-light/10 overflow-hidden">
                    {product.heroImage ? (
                      <img
                        src={product.heroImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-6xl">🎧</span>
                      </div>
                    )}
                    {/* Badge "Mis en avant" */}
                    <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <span>⭐</span>
                      <span>Mis en avant</span>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-6">
                    <div className="text-sm text-primary font-semibold mb-2">
                      {product.brand}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    {product.shortDesc && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.shortDesc}
                      </p>
                    )}
                    {product.price && (
                      <div className="mb-4">
                        {formatPriceWithReimbursement(product.price)}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                      <span>En savoir plus</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Lien vers toutes les solutions */}
            <div className="text-center mt-12">
              <Link
                href="/solutions-auditives"
                className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
              >
                <span>Voir toutes nos solutions auditives</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-primary-light/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">{texts['section-2-title'] || 'Prêt à mieux entendre ?'}</h2>
          <p className="text-xl text-text-light mb-8 max-w-2xl mx-auto">
            {texts['description-3'] || 'Prenez rendez-vous pour un test auditif gratuit et sans engagement.'}
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
    </>
  );
}
