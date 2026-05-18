'use client';

// =====================================================
// /admin/appareils-v2 — liste des appareils (sélecteur)
// =====================================================
// Vue "tableau de bord" simple : grille des appareils, chacun
// menant à l'éditeur structuré /admin/appareils-v2/[slug].

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Ear, Pencil, ExternalLink, Sparkles, ArrowRight } from 'lucide-react';

interface HearingAid {
  id: number;
  slug: string;
  name: string;
  brand: string;
  range: string | null;
  type: string | null;
  shortDesc: string | null;
  mainImage: string | null;
  heroImage: string | null;
  isHighlight: boolean;
  isVisible: boolean;
  updatedAt: string;
}

export default function AppareilsV2ListPage() {
  const [items, setItems] = useState<HearingAid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/hearing-aids');
        if (!res.ok) throw new Error('Impossible de charger la liste');
        const data = await res.json();
        if (!cancelled) setItems(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-start gap-4 flex-wrap">
          <div className="flex-1 min-w-[260px]">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-semibold text-gray-900">Appareils</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> Nouvel éditeur
              </span>
            </div>
            <p className="text-sm text-gray-500 max-w-xl">
              Édition bloc-par-bloc des fiches appareil, basée sur le gabarit Zeal.
              Sélectionnez un appareil pour ouvrir son éditeur.
            </p>
          </div>
          <Link
            href="/admin/appareils"
            className="text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 rounded-lg border border-amber-200 flex items-center gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" />
            Ouvrir l'éditeur legacy
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
                <div className="h-32 bg-gray-100 rounded-lg mb-4"></div>
                <div className="h-5 bg-gray-100 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            ⚠ {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Ear className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-2 font-medium">Aucun appareil en base</p>
            <p className="text-gray-500 text-sm mb-5">Créez votre premier appareil pour commencer.</p>
            <Link href="/admin/appareils" className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">
              Ouvrir l'éditeur legacy pour créer
            </Link>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((it) => (
              <Link
                key={it.id}
                href={`/admin/appareils-v2/${it.slug}`}
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-md transition"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden">
                  {(it.heroImage || it.mainImage) ? (
                    <img src={it.heroImage || it.mainImage || ''} alt={it.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-gray-300">
                      <Ear className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    {it.isHighlight && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold uppercase tracking-wider">Mis en avant</span>}
                    {!it.isVisible && <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 text-[10px] font-semibold uppercase tracking-wider">Brouillon</span>}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{it.name}</h3>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-700 group-hover:translate-x-0.5 transition shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs text-gray-500">
                    {it.brand}{it.range ? ` · ${it.range}` : ''}{it.type ? ` · ${it.type}` : ''}
                  </p>
                  {it.shortDesc && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{it.shortDesc}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
