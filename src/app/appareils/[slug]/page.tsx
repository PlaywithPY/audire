'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductContentBlock from '@/components/ProductContentBlock';
import Link from 'next/link';

interface HearingAid {
  id: number;
  slug: string;
  name: string;
  brand: string;
  range: string | null;
  type: string | null;
  shortDesc: string | null;
  price: string | null;
  isHighlight: boolean;

  // Hero
  heroGradientFrom: string | null;
  heroGradientTo: string | null;
  heroImage: string | null;
  heroDescription: string | null;

  // Avantages
  advantages: string | null;

  // Sections content
  section1Title: string | null;
  section1Description: string | null;
  section1MediaUrl: string | null;
  section1MediaType: string | null;

  section2Title: string | null;
  section2Description: string | null;
  section2Image: string | null;

  section3Title: string | null;
  section3Description: string | null;
  section3Image: string | null;

  section4Title: string | null;
  section4Description: string | null;
  section4MediaUrl: string | null;
  section4MediaType: string | null;

  // Highlight boxes
  highlightBox1Title: string | null;
  highlightBox1Description: string | null;
  highlightBox1Image: string | null;

  highlightBox2Images: string | null;
  highlightBox2Title: string | null;

  // FAQ
  productFAQs: string | null;

  // Blocs de contenu flexibles
  contentBlocks?: ContentBlock[];
}

