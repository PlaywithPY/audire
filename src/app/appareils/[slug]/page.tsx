'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface HearingAid {
  id: number;
  slug: string;
  name: string;
  brand: string;
  range: string | null;
  type: string | null;
  shortDesc: string | null;
  fullDesc: string | null;
  mainImage: string | null;
  gallery: string | null;
  features: string | null;
  technicalSpecs: string | null;
  price: string | null;
  isHighlight: boolean;
  isVisible: boolean;
}

export default function HearingAidPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<HearingAid | null>(null);
  const [allProducts, setAllProducts] = useState<HearingAid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);

        // Charger le produit actuel
        const productRes = await fetch(`/api/hearing-aids/${slug}`);
        if (!productRes.ok) {
          throw new Error('Produit non trouvé');
        }
        const productData = await productRes.json();
        setProduct(productData);

        // Charger tous les produits pour le dropdown
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
        <Header />
        <main className="min-h-screen bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
              <p className="text-gray-600 mb-6">{error || 'Ce produit n\'existe pas ou n\'est plus disponible.'}</p>
              <Link href="/solutions-auditives" className="btn-primary">
                Retour aux solutions
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const features = product.features ? JSON.parse(product.features) : [];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* DROPDOWN TEMPORAIRE - À RETIRER PLUS TARD */}
        <div className="bg-yellow-100 border-b-2 border-yellow-300 py-3">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-4">
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

        {/* Hero Section */}
        <section className="py-12 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className="relative">
                <div className="aspect-square bg-white rounded-2xl shadow-lg overflow-hidden">
                  {product.mainImage ? (
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-6xl">🦻</span>
                    </div>
                  )}
                </div>
                {product.isHighlight && (
                  <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    ⭐ Recommandé
                  </div>
                )}
              </div>

              {/* Info */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                    {product.brand}
                  </span>
                  {product.range && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-600">{product.range}</span>
                    </>
                  )}
                  {product.type && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-600">{product.type}</span>
                    </>
                  )}
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                {product.shortDesc && (
                  <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                    {product.shortDesc}
                  </p>
                )}

                {product.price && (
                  <div className="mb-6 p-4 bg-white rounded-lg border-2 border-primary/20">
                    <div className="text-sm text-gray-600 mb-1">Prix indicatif</div>
                    <div className="text-2xl font-bold text-primary">{product.price}</div>
                    <div className="text-xs text-gray-500 mt-1">Par oreille • Remboursement mutuelle possible</div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/test-auditif-gratuit"
                    className="btn-primary text-center"
                  >
                    Prendre rendez-vous
                  </Link>
                  <Link
                    href="/contact"
                    className="btn-secondary text-center"
                  >
                    Poser une question
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Description complète */}
        {product.fullDesc && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">À propos</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {product.fullDesc}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Caractéristiques */}
        {features.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Caractéristiques principales</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {features.map((feature: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm"
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary text-sm">✓</span>
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-primary to-primary-dark text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Intéressé par cet appareil ?</h2>
              <p className="text-xl text-white/90 mb-8">
                Venez l'essayer gratuitement pendant 30 jours. Aucun engagement, juste le temps de vous assurer qu'il correspond à vos besoins.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/test-auditif-gratuit" className="btn-white">
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
      <Footer />
    </>
  );
}
