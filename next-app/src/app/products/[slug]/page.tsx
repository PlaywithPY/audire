import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';

type Props = {
  params: { slug: string };
};

// Générer les métadonnées pour le SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  });

  if (!product) {
    return {
      title: 'Produit non trouvé - Audire',
    };
  }

  return {
    title: product.metaTitle || `${product.name} - Audire`,
    description:
      product.metaDescription || product.shortDescription || `Découvrez ${product.name}`,
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      hearingLossCategory: true,
      deviceType: true,
    },
  });

  if (!product || !product.isVisible) {
    notFound();
  }

  // Parser les features, pros et cons
  let features: Record<string, any> = {};
  let pros: string[] = [];
  let cons: string[] = [];

  try {
    features = product.features ? JSON.parse(product.features) : {};
  } catch (e) {
    console.error('Error parsing features:', e);
  }

  try {
    pros = product.pros ? JSON.parse(product.pros) : [];
  } catch (e) {
    console.error('Error parsing pros:', e);
  }

  try {
    cons = product.cons ? JSON.parse(product.cons) : [];
  } catch (e) {
    console.error('Error parsing cons:', e);
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section avec image */}
        <section className="relative bg-gradient-to-br from-primary/10 to-primary-light/10 py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Image du produit */}
              <div className="w-full lg:w-1/2">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.imageAlt || product.name}
                    className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl"
                    style={{ objectPosition: product.imagePosition }}
                  />
                ) : (
                  <div className="w-full max-w-lg mx-auto h-96 bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-2xl shadow-2xl flex items-center justify-center">
                    <span className="text-9xl">🦻</span>
                  </div>
                )}
              </div>

              {/* Informations principales */}
              <div className="w-full lg:w-1/2">
                <div className="max-w-2xl">
                  {/* Badge */}
                  <div className="flex gap-2 mb-4">
                    <span className="inline-block bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                      {product.brand}
                    </span>
                    {product.deviceType && (
                      <span className="inline-block bg-secondary text-primary px-4 py-2 rounded-full text-sm font-semibold">
                        {product.deviceType.name}
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
                        ⭐ Recommandé
                      </span>
                    )}
                  </div>

                  <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary-dark">
                    {product.name}
                  </h1>

                  {product.model && (
                    <p className="text-xl text-text-light mb-4">Modèle : {product.model}</p>
                  )}

                  <p className="text-xl text-text-light mb-6 leading-relaxed">
                    {product.shortDescription}
                  </p>

                  {/* Prix */}
                  {(product.price || product.priceRange) && (
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                      <h3 className="text-sm font-semibold text-gray-600 mb-2">Prix indicatif</h3>
                      <p className="text-3xl font-bold text-primary">
                        {product.price
                          ? `${product.price}€`
                          : product.priceRange || 'Sur demande'}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        * Prix susceptible de varier selon vos besoins
                      </p>
                    </div>
                  )}

                  {/* Catégorie de perte auditive */}
                  {product.hearingLossCategory && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                      <h3 className="text-sm font-semibold text-blue-900 mb-2">
                        👂 Adapté pour :
                      </h3>
                      <p className="text-blue-800 font-medium">
                        Perte auditive {product.hearingLossCategory.name.toLowerCase()}
                        {product.hearingLossCategory.minDb && product.hearingLossCategory.maxDb && (
                          <span className="text-sm ml-2">
                            ({product.hearingLossCategory.minDb} - {product.hearingLossCategory.maxDb}{' '}
                            dB)
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href="/test-auditif-gratuit"
                      className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-dark transition-all shadow-lg text-center"
                    >
                      📅 Prendre rendez-vous
                    </a>
                    <a
                      href="/contact"
                      className="inline-block bg-white text-primary border-2 border-primary px-8 py-4 rounded-xl font-semibold hover:bg-primary/5 transition-all text-center"
                    >
                      💬 Nous contacter
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Description complète */}
        {product.fullDescription && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-6 text-primary-dark">Description complète</h2>
                <div className="prose prose-lg max-w-none text-text-light leading-relaxed">
                  {product.fullDescription.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Caractéristiques techniques */}
        {Object.keys(features).length > 0 && (
          <section className="py-16 bg-gradient-to-br from-primary/5 to-primary-light/5">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-8 text-primary-dark text-center">
                  ⚙️ Caractéristiques techniques
                </h2>
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(features).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-3">
                        <span className="text-primary text-xl">✓</span>
                        <div>
                          <dt className="font-semibold text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </dt>
                          <dd className="text-text-light">
                            {typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : String(value)}
                          </dd>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Avantages et Inconvénients */}
        {(pros.length > 0 || cons.length > 0) && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold mb-8 text-primary-dark text-center">
                  ⚖️ Points clés
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Avantages */}
                  {pros.length > 0 && (
                    <div className="bg-green-50 rounded-2xl p-8">
                      <h3 className="text-2xl font-bold mb-6 text-green-700 flex items-center gap-3">
                        <span className="text-4xl">✅</span>
                        Avantages
                      </h3>
                      <ul className="space-y-4">
                        {pros.map((pro, idx) => (
                          <li key={idx} className="flex items-baseline gap-3">
                            <span className="text-green-600 text-xl flex-shrink-0">•</span>
                            <span className="text-text-light">{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Inconvénients */}
                  {cons.length > 0 && (
                    <div className="bg-orange-50 rounded-2xl p-8">
                      <h3 className="text-2xl font-bold mb-6 text-orange-700 flex items-center gap-3">
                        <span className="text-4xl">⚠️</span>
                        Points d'attention
                      </h3>
                      <ul className="space-y-4">
                        {cons.map((con, idx) => (
                          <li key={idx} className="flex items-baseline gap-3">
                            <span className="text-orange-600 text-xl flex-shrink-0">•</span>
                            <span className="text-text-light">{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA Final */}
        <section className="py-20 bg-gradient-to-br from-primary to-primary-dark text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Intéressé par le {product.name} ?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Prenez rendez-vous pour un test auditif gratuit et découvrez si cet appareil est fait
              pour vous.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/test-auditif-gratuit"
                className="inline-block bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg"
              >
                📅 Prendre rendez-vous
              </a>
              <a
                href="/solutions-auditives"
                className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all"
              >
                ← Voir toutes les solutions
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
