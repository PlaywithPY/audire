'use client';

import FAQAccordion from "@/components/FAQAccordion";
import AllPageImageEffects from "@/components/AllPageImageEffects";
import { useState, useEffect } from "react";

interface FAQ {
  question: string;
  answer: string;
}

interface PageTexts {
  [key: string]: string;
}

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [texts, setTexts] = useState<PageTexts>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Charger les FAQs depuis l'API
        const faqsRes = await fetch('/api/faqs');
        if (faqsRes.ok) {
          const faqsData = await faqsRes.json();
          setFaqs(faqsData);
        }

        // Charger les textes de la page
        const textsRes = await fetch('/api/page-texts?pageKey=faq');
        if (textsRes.ok) {
          const textsData = await textsRes.json();
          setTexts(textsData);
        }
      } catch (error) {
        console.error('Error loading FAQ data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <>
      <main className="min-h-screen">
        {/* Hero Section */}
        <section data-section="hero" className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                {texts['hero-kicker'] || 'Vos questions'}
              </span>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                {texts['hero-title'] || 'Questions fréquentes'}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                {texts['hero-description'] || 'Vous vous posez des questions sur les appareils auditifs, les remboursements ou notre accompagnement ? Vous trouverez ici les réponses aux questions les plus fréquentes.'}
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Chargement des questions...</p>
              </div>
            ) : faqs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucune question disponible pour le moment.</p>
              </div>
            ) : (
              <FAQAccordion faqs={faqs} />
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">{texts['cta-title'] || 'Vous ne trouvez pas votre réponse ?'}</h2>
            <p className="text-xl text-text-light mb-8 max-w-2xl mx-auto">
              {texts['cta-description'] || 'Contactez-nous ! Nous sommes là pour répondre à toutes vos questions.'}
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
        <AllPageImageEffects pageKey="faq" />
      </main>
    </>
  );
}
