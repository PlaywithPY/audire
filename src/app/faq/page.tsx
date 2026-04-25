'use client';

import FAQAccordion from "@/components/FAQAccordion";
import CategoryGrid from "@/components/CategoryGrid";
import AllPageImageEffects from "@/components/AllPageImageEffects";
import DynamicBlockRenderer from "@/components/DynamicBlockRenderer";
import { useState, useEffect } from "react";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  description: string | null;
  order: number;
  faqs: FAQ[];
}

interface PageTexts {
  [key: string]: string;
}

export default function FAQ() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allFaqs, setAllFaqs] = useState<FAQ[]>([]);
  const [displayedFaqs, setDisplayedFaqs] = useState<FAQ[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [texts, setTexts] = useState<PageTexts>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Charger les catégories avec leurs FAQs
        const categoriesRes = await fetch('/api/categories');
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);

          // Extraire toutes les FAQs de toutes les catégories
          const allFaqsFromCategories = categoriesData.flatMap((cat: Category) => cat.faqs);
          setAllFaqs(allFaqsFromCategories);
          setDisplayedFaqs(allFaqsFromCategories);
        }

        // Charger aussi les FAQs sans catégorie
        const faqsRes = await fetch('/api/faqs');
        if (faqsRes.ok) {
          const faqsData = await faqsRes.json();
          // Si on a des FAQs qui ne sont pas dans les catégories, les ajouter
          const uncategorizedFaqs = faqsData.filter(
            (faq: FAQ) => !allFaqs.some((f: FAQ) => f.id === faq.id)
          );
          if (uncategorizedFaqs.length > 0) {
            setAllFaqs(prev => [...prev, ...uncategorizedFaqs]);
            setDisplayedFaqs(prev => [...prev, ...uncategorizedFaqs]);
          }
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

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    if (categoryId === null) {
      // Afficher toutes les FAQs
      setDisplayedFaqs(allFaqs);
    } else {
      // Afficher seulement les FAQs de la catégorie sélectionnée
      const category = categories.find(cat => cat.id === categoryId);
      setDisplayedFaqs(category?.faqs || []);
    }
  };

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

        {/* Categories et FAQ Accordion */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Chargement des questions...</p>
              </div>
            ) : (
              <>
                {/* Grille de catégories */}
                {categories.length > 0 && (
                  <CategoryGrid
                    categories={categories}
                    onSelectCategory={handleCategorySelect}
                  />
                )}

                {/* FAQ Accordion */}
                {displayedFaqs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Aucune question disponible pour le moment.</p>
                  </div>
                ) : (
                  <>
                    {selectedCategory !== null && (
                      <h3 className="text-2xl font-bold mb-6 text-center">
                        {categories.find(cat => cat.id === selectedCategory)?.name}
                      </h3>
                    )}
                    <FAQAccordion faqs={displayedFaqs} />
                  </>
                )}
              </>
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

        <DynamicBlockRenderer pageKey="faq" />
        {/* Image Effects */}
        <AllPageImageEffects pageKey="faq" />
      </main>
    </>
  );
}
