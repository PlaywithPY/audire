'use client';

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageFeatureCard from "@/components/ImageFeatureCard";
import AllPageImageEffects from "@/components/AllPageImageEffects";
import { useState, useEffect } from "react";
import { CardData } from "@/lib/card-helpers";

interface PageTexts {
  [key: string]: string;
}

export default function PartenairesPharmaciens() {
  const [featureCards, setFeatureCards] = useState<CardData[]>([]);
  const [texts, setTexts] = useState<PageTexts>({});

  useEffect(() => {
    async function loadData() {
      try {
        // Charger les cards
        const cardsRes = await fetch('/api/card-images?pageKey=partenaires-pharmaciens');
        if (cardsRes.ok) {
          const cards = await cardsRes.json();
          setFeatureCards(cards);
        }

        // Charger les textes
        const textsRes = await fetch('/api/page-texts?pageKey=partenaires-pharmaciens');
        if (textsRes.ok) {
          const textsData = await textsRes.json();
          setTexts(textsData);
        }
      } catch (error) {
        console.error('Error loading page data:', error);
      }
    }
    loadData();
  }, []);
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section data-section="hero" className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                {texts['hero-kicker'] || 'Professionnels de santé'}
              </span>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                {texts['hero-title'] || 'Partenaires pharmaciens'}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                {texts['hero-description'] || 'Vous êtes pharmacien en province de Liège ? Orientez vos patients vers un accompagnement de qualité pour leurs besoins auditifs.'}
              </p>
            </div>
          </div>
        </section>

        {/* Pourquoi nous recommander */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block bg-secondary text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
                {texts['section-1-kicker'] || 'Notre engagement'}
              </span>
              <h2 className="text-4xl font-bold mb-4">{texts['section-1-title'] || 'Pourquoi nous recommander ?'}</h2>
              <p className="text-xl text-text-light max-w-3xl mx-auto">
                {texts['section-1-description'] || 'Un partenariat basé sur la confiance et l\'excellence du service.'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
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

        {/* Comment ça marche */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">{texts['section-2-title'] || 'Comment orienter vos patients ?'}</h2>
              <p className="text-xl text-text-light max-w-3xl mx-auto">
                {texts['section-2-description'] || 'Un processus simple et efficace pour vos patients.'}
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {[
                  {
                    step: '1',
                    title: 'Détection du besoin',
                    desc: 'Votre patient vous fait part de difficultés auditives ou vous détectez des signes.'
                  },
                  {
                    step: '2',
                    title: 'Orientation vers Audire',
                    desc: 'Vous recommandez Audire et nous transmettez les coordonnées du patient (avec son accord).'
                  },
                  {
                    step: '3',
                    title: 'Prise en charge rapide',
                    desc: 'Nous contactons votre patient rapidement pour planifier un test auditif gratuit.'
                  },
                  {
                    step: '4',
                    title: 'Accompagnement personnalisé',
                    desc: 'Nous prenons en charge votre patient avec notre méthode d\'accompagnement sur-mesure.'
                  },
                  {
                    step: '5',
                    title: 'Retour d\'information',
                    desc: 'Nous vous tenons informé de l\'évolution (avec l\'accord du patient).'
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-6 items-start bg-white p-6 rounded-xl hover:shadow-lg transition-all">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-text-light">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Matériel de communication */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-4">{texts['section-3-title'] || 'Matériel de communication'}</h2>
              <p className="text-xl text-text-light mb-8">
                {texts['section-3-description'] || 'Nous mettons à votre disposition du matériel pour informer vos patients.'}
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: '📋', title: 'Dépliants', desc: 'À disposer dans votre pharmacie' },
                  { icon: '🎯', title: 'Affiches', desc: 'Pour votre vitrine ou espace conseil' },
                  { icon: '📱', title: 'Cartes de visite', desc: 'À remettre à vos patients' },
                ].map((item) => (
                  <div key={item.title} className="bg-bg p-6 rounded-xl">
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <h3 className="font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-text-muted">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">{texts['cta-title'] || 'Devenons partenaires'}</h2>
            <p className="text-xl text-text-light mb-8 max-w-2xl mx-auto">
              {texts['cta-description'] || 'Vous souhaitez devenir partenaire ou obtenir plus d\'informations ? Contactez-nous dès maintenant.'}
            </p>
            <a
              href="/contact"
              className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-dark transition-all shadow-lg"
            >
              📞 Nous contacter
            </a>
          </div>
        </section>

        {/* Image Effects */}
        <AllPageImageEffects pageKey="partenaires-pharmaciens" />
      </main>
      <Footer />
    </>
  );
}
