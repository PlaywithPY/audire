'use client';

// =====================================================
// Page publique appareil — utilise DevicePageRenderer
// =====================================================
// Fait UNE chose : fetch le HearingAid via /api/hearing-aids/[slug]
// et délègue le rendu au DevicePageRenderer partagé.
//
// La logique de visibilité par bloc (champ JSON blockVisibility)
// est gérée dans le renderer via parseBlockVisibility().

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DevicePageRenderer, { HearingAidData } from '@/components/devices/DevicePageRenderer';
import { parseBlockVisibility } from '@/lib/deviceBlocks';

interface AnyProductRow extends HearingAidData {
  // tolère des champs supplémentaires renvoyés par l'API (contentBlocks, etc.)
  [k: string]: unknown;
}

export default function HearingAidPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [product, setProduct]   = useState<AnyProductRow | null>(null);
  const [allProducts, setAllProducts] = useState<HearingAidData[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/hearing-aids/${slug}`);
        if (!res.ok) throw new Error('Produit non trouvé');
        const data = await res.json();
        if (cancelled) return;
        setProduct(data);

        const allRes = await fetch('/api/hearing-aids');
        if (allRes.ok) {
          const allData = await allRes.json();
          if (!cancelled) setAllProducts(allData);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (slug) load();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
          <p className="text-gray-600 mb-6">{error || "Ce produit n'existe pas."}</p>
          {allProducts.length > 0 && (
            <div className="mb-6 max-w-md mx-auto">
              <label htmlFor="product-selector-error" className="block text-sm font-medium text-gray-700 mb-2">
                Choisir un appareil auditif :
              </label>
              <select
                id="product-selector-error"
                onChange={(e) => e.target.value && router.push(`/appareils/${e.target.value}`)}
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
          <Link href="/solutions-auditives" className="inline-block px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition">
            Retour aux solutions
          </Link>
        </div>
      </main>
    );
  }

  const visibility = parseBlockVisibility(product.blockVisibility);

  return (
    <main className="min-h-screen">
      <DevicePageRenderer product={product} visibility={visibility} />
    </main>
  );
}
