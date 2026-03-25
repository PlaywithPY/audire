'use client';

import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string>('');

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

  const handleSeedDatabase = async () => {
    if (!confirm('Êtes-vous sûr de vouloir initialiser la base de données ? Cela va ajouter/mettre à jour les données par défaut.')) {
      return;
    }

    setIsSeeding(true);
    setSeedMessage('');

    try {
      const response = await fetch('/api/admin/seed', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setSeedMessage('✅ Base de données initialisée avec succès !');
        // Recharger les FAQs
        const faqsRes = await fetch('/api/faqs');
        if (faqsRes.ok) {
          const faqsData = await faqsRes.json();
          setFaqs(faqsData);
        }
      } else {
        setSeedMessage('❌ Erreur : ' + (data.error || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Error seeding database:', error);
      setSeedMessage('❌ Erreur lors de l\'initialisation de la base de données');
    } finally {
      setIsSeeding(false);
    }
  };
  return (
    <>
      <Header />
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
                <p className="text-gray-500 mb-6">Aucune question disponible pour le moment.</p>
                <button
                  onClick={handleSeedDatabase}
                  disabled={isSeeding}
                  className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSeeding ? '⏳ Initialisation en cours...' : '🌱 Initialiser la base de données'}
                </button>
                {seedMessage && (
                  <p className="mt-4 text-lg font-medium">{seedMessage}</p>
                )}
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

            {/* Admin: Database Seed Button */}
            <div className="mt-12 pt-12 border-t border-gray-200">
              <h3 className="text-2xl font-bold mb-4">Administration</h3>
              <p className="text-text-light mb-6">Initialiser ou mettre à jour les données de la base</p>
              <button
                onClick={handleSeedDatabase}
                disabled={isSeeding}
                className="bg-secondary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-secondary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-primary"
              >
                {isSeeding ? '⏳ Initialisation en cours...' : '🌱 Initialiser la base de données'}
              </button>
              {seedMessage && (
                <p className="mt-4 text-lg font-medium">{seedMessage}</p>
              )}
            </div>
          </div>
        </section>

        {/* Image Effects */}
        <AllPageImageEffects pageKey="faq" />
      </main>
      <Footer />
    </>
  );
}
