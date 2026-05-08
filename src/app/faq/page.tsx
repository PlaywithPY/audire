'use client';

import FAQAccordion from "@/components/FAQAccordion";
import CategoryGrid from "@/components/CategoryGrid";
import AllPageImageEffects from "@/components/AllPageImageEffects";
import DynamicBlockRenderer from "@/components/DynamicBlockRenderer";
import { useState, useEffect, useMemo } from "react";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
  categoryId?: number | null;
  category?: { id: number; name: string } | null;
  // Enrichi côté client :
  categoryName?: string | null;
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
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [texts, setTexts] = useState<PageTexts>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Charger les catégories avec leurs FAQs (source de vérité pour la
        // correspondance FAQ ↔ catégorie)
        const categoriesRes = await fetch('/api/categories');
        let cats: Category[] = [];
        if (categoriesRes.ok) {
          cats = await categoriesRes.json();
          setCategories(cats);
        }

        // Construire une map { faqId → {categoryId, categoryName} }
        const catMap = new Map<number, { id: number; name: string }>();
        cats.forEach((cat) => {
          cat.faqs?.forEach((f) => {
            catMap.set(f.id, { id: cat.id, name: cat.name });
          });
        });

        // Charger toutes les FAQs (incluant les sans-catégorie)
        const faqsRes = await fetch('/api/faqs');
        let faqs: FAQ[] = [];
        if (faqsRes.ok) {
          faqs = await faqsRes.json();
        }

        // Enrichir chaque FAQ avec sa catégorie (depuis la map ou son propre champ)
        const enriched: FAQ[] = faqs.map((f) => {
          const fromMap = catMap.get(f.id);
          const catId = f.categoryId ?? fromMap?.id ?? null;
          const catName = f.category?.name ?? fromMap?.name ?? null;
          return { ...f, categoryId: catId, categoryName: catName };
        });

        setAllFaqs(enriched);

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

  // Filtrage en mémoire — pas de re-fetch nécessaire
  const displayedFaqs = useMemo(() => {
    if (selectedCategory === null) return allFaqs;
    return allFaqs.filter((f) => f.categoryId === selectedCategory);
  }, [allFaqs, selectedCategory]);

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  return (
    <>
      <main className="min-h-screen">
        {/* Hero Section */}
        <section data-section="hero" className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <span data-edit-block="faq.hero-kicker"
                    className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                {texts['hero-kicker'] || 'Vos questions'}
              </span>
              <h1 data-edit-block="faq.hero-title"
                  className="text-5xl md:text-6xl font-bold mb-6">
                {texts['hero-title'] || 'Questions fréquentes'}
              </h1>
              <p data-edit-block="faq.hero-description"
                 className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
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

                {/* En-tête de filtre actif */}
                {selectedCategory !== null && (
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <h3 className="text-2xl font-bold">
                      {categories.find((cat) => cat.id === selectedCategory)?.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory(null)}
                      className="text-sm text-primary hover:underline"
                    >
                      ← Toutes les catégories
                    </button>
                  </div>
                )}

                {/* FAQ Accordion */}
                {displayedFaqs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Aucune question disponible pour le moment.</p>
                  </div>
                ) : (
                  <FAQAccordion faqs={displayedFaqs} />
                )}
              </>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
          <div className="container mx-auto px-4 text-center">
            <h2 data-edit-block="faq.cta-title"
                className="text-4xl font-bold mb-4">
              {texts['cta-title'] || 'Vous ne trouvez pas votre réponse ?'}
            </h2>
            
            <p data-edit-block="faq.cta-description"
               className="text-xl text-text-light mb-8 max-w-2xl mx-auto">
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