interface Advantage {
  title: string;
  description: string;
  icon: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface ContentBlock {
  id: number;
  title: string | null;
  description: string | null;
  mediaUrl: string | null;
  mediaType: string;
  mediaAlt: string | null;
  mediaPosition: string;
  backgroundColor: string | null;
  order: number;
}

export default function HearingAidPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<HearingAid | null>(null);
  const [allProducts, setAllProducts] = useState<HearingAid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);

        const productRes = await fetch(`/api/hearing-aids/${slug}`);
        if (!productRes.ok) {
          throw new Error('Produit non trouvé');
        }
        const productData = await productRes.json();
        setProduct(productData);

        const allRes = await fetch('/api/hearing-aids');
        if (allRes.ok) {
          const allData = await allRes.json();
          setAllProducts(allData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <>
        <main className="min-h-screen bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <main className="min-h-screen bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
              <p className="text-gray-600 mb-6">{error || 'Ce produit n\'existe pas.'}</p>

              {/* Dropdown pour choisir un produit existant */}
              {allProducts.length > 0 && (
                <div className="mb-6 max-w-md mx-auto">
                  <label htmlFor="product-selector-error" className="block text-sm font-medium text-gray-700 mb-2">
                    Choisir un appareil auditif :
                  </label>
                  <select
                    id="product-selector-error"
                    onChange={(e) => {
                      if (e.target.value) {
                        router.push(`/appareils/${e.target.value}`);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    defaultValue=""
                  >
                    <option value="" disabled>Sélectionnez un appareil...</option>
                    {allProducts.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name} - {p.brand}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Link href="/solutions-auditives" className="btn-primary">
                Retour aux solutions
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  const advantages: Advantage[] = product.advantages ? JSON.parse(product.advantages) : [];
  const faqs: FAQ[] = product.productFAQs ? JSON.parse(product.productFAQs) : [];
  const highlightBox2Images: string[] = product.highlightBox2Images ? JSON.parse(product.highlightBox2Images) : [];

  return (
    <>
      <main className="min-h-screen bg-white">
        {/* 🚧 DROPDOWN TEMPORAIRE - À RETIRER PLUS TARD */}
        <div className="bg-yellow-100 border-b-2 border-yellow-300 py-3">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <label htmlFor="product-selector" className="font-semibold text-yellow-900">
                🚧 Dropdown temporaire - Choisir un appareil:
              </label>
              <select
                id="product-selector"
                value={slug}
                onChange={(e) => router.push(`/appareils/${e.target.value}`)}
                className="px-4 py-2 border border-yellow-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {allProducts.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name} - {p.brand}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-primary transition-colors">
                Accueil
              </Link>
              <span>/</span>
              <Link href="/solutions-auditives" className="hover:text-primary transition-colors">
                Solutions auditives
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* HERO SECTION avec dégradé + image */}
        <section className="relative overflow-hidden">
          {/* Image de fond */}
          {product.heroImage && (
            <div className="absolute inset-0">
              <img
                src={product.heroImage}
                alt={product.name}
                className="w-full h-full object-cover object-right"
                style={{ objectPosition: 'right center' }}
              />
            </div>
          )}

          {/* Dégradé par-dessus l'image */}
          <div className="absolute inset-0 z-10" style={{
            background: `linear-gradient(to right, ${product.heroGradientFrom || '#42a4ff'} 0%, ${product.heroGradientTo || '#5ab3ff'} 50%, transparent 80%)`,
          }}></div>

          <div className="relative z-20 container mx-auto px-4 py-20 md:py-32">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-semibold text-white uppercase tracking-wide">
                    {product.brand}
                  </span>
                  {product.range && (
                    <>
                      <span className="text-white/50">•</span>
                      <span className="text-sm text-white/90">{product.range}</span>
                    </>
                  )}
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  {product.name}
                </h1>

                {product.heroDescription && (
                  <p className="text-xl text-white/95 mb-8 leading-relaxed">
                    {product.heroDescription}
                  </p>
                )}

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/prendre-rendez-vous"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg"
                  >
                    Prendre rendez-vous
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-all border-2 border-white/30"
                  >
                    Appeler le centre
                  </Link>
                </div>
              </div>
              <div>{/* Espace pour l'image de fond */}</div>
            </div>
          </div>
        </section>

        {/* SECTION AVANTAGES avec icônes/images */}
        {advantages.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-6xl mx-auto">
                {advantages.map((advantage, index) => (
                  <div key={index} className="text-center">
                    <div className="mb-4 flex justify-center">
                      {advantage.icon.startsWith('http') || advantage.icon.startsWith('/') ? (
                        <img
                          src={advantage.icon}
                          alt={advantage.title}
                          className="w-16 h-16 object-contain"
                        />
                      ) : (
                        <span className="text-5xl">{advantage.icon}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {advantage.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {advantage.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SECTION 1: Description + Vidéo/Image (Texte gauche, Média droite) */}
        {product.section1Title && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    {product.section1Title}
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {product.section1Description}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  {product.section1MediaType === 'video' && product.section1MediaUrl ? (
                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-xl">
                      <video
                        src={product.section1MediaUrl}
                        controls
                        className="w-full h-full object-cover"
                      >
                        Votre navigateur ne supporte pas les vidéos.
                      </video>
                    </div>
                  ) : product.section1MediaUrl ? (
                    <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden shadow-xl">
                      <img
                        src={product.section1MediaUrl}
                        alt={product.section1Title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 2: Image gauche + Texte droite */}
        {product.section2Title && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                <div className="order-2 md:order-1">
                  {product.section2Image && (
                    <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden shadow-xl">
                      <img
                        src={product.section2Image}
                        alt={product.section2Title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <div className="order-1 md:order-2">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    {product.section2Title}
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {product.section2Description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* HIGHLIGHT BOX 1: Encadré clair avec image + texte + CTA */}
        {product.highlightBox1Title && (
          <section className="py-16 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="grid md:grid-cols-2 gap-8 items-center p-8 md:p-12">
                  <div>
                    {product.highlightBox1Image && (
                      <img
                        src={product.highlightBox1Image}
                        alt={product.highlightBox1Title}
                        className="w-full h-auto object-contain"
                      />
                    )}
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                      {product.highlightBox1Title}
                    </h2>
                    {product.highlightBox1Description && (
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {product.highlightBox1Description}
                      </p>
                    )}
                    <Link
                      href="/prendre-rendez-vous"
                      className="inline-block btn-primary"
                    >
                      Prendre rendez-vous
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 3: Image droite + Texte gauche */}
        {product.section3Title && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    {product.section3Title}
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {product.section3Description}
                    </p>
                  </div>
                </div>
                <div>
                  {product.section3Image && (
                    <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden shadow-xl">
                      <img
                        src={product.section3Image}
                        alt={product.section3Title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 4: Vidéo/Image gauche + Texte droite */}
        {product.section4Title && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                <div className="order-2 md:order-1">
                  {product.section4MediaType === 'video' && product.section4MediaUrl ? (
                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-xl">
                      <video
                        src={product.section4MediaUrl}
                        controls
                        className="w-full h-full object-cover"
                      >
                        Votre navigateur ne supporte pas les vidéos.
                      </video>
                    </div>
                  ) : product.section4MediaUrl ? (
                    <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden shadow-xl">
                      <img
                        src={product.section4MediaUrl}
                        alt={product.section4Title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}
                </div>
                <div className="order-1 md:order-2">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    {product.section4Title}
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {product.section4Description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* HIGHLIGHT BOX 2: Encadré avec plusieurs images + CTA */}
        {product.highlightBox2Title && highlightBox2Images.length > 0 && (
          <section className="py-16 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-8 md:p-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  {product.highlightBox2Title}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                  {highlightBox2Images.map((imageUrl, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-contain p-4"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <Link
                    href="/prendre-rendez-vous"
                    className="inline-block btn-primary"
                  >
                    Prendre rendez-vous
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* BLOCS DE CONTENU FLEXIBLES */}
        {product.contentBlocks && product.contentBlocks.length > 0 && (
          <>
            {product.contentBlocks.map((block) => (
              <ProductContentBlock key={block.id} block={block} />
            ))}
          </>
        )}

        {/* FAQ SECTION - Spécifique au produit */}
        {faqs.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Pourquoi choisir {product.name} ?
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                        className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
                      >
                        <span className="font-semibold text-gray-900">{faq.question}</span>
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform ${
                            expandedFAQ === index ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {expandedFAQ === index && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FORMULAIRE DE CONTACT */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                Une question sur {product.name} ?
              </h2>
              <p className="text-gray-600 text-center mb-8">
                Remplissez ce formulaire et nous vous recontacterons rapidement.
              </p>
              <form className="bg-white rounded-lg shadow-lg p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full btn-primary text-center"
                >
                  Envoyer ma demande
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-16 bg-gradient-to-br from-primary to-primary-dark text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Prêt à découvrir {product.name} ?</h2>
              <p className="text-xl text-white/90 mb-8">
                Venez l'essayer gratuitement pendant 30 jours. Sans engagement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/prendre-rendez-vous" className="btn-white">
                  Réserver un test gratuit
                </Link>
                <Link href="/solutions-auditives" className="btn-outline-white">
                  Voir tous les appareils
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
