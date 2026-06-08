'use client';

import ImageFeatureCard from "@/components/ImageFeatureCard";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import DynamicBlockRenderer from "@/components/DynamicBlockRenderer";
import DynamicBlockSlot from "@/components/DynamicBlockSlot";
import ImageEffectsRenderer from "@/components/ImageEffectsRenderer";
import HeroModern from "@/components/HeroModern";
import HeroClassic from "@/components/HeroClassic";
import InsertZone from "@/components/admin/InsertZone";
import { useState, useEffect } from "react";
import { CardData } from "@/lib/card-helpers";
import Link from "next/link";

interface PageTexts { [key: string]: string; }
interface FeaturedProduct {
  id: number; slug: string; name: string; brand: string;
  shortDesc: string | null; heroImage: string | null; price: string | null;
}

export default function Home() {
  const [featureCards, setFeatureCards] = useState<CardData[]>([]);
  const [texts, setTexts] = useState<PageTexts>({});
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [mutuelleReimbursement, setMutuelleReimbursement] = useState<number>(0);
  const [useModernDesign, setUseModernDesign] = useState<boolean>(true);

  const extractPrice = (p: string | null): number | null => {
    if (!p) return null; const m = p.match(/(\d+)/); return m ? parseInt(m[1]) : null;
  };
  const formatPriceWithReimbursement = (priceString: string | null): JSX.Element | null => {
    const price = extractPrice(priceString);
    if (!price) return priceString ? <span>{priceString}</span> : null;
    const finalPrice = mutuelleReimbursement ? price - mutuelleReimbursement : price;
    return (
      <div>
        <div className="text-sm text-gray-600 mb-1">À partir de</div>
        <div className="text-lg font-semibold text-primary">{price}€</div>
        {mutuelleReimbursement > 0 && (
          <div className="text-sm text-gray-600">(-{mutuelleReimbursement}€ de la mutuelle donc {finalPrice}€)</div>
        )}
      </div>
    );
  };

  useEffect(() => {
    async function loadData() {
      try {
        const cardsRes = await fetch('/api/card-images?pageKey=home');
        if (cardsRes.ok) setFeatureCards(await cardsRes.json());
        const textsRes = await fetch('/api/page-texts?pageKey=home');
        if (textsRes.ok) setTexts(await textsRes.json());
        const productsRes = await fetch('/api/hearing-aids/featured');
        if (productsRes.ok) setFeaturedProducts(await productsRes.json());
        const settingsRes = await fetch('/api/settings?key=mutuelle_reimbursement');
        if (settingsRes.ok) setMutuelleReimbursement(parseFloat((await settingsRes.json()).value || '0'));
        const designRes = await fetch('/api/settings?key=use_modern_homepage_design');
        if (designRes.ok) {
          const d = await designRes.json();
          setUseModernDesign(d.value === 'true' || d.value === '1');
        }
      } catch (e) { console.error('Error loading page data:', e); }
    }
    loadData();
  }, []);

  return (
    <main className="min-h-screen relative">
      <DynamicBlockRenderer pageKey="home" absoluteOnly={true} className="absolute inset-0 pointer-events-none" />

      {/* ── SLOT : tout en haut ── */}
      <InsertZone pageKey="home" slot="page-top" />
      <DynamicBlockSlot pageKey="home" slot="page-top" />

      {useModernDesign ? <HeroModern texts={texts} /> : <HeroClassic texts={texts} />}

      {/* ── SLOT : après le hero ── */}
      <InsertZone pageKey="home" slot="after-hero" />
      <DynamicBlockSlot pageKey="home" slot="after-hero" />

      <ImageEffectsRenderer pageKey="home" sectionKey="after-hero" />

      {/* ── SLOT : avant les features ── */}
      <InsertZone pageKey="home" slot="before-features" />
      <DynamicBlockSlot pageKey="home" slot="before-features" />

      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block bg-gradient-to-r from-primary/10 to-primary-light/10 text-primary px-6 py-2.5 rounded-full text-sm font-semibold mb-4 border border-primary/20 hover-lift">✨ Notre approche</span>
            <h2 data-edit-block="home.section-1-title" className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {texts['section-1-title'] || 'Pourquoi choisir Audire ?'}
            </h2>
            <p data-edit-block="home.description-2" className="text-xl text-text-light max-w-3xl mx-auto leading-relaxed">
              {texts['description-2'] || 'Parce que bien entendre, ce n\'est pas qu\'une question d\'appareil. C\'est une question d\'accompagnement, d\'écoute et de suivi dans la durée.'}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featureCards.map((card, index) => (
              <div key={card.cardKey} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.15}s` }}>
                <ImageFeatureCard pageKey="home" cardKey={card.cardKey} imageSrc={card.imageSrc} title={card.title} description={card.description}
                  imageAlt={card.imageAlt} href={card.href} imagePosition={card.imagePosition} imageZoom={card.imageZoom} fallbackEmoji={card.fallbackEmoji} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SLOT : après les features ── */}
      <InsertZone pageKey="home" slot="after-features" />
      <DynamicBlockSlot pageKey="home" slot="after-features" />

      <ImageEffectsRenderer pageKey="home" sectionKey="after-features" />

      {/* ── SLOT : avant les témoignages ── */}
      <InsertZone pageKey="home" slot="before-testimonials" />
      <DynamicBlockSlot pageKey="home" slot="before-testimonials" />

      <TestimonialsCarousel />

      {/* ── SLOT : avant les produits ── */}
      <InsertZone pageKey="home" slot="before-products" />
      <DynamicBlockSlot pageKey="home" slot="before-products" />

      {featuredProducts.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-primary/5 relative overflow-hidden">
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-light/5 rounded-full blur-3xl"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <span className="inline-block bg-gradient-to-r from-primary/10 to-primary-light/10 text-primary px-6 py-2.5 rounded-full text-sm font-semibold mb-4 border border-primary/20 hover-lift">🎧 Nos solutions</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Appareils auditifs mis en avant</h2>
              <p className="text-xl text-text-light max-w-3xl mx-auto leading-relaxed">Découvrez nos appareils auditifs recommandés pour une meilleure audition</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {featuredProducts.map((product, index) => (
                <Link key={product.id} href={`/appareils/${product.slug}`} className="group bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up border border-gray-100" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="relative h-64 bg-gradient-to-br from-primary/10 to-primary-light/10 overflow-hidden">
                    {product.heroImage ? (
                      <>
                        <img src={product.heroImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </>
                    ) : (<div className="flex items-center justify-center h-full"><span className="text-7xl animate-float">🎧</span></div>)}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg animate-pulse-slow">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      <span>Mis en avant</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary-light rounded-full"></div>
                      <div className="text-sm text-primary font-bold uppercase tracking-wide">{product.brand}</div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors leading-tight">{product.name}</h3>
                    {product.shortDesc && <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{product.shortDesc}</p>}
                    {product.price && (<div className="mb-6 p-4 bg-gradient-to-br from-primary/5 to-primary-light/5 rounded-xl border border-primary/10">{formatPriceWithReimbursement(product.price)}</div>)}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-primary font-semibold text-sm">En savoir plus</span>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary group-hover:scale-110 transition-all">
                        <svg className="w-4 h-4 text-primary group-hover:text-white group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-16">
              <Link href="/solutions-auditives" className="group inline-flex items-center gap-3 text-primary font-semibold hover:gap-4 transition-all px-8 py-4 rounded-xl bg-white shadow-md hover:shadow-xl border border-primary/20 hover-lift">
                <span>Voir toutes nos solutions auditives</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── SLOT : avant le CTA ── */}
      <InsertZone pageKey="home" slot="before-cta" />
      <DynamicBlockSlot pageKey="home" slot="before-cta" />

      <section className="py-24 bg-gradient-to-br from-primary/10 via-primary-light/10 to-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="bubble w-96 h-96 -top-20 -left-20 animate-float opacity-20"></div>
          <div className="bubble w-72 h-72 top-40 -right-20 animate-float delay-200 opacity-15"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-md mb-6 border border-primary/20 animate-fade-in">
              <svg className="w-5 h-5 text-primary animate-pulse-slow" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>
              <span className="text-sm font-semibold text-gray-700">Première étape simple et gratuite</span>
            </div>
            <h2 data-edit-block="home.section-2-title" className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up bg-gradient-to-r from-gray-900 via-primary to-gray-900 bg-clip-text text-transparent">
              {texts['section-2-title'] || 'Prêt à mieux entendre ?'}
            </h2>
            <p data-edit-block="home.description-3" className="text-xl md:text-2xl text-text-light mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-100">
              {texts['description-3'] || 'Prenez rendez-vous pour un test auditif gratuit et sans engagement.'}
            </p>
            <div className="mb-8 animate-fade-in-up delay-200">
              <Link href="/prendre-rendez-vous" className="group inline-flex items-center gap-3 bg-gradient-to-r from-primary to-primary-dark text-white px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all hover-lift hover:scale-105">
                <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span>Réserver maintenant</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mb-8 animate-fade-in delay-300">
              {[
                { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', text: 'Test gratuit' },
                { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', text: 'Sans engagement' },
                { icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', text: 'Conseils personnalisés' }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 bg-white px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all hover-lift">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                  <span className="text-sm font-semibold text-gray-700">{item.text}</span>
                </div>
              ))}
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-text-muted bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full animate-fade-in delay-400">
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
              <span>Réponse sous 24h • Rendez-vous disponibles rapidement</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SLOT : tout en bas (les blocs créés ici, et SEULEMENT ici, apparaissent en pied de page) ── */}
      <InsertZone pageKey="home" slot="page-bottom" />
      <DynamicBlockSlot pageKey="home" slot="page-bottom" />

      {/* IMPORTANT : on ne rend plus <DynamicBlockRenderer pageKey="home" /> sans filtre ici,
          car ça ré-affichait *tous* les anciens blocs en bas. Les blocs sans `slot` resteront
          en base mais ne seront plus rendus tant qu'on ne leur ajoute pas un slot. */}
    </main>
  );
}
