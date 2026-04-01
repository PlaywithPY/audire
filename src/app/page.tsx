'use client';

import ImageFeatureCard from "@/components/ImageFeatureCard";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import DynamicBlockRenderer from "@/components/DynamicBlockRenderer";
import ImageEffectsRenderer from "@/components/ImageEffectsRenderer";
import { useState, useEffect, useRef } from "react";
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
      <section data-section="hero" className="relative bg-gradient-to-br from-primary via-primary to-primary-dark text-white py-20 md:py-28 overflow-hidden">
        {/* Bulles décoratives animées */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="bubble w-64 h-64 top-10 -left-20 animate-float opacity-20"></div>
          <div className="bubble w-96 h-96 top-40 -right-32 animate-float delay-200 opacity-15"></div>
          <div className="bubble w-48 h-48 bottom-20 left-1/4 animate-float delay-300 opacity-20"></div>
          <div className="bubble w-80 h-80 bottom-10 right-1/4 animate-float delay-100 opacity-10"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Kicker avec animation */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-fade-in">
              <svg className="w-4 h-4 animate-pulse-slow" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
              </svg>
              <span className="text-sm font-medium">{texts['hero-kicker'] || 'Centre auditif indépendant • Province de Liège'}</span>
            </div>

            {/* Titre principal avec animation */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up delay-100 leading-tight">
              {texts['hero-title'] || 'Mieux entendre, simplement.'}
            </h1>

            {/* Description avec animation */}
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed animate-fade-in-up delay-200 max-w-3xl mx-auto">
              {texts['description-1'] || 'Chez Audire, on commence par comprendre votre quotidien et vos difficultés. Puis on vous propose une suite claire et sans pression. Test auditif gratuit, explications pédagogiques, réglages et suivi dans la durée.'}
            </p>

            {/* Chips avec animations en cascade */}
            <div className="flex flex-wrap gap-3 justify-center mb-10">
              {[
                { key: 'chip-1', default: 'Test gratuit et sans engagement', icon: '✓' },
                { key: 'chip-2', default: 'Explications claires, sans jargon', icon: '💬' },
                { key: 'chip-3', default: 'Oticon & Bernafon', icon: '🎧' },
                { key: 'chip-4', default: 'Suivi personnalisé', icon: '👤' }
              ].map((chip, index) => (
                <span
                  key={chip.key}
                  className={`bg-white/15 backdrop-blur-md px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/25 transition-all hover-lift animate-fade-in delay-${(index + 3) * 100}`}
                  style={{ animationDelay: `${(index + 3) * 0.1}s` }}
                >
                  <span className="mr-2">{chip.icon}</span>
                  {texts[chip.key] || chip.default}
                </span>
              ))}
            </div>

            {/* Boutons CTA avec animations et icônes SVG */}
            <div className="flex flex-wrap gap-4 justify-center mb-8 animate-fade-in-up delay-500">
              <Link
                href="/prendre-rendez-vous"
                className="group bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-white/95 transition-all shadow-2xl hover-lift inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Prendre rendez-vous</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="group bg-white/15 backdrop-blur-md text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/25 transition-all border-2 border-white/30 hover-glow inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>Nous contacter</span>
              </Link>
            </div>

            {/* Message de réassurance avec animation */}
            <div className="animate-fade-in delay-500 bg-white/10 backdrop-blur-sm rounded-2xl p-4 max-w-2xl mx-auto border border-white/20">
              <p className="text-sm text-white/90 flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-yellow-300 animate-pulse-slow" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-medium">Vous hésitez ?</span>
                <span>Venez juste faire le point. Parfois la meilleure réponse est "pas maintenant" — et on vous le dira.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Vague décorative en bas */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 50L60 45C120 40 240 30 360 35C480 40 600 60 720 65C840 70 960 60 1080 50C1200 40 1320 30 1380 25L1440 20V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V50Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Image effect after hero */}
      <ImageEffectsRenderer pageKey="home" sectionKey="after-hero" />

      {/* Features Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Fond décoratif subtil */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block bg-gradient-to-r from-primary/10 to-primary-light/10 text-primary px-6 py-2.5 rounded-full text-sm font-semibold mb-4 border border-primary/20 hover-lift">
              ✨ Notre approche
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {texts['section-1-title'] || 'Pourquoi choisir Audire ?'}
            </h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto leading-relaxed">
              {texts['description-2'] || 'Parce que bien entendre, ce n\'est pas qu\'une question d\'appareil. C\'est une question d\'accompagnement, d\'écoute et de suivi dans la durée.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featureCards.map((card, index) => (
              <div
                key={card.cardKey}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <ImageFeatureCard
                  imageSrc={card.imageSrc}
                  title={card.title}
                  description={card.description}
                  imageAlt={card.imageAlt}
                  href={card.href}
                  imagePosition={card.imagePosition}
                  fallbackEmoji={card.fallbackEmoji}
                />
              </div>
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
        <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-primary/5 relative overflow-hidden">
          {/* Éléments décoratifs */}
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-light/5 rounded-full blur-3xl"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <span className="inline-block bg-gradient-to-r from-primary/10 to-primary-light/10 text-primary px-6 py-2.5 rounded-full text-sm font-semibold mb-4 border border-primary/20 hover-lift">
                🎧 Nos solutions
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Appareils auditifs mis en avant
              </h2>
              <p className="text-xl text-text-light max-w-3xl mx-auto leading-relaxed">
                Découvrez nos appareils auditifs recommandés pour une meilleure audition
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {featuredProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/appareils/${product.slug}`}
                  className="group bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up border border-gray-100"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Image du produit avec overlay au hover */}
                  <div className="relative h-64 bg-gradient-to-br from-primary/10 to-primary-light/10 overflow-hidden">
                    {product.heroImage ? (
                      <>
                        <img
                          src={product.heroImage}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-7xl animate-float">🎧</span>
                      </div>
                    )}
                    {/* Badge "Mis en avant" amélioré */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg animate-pulse-slow">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>Mis en avant</span>
                    </div>
                  </div>

                  {/* Contenu avec séparateur décoratif */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary-light rounded-full"></div>
                      <div className="text-sm text-primary font-bold uppercase tracking-wide">
                        {product.brand}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors leading-tight">
                      {product.name}
                    </h3>
                    {product.shortDesc && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {product.shortDesc}
                      </p>
                    )}
                    {product.price && (
                      <div className="mb-6 p-4 bg-gradient-to-br from-primary/5 to-primary-light/5 rounded-xl border border-primary/10">
                        {formatPriceWithReimbursement(product.price)}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-primary font-semibold text-sm">En savoir plus</span>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary group-hover:scale-110 transition-all">
                        <svg className="w-4 h-4 text-primary group-hover:text-white group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Lien vers toutes les solutions amélioré */}
            <div className="text-center mt-16">
              <Link
                href="/solutions-auditives"
                className="group inline-flex items-center gap-3 text-primary font-semibold hover:gap-4 transition-all px-8 py-4 rounded-xl bg-white shadow-md hover:shadow-xl border border-primary/20 hover-lift"
              >
                <span>Voir toutes nos solutions auditives</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-primary-light/10 to-white relative overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="bubble w-96 h-96 -top-20 -left-20 animate-float opacity-20"></div>
          <div className="bubble w-72 h-72 top-40 -right-20 animate-float delay-200 opacity-15"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-md mb-6 border border-primary/20 animate-fade-in">
              <svg className="w-5 h-5 text-primary animate-pulse-slow" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
              </svg>
              <span className="text-sm font-semibold text-gray-700">Première étape simple et gratuite</span>
            </div>

            {/* Titre avec gradient */}
            <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up bg-gradient-to-r from-gray-900 via-primary to-gray-900 bg-clip-text text-transparent">
              {texts['section-2-title'] || 'Prêt à mieux entendre ?'}
            </h2>

            {/* Description */}
            <p className="text-xl md:text-2xl text-text-light mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-100">
              {texts['description-3'] || 'Prenez rendez-vous pour un test auditif gratuit et sans engagement.'}
            </p>

            {/* Bouton CTA principal amélioré */}
            <div className="mb-8 animate-fade-in-up delay-200">
              <Link
                href="/prendre-rendez-vous"
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-primary to-primary-dark text-white px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all hover-lift hover:scale-105"
              >
                <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Réserver maintenant</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Points de réassurance avec icônes */}
            <div className="flex flex-wrap justify-center gap-6 mb-8 animate-fade-in delay-300">
              {[
                { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', text: 'Test gratuit' },
                { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', text: 'Sans engagement' },
                { icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', text: 'Conseils personnalisés' }
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all hover-lift"
                >
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Message additionnel */}
            <div className="inline-flex items-center gap-2 text-sm text-text-muted bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full animate-fade-in delay-400">
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Réponse sous 24h • Rendez-vous disponibles rapidement</span>
            </div>
          </div>
        </div>
      </section>

    </main>
    </>
  );
}
