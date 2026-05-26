'use client';

// =====================================================
// /admin/appareils-v2 — liste des appareils (Sprint 5.10)
// =====================================================
// Vue en grille avec actions rapides :
//   - Toggle "Mis en avant" (isHighlight)
//   - Toggle "Visible en ligne" (isVisible)
//   - Dupliquer (POST /api/admin/hearing-aids/duplicate?id=X)
//   - Supprimer
// + Tri (par ordre / nom / marque / date)

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Ear, ExternalLink, Sparkles, ArrowRight, Star, Copy, Trash2, Eye, EyeOff,
  ArrowUpDown, Loader2,
} from 'lucide-react';

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
  order: number;
  updatedAt: string;
}

type SortKey = 'order' | 'name' | 'brand' | 'updatedAt';

export default function AppareilsV2ListPage() {
  const router = useRouter();
  const [items, setItems] = useState<HearingAid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [busyId, setBusyId]   = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('order');

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

  const sorted = useMemo(() => {
    const arr = [...items];
    arr.sort((a, b) => {
      switch (sortKey) {
        case 'name':      return a.name.localeCompare(b.name);
        case 'brand':     return (a.brand || '').localeCompare(b.brand || '') || a.name.localeCompare(b.name);
        case 'updatedAt': return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'order':
        default:
          return (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name);
      }
    });
    return arr;
  }, [items, sortKey]);

  async function patchItem(id: number, patch: Partial<HearingAid>) {
    setBusyId(id);
    // Optimistic UI
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    try {
      const it = items.find((p) => p.id === id);
      if (!it) return;
      const res = await fetch('/api/admin/hearing-aids', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...it, ...patch }),
      });
      if (!res.ok) throw new Error('Échec de la sauvegarde');
      const saved = await res.json();
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...saved } : p)));
    } catch (e) {
      // Rollback
      setItems((prev) => prev.map((p) => (p.id === id ? items.find((x) => x.id === id)! : p)));
      alert(`Erreur : ${e instanceof Error ? e.message : 'inconnue'}`);
    } finally {
      setBusyId(null);
    }
  }

  async function duplicate(id: number) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/hearing-aids/duplicate?id=${id}`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Échec de la duplication');
      }
      const created = await res.json();
      // On va directement sur l'éditeur de la nouvelle copie
      if (created?.slug) router.push(`/admin/appareils-v2/${created.slug}`);
    } catch (e) {
      alert(`Erreur : ${e instanceof Error ? e.message : 'inconnue'}`);
    } finally {
      setBusyId(null);
    }
  }

  async function removeItem(it: HearingAid) {
    if (!confirm(`Supprimer définitivement « ${it.name} » ?\nCette action est irréversible.`)) return;
    setBusyId(it.id);
    try {
      const res = await fetch(`/api/admin/hearing-aids?id=${it.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Échec de la suppression');
      setItems((prev) => prev.filter((p) => p.id !== it.id));
    } catch (e) {
      alert(`Erreur : ${e instanceof Error ? e.message : 'inconnue'}`);
    } finally {
      setBusyId(null);
    }
  }

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
              Édition bloc-par-bloc des fiches appareil. Survolez une carte pour les
              actions rapides : dupliquer, mettre en avant, masquer, supprimer.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-gray-500">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Trier par
            </label>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="text-sm border border-gray-200 rounded-md px-2.5 py-1.5 bg-white"
            >
              <option value="order">Ordre du catalogue</option>
              <option value="name">Nom</option>
              <option value="brand">Marque</option>
              <option value="updatedAt">Dernière modification</option>
            </select>
            <Link
              href="/admin/appareils"
              className="text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200"
              title="Ancien éditeur (formulaire complet)"
            >
              Éditeur legacy
            </Link>
          </div>
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

        {!loading && !error && sorted.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Ear className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-2 font-medium">Aucun appareil en base</p>
            <p className="text-gray-500 text-sm mb-5">Créez votre premier appareil pour commencer.</p>
            <Link href="/admin/appareils" className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">
              Ouvrir l'éditeur legacy pour créer
            </Link>
          </div>
        )}

        {!loading && !error && sorted.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((it) => (
              <DeviceCard
                key={it.id}
                item={it}
                busy={busyId === it.id}
                onToggleHighlight={() => patchItem(it.id, { isHighlight: !it.isHighlight })}
                onToggleVisible={() => patchItem(it.id, { isVisible: !it.isVisible })}
                onDuplicate={() => duplicate(it.id)}
                onDelete={() => removeItem(it)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// Card
// =====================================================
function DeviceCard({
  item, busy,
  onToggleHighlight, onToggleVisible, onDuplicate, onDelete,
}: {
  item: HearingAid;
  busy: boolean;
  onToggleHighlight: () => void;
  onToggleVisible:   () => void;
  onDuplicate:       () => void;
  onDelete:          () => void;
}) {
  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-md transition">
      {/* Image cliquable pour ouvrir l'éditeur */}
      <Link href={`/admin/appareils-v2/${item.slug}`}
            className={`block aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden ${!item.isVisible ? 'opacity-60' : ''}`}>
        {(item.heroImage || item.mainImage) ? (
          <img src={item.heroImage || item.mainImage || ''} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-gray-300">
            <Ear className="w-10 h-10" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1.5">
          {item.isHighlight && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Mis en avant
            </span>
          )}
          {!item.isVisible && (
            <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 text-[10px] font-semibold uppercase tracking-wider">
              Brouillon
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/admin/appareils-v2/${item.slug}`}
              className="block">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-gray-700">{item.name}</h3>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-700 group-hover:translate-x-0.5 transition shrink-0 mt-0.5" />
          </div>
          <p className="text-xs text-gray-500">
            {item.brand}{item.range ? ` · ${item.range}` : ''}{item.type ? ` · ${item.type}` : ''}
          </p>
          {item.shortDesc && (
            <p className="text-xs text-gray-600 mt-2 line-clamp-2">{item.shortDesc}</p>
          )}
        </Link>

        {/* Actions rapides — toujours visibles sur mobile, hover-only desktop pour rester aéré */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1 opacity-100 sm:opacity-60 sm:group-hover:opacity-100 transition">
          <button type="button" onClick={onToggleHighlight} disabled={busy}
                  title={item.isHighlight ? 'Retirer du « mis en avant »' : 'Mettre en avant sur le site'}
                  className={`p-1.5 rounded-md transition ${
                    item.isHighlight
                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}>
            <Star className={`w-4 h-4 ${item.isHighlight ? 'fill-amber-500' : ''}`} />
          </button>
          <button type="button" onClick={onToggleVisible} disabled={busy}
                  title={item.isVisible ? 'Masquer en ligne' : 'Publier'}
                  className={`p-1.5 rounded-md transition ${
                    !item.isVisible
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}>
            {item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button type="button" onClick={onDuplicate} disabled={busy}
                  title="Dupliquer cet appareil"
                  className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700">
            <Copy className="w-4 h-4" />
          </button>
          <button type="button" onClick={onDelete} disabled={busy}
                  title="Supprimer"
                  className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 ml-auto">
            <Trash2 className="w-4 h-4" />
          </button>
          {busy && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400 ml-1" />}
        </div>
      </div>
    </div>
  );
}
