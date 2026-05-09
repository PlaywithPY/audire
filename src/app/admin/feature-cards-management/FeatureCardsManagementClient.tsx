'use client';

// src/app/admin/feature-cards-management/FeatureCardsManagementClient.tsx
// Gestion en lot des Feature Cards, calquée sur FaqManagementClient.
//
// Différences clé avec FAQ :
//  • Les cards sont *définies* dans `lib/card-definitions.ts` (code).
//    On ne crée pas de cards "from scratch" ici — on customise les cards définies.
//  • Save = direct (PUT /api/admin/card-images), pas de drafts/publish,
//    car l'API actuelle est en write-through. Si vous voulez batcher comme
//    pour FAQ, il faudra étendre useDrafts + /api/admin/publish.
//  • "Reset aux défauts" = DELETE /api/admin/card-images?id=N
//    (à ajouter côté API si pas encore présent — voir note en bas de fichier).

import { useEffect, useMemo, useState } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import ImageUploadModal from '@/components/ImageUploadModal';
import { getAllPages, type CardGroup } from '@/lib/card-definitions';
import { ImageIcon, RotateCcw, Save, Upload, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

type CardImage = {
  id: number;
  pageKey: string;
  cardKey: string;
  imageUrl: string;
  fallbackEmoji: string;
  imagePosition: string;
  href: string | null;
  title: string | null;
  description: string | null;
  imageAlt: string | null;
};

type CardDef = {
  cardKey: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
  imagePosition: string;
  fallbackEmoji: string;
};

type MergedCard = CardDef & {
  exists: boolean;
  current: CardImage | null;
  groupLabel?: string;
};

export default function FeatureCardsManagementClient() {
  const pages = getAllPages();
  const [activePage, setActivePage] = useState<string>(pages[0]?.pageKey ?? 'home');
  const [cardImages, setCardImages] = useState<CardImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCard, setOpenCard] = useState<string | null>(null);
  const [uploadFor, setUploadFor] = useState<{ pageKey: string; cardKey: string } | null>(null);
  const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/admin/card-images')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { if (Array.isArray(data)) setCardImages(data); })
      .finally(() => setLoading(false));
  }, []);

  const page = pages.find((p) => p.pageKey === activePage);

  // Construit la liste fusionnée : définitions + état actuel en base
  const mergedGroups = useMemo(() => {
    if (!page) return [];
    const groups: { groupKey: string; groupLabel: string; layout: string; cards: MergedCard[] }[] = [];

    if (page.groups && page.groups.length > 0) {
      page.groups.forEach((g: CardGroup) => {
        groups.push({
          groupKey: g.groupKey, groupLabel: g.groupLabel, layout: g.layout,
          cards: g.cards.map((d) => mergeCard(d, page.pageKey)),
        });
      });
    } else {
      groups.push({
        groupKey: 'default', groupLabel: 'Cards', layout: 'grid-3',
        cards: page.cards.map((d) => mergeCard(d, page.pageKey)),
      });
    }
    return groups;
  }, [page, cardImages]);

  function mergeCard(def: CardDef, pageKey: string): MergedCard {
    const current = cardImages.find((c) => c.pageKey === pageKey && c.cardKey === def.cardKey) ?? null;
    if (current) {
      return {
        ...def,
        title: current.title || def.title,
        description: current.description || def.description,
        imageSrc: current.imageUrl || def.imageSrc,
        imageAlt: current.imageAlt || def.imageAlt,
        href: current.href || def.href,
        imagePosition: current.imagePosition || def.imagePosition,
        fallbackEmoji: current.fallbackEmoji || def.fallbackEmoji,
        exists: true, current,
      };
    }
    return { ...def, exists: false, current: null };
  }

  function startSaving(key: string) { setSavingKeys((s) => new Set(s).add(key)); }
  function stopSaving(key: string) {
    setSavingKeys((s) => { const n = new Set(s); n.delete(key); return n; });
  }

  async function refreshOne() {
    const r = await fetch('/api/admin/card-images');
    if (r.ok) setCardImages(await r.json());
  }

  async function saveCard(merged: MergedCard, fields: Partial<CardImage>) {
    const key = `${activePage}:${merged.cardKey}`;
    startSaving(key);
    try {
      if (merged.exists && merged.current) {
        await fetch('/api/admin/card-images', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...merged.current, ...fields }),
        });
      } else {
        // Création : on injecte les défauts puis l'override
        await fetch('/api/admin/card-images', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageKey: activePage,
            cardKey: merged.cardKey,
            imageUrl: merged.imageSrc,
            fallbackEmoji: merged.fallbackEmoji,
            imagePosition: merged.imagePosition,
            href: merged.href,
            title: merged.title,
            description: merged.description,
            imageAlt: merged.imageAlt,
            ...fields,
          }),
        });
      }
      await refreshOne();
    } catch (e) {
      console.error(e); alert('Erreur de sauvegarde');
    } finally {
      stopSaving(key);
    }
  }

  async function resetCard(merged: MergedCard) {
    if (!merged.exists || !merged.current) return;
    if (!confirm(`Réinitialiser "${merged.title}" aux valeurs par défaut ?`)) return;
    const key = `${activePage}:${merged.cardKey}`;
    startSaving(key);
    try {
      const r = await fetch(`/api/admin/card-images?id=${merged.current.id}`, { method: 'DELETE' });
      if (!r.ok) {
        alert('La suppression n\'est pas encore supportée par l\'API. Voir la note en bas de FeatureCardsManagementClient.tsx');
        return;
      }
      await refreshOne();
    } finally {
      stopSaving(key);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <AdminTopbar crumbs={[{ label: 'Site web' }, { label: 'Cards visuelles' }]} />

      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-6xl mx-auto p-8 space-y-6">
          {/* Onglets de pages */}
          <div className="flex items-center gap-1 border-b border-gray-200 -mb-px overflow-x-auto">
            {pages.map((p) => (
              <button
                key={p.pageKey}
                type="button"
                onClick={() => { setActivePage(p.pageKey); setOpenCard(null); }}
                className={`px-3 py-2 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                  p.pageKey === activePage
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {p.pageLabel}
                <span className="ml-1.5 text-[11px] text-gray-400 font-mono">{p.cards.length}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-gray-500">Chargement…</p>
          ) : mergedGroups.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucune card définie pour cette page.</p>
          ) : (
            mergedGroups.map((g) => (
              <section key={g.groupKey} className="space-y-2">
                {mergedGroups.length > 1 && (
                  <header className="flex items-center gap-2 pt-2">
                    <h2 className="text-[14px] font-semibold text-gray-800">{g.groupLabel}</h2>
                    <span className="text-[11px] font-mono text-gray-400">{g.layout}</span>
                    <span className="ml-auto text-[11px] text-gray-400">{g.cards.length} card(s)</span>
                  </header>
                )}

                <div className="space-y-2">
                  {g.cards.map((c) => (
                    <CardRow
                      key={c.cardKey}
                      merged={c}
                      open={openCard === `${g.groupKey}:${c.cardKey}`}
                      saving={savingKeys.has(`${activePage}:${c.cardKey}`)}
                      onToggle={() =>
                        setOpenCard(openCard === `${g.groupKey}:${c.cardKey}` ? null : `${g.groupKey}:${c.cardKey}`)
                      }
                      onUpload={() => setUploadFor({ pageKey: activePage, cardKey: c.cardKey })}
                      onSave={(fields) => saveCard(c, fields)}
                      onReset={() => resetCard(c)}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      <ImageUploadModal
        isOpen={!!uploadFor}
        onClose={() => setUploadFor(null)}
        onImageSelected={async (imageUrl) => {
          if (!uploadFor) return;
          const group = mergedGroups.find((g) => g.cards.some((c) => c.cardKey === uploadFor.cardKey));
          const merged = group?.cards.find((c) => c.cardKey === uploadFor.cardKey);
          if (merged) await saveCard(merged, { imageUrl });
          setUploadFor(null);
        }}
      />
    </div>
  );
}

/* ─────────── ROW ─────────── */

function CardRow({
  merged, open, saving, onToggle, onUpload, onSave, onReset,
}: {
  merged: MergedCard; open: boolean; saving: boolean;
  onToggle: () => void; onUpload: () => void;
  onSave: (fields: Partial<CardImage>) => void; onReset: () => void;
}) {
  // Local state pour l'édition (apply on blur ou bouton Sauvegarder)
  const [title, setTitle] = useState(merged.title);
  const [description, setDescription] = useState(merged.description);
  const [href, setHref] = useState(merged.href || '');
  const [imagePosition, setImagePosition] = useState(merged.imagePosition);
  const [fallbackEmoji, setFallbackEmoji] = useState(merged.fallbackEmoji);
  const [imageAlt, setImageAlt] = useState(merged.imageAlt);

  // Sync quand merged change (après refresh)
  useEffect(() => {
    setTitle(merged.title); setDescription(merged.description);
    setHref(merged.href || ''); setImagePosition(merged.imagePosition);
    setFallbackEmoji(merged.fallbackEmoji); setImageAlt(merged.imageAlt);
  }, [merged.cardKey, merged.title, merged.description, merged.href, merged.imagePosition, merged.fallbackEmoji, merged.imageAlt]);

  const dirty =
    title !== merged.title ||
    description !== merged.description ||
    href !== (merged.href || '') ||
    imagePosition !== merged.imagePosition ||
    fallbackEmoji !== merged.fallbackEmoji ||
    imageAlt !== merged.imageAlt;

  function handleSave() {
    onSave({
      title: title || null,
      description: description || null,
      href: href || null,
      imagePosition,
      fallbackEmoji,
      imageAlt: imageAlt || null,
    });
  }

  return (
    <div className={`rounded-lg border bg-white ${merged.exists ? 'border-gray-200' : 'border-dashed border-gray-300'}`}>
      {/* Ligne d'en-tête */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50/50 transition-colors"
      >
        {/* Mini-preview */}
        <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 grid place-items-center shrink-0 border border-gray-100">
          {merged.imageSrc && merged.imageSrc.trim() ? (
            <img
              src={merged.imageSrc} alt=""
              className="w-full h-full object-cover"
              style={{ objectPosition: merged.imagePosition }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <span className="text-2xl">{merged.fallbackEmoji}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-gray-900 truncate">{merged.title}</span>
            {!merged.exists && (
              <span className="text-[10px] uppercase tracking-wider font-mono text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                défaut
              </span>
            )}
          </div>
          <p className="text-[12px] text-gray-500 truncate">{merged.description}</p>
        </div>

        <code className="text-[10px] font-mono text-gray-400 px-2 py-1 bg-gray-50 rounded">{merged.cardKey}</code>
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>

      {/* Drawer d'édition */}
      {open && (
        <div className="border-t border-gray-100 p-4 bg-gray-50/40 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Colonne gauche : preview + image */}
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
              <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden relative">
                {merged.imageSrc && merged.imageSrc.trim() ? (
                  <img
                    src={merged.imageSrc} alt={imageAlt || title}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: imagePosition }}
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center">
                    <span className="text-5xl">{fallbackEmoji}</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h4 className="text-[14px] font-semibold">{title}</h4>
                <p className="text-[12px] text-gray-500 mt-1">{description}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button" onClick={onUpload}
                className="flex-1 h-8 px-3 rounded-md bg-gray-900 text-white text-[12px] font-medium hover:bg-black flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3 h-3" /> Changer l'image
              </button>
              {merged.exists && (
                <button
                  type="button" onClick={onReset} disabled={saving}
                  className="h-8 px-3 rounded-md border border-gray-300 text-gray-700 text-[12px] font-medium hover:bg-white flex items-center gap-1.5 disabled:opacity-50"
                  title="Réinitialiser aux défauts définis dans le code"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            <div className="space-y-1">
              <Label>Position de l'image</Label>
              <input
                value={imagePosition} onChange={(e) => setImagePosition(e.target.value)}
                className="w-full text-[12px] px-2 py-1.5 border border-gray-200 rounded bg-white"
                placeholder="center 35%"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {['center center', 'center 35%', 'center 60%', 'center top', 'center bottom'].map((preset) => (
                  <button
                    key={preset} type="button" onClick={() => setImagePosition(preset)}
                    className={`text-[10px] px-2 py-0.5 rounded border ${
                      imagePosition === preset ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Emoji de secours</Label>
              <input
                value={fallbackEmoji} onChange={(e) => setFallbackEmoji(e.target.value)}
                className="w-full text-[12px] px-2 py-1.5 border border-gray-200 rounded bg-white"
                maxLength={4}
              />
            </div>
          </div>

          {/* Colonne droite : champs texte */}
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Titre</Label>
              <input
                value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full text-[13px] px-2 py-1.5 border border-gray-200 rounded bg-white"
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
                className="w-full text-[12px] px-2 py-1.5 border border-gray-200 rounded bg-white resize-y"
              />
            </div>
            <div className="space-y-1">
              <Label>Lien (href)</Label>
              <div className="flex gap-2">
                <input
                  value={href} onChange={(e) => setHref(e.target.value)}
                  className="flex-1 text-[12px] px-2 py-1.5 border border-gray-200 rounded bg-white"
                  placeholder="/destination"
                />
                {href && (
                  <a href={href} target="_blank" rel="noreferrer"
                    className="h-7 px-2 rounded border border-gray-200 text-gray-600 hover:bg-white flex items-center gap-1 text-[11px]">
                    <ExternalLink className="w-3 h-3" /> Test
                  </a>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Texte alt (accessibilité)</Label>
              <input
                value={imageAlt} onChange={(e) => setImageAlt(e.target.value)}
                className="w-full text-[12px] px-2 py-1.5 border border-gray-200 rounded bg-white"
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-200 mt-3">
              <button
                type="button" onClick={handleSave} disabled={!dirty || saving}
                className="h-8 px-4 rounded-md bg-gray-900 text-white text-[12px] font-medium hover:bg-black flex items-center gap-1.5 disabled:opacity-40"
              >
                <Save className="w-3 h-3" />
                {saving ? 'Sauvegarde…' : dirty ? 'Sauvegarder' : 'À jour'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] uppercase tracking-wider font-mono text-gray-500 block">
      {children}
    </label>
  );
}

/* ─────────── NOTE API ───────────
 *
 * Pour que le bouton "Reset" fonctionne, ajoutez un handler DELETE à
 * /api/admin/card-images/route.ts :
 *
 *   export async function DELETE(req: Request) {
 *     const url = new URL(req.url);
 *     const id = Number(url.searchParams.get('id'));
 *     if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
 *     await prisma.cardImage.delete({ where: { id } });
 *     return NextResponse.json({ ok: true });
 *   }
 *
 * Sans ça, le bouton Reset retournera une alerte mais ne cassera rien.
 */
