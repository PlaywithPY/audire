'use client';

// =====================================================
// /admin/appareils-v2/[slug] — Éditeur structuré (v2.1)
// =====================================================
// v2.1 :
//  - Zones d'insertion "+" entre chaque bloc fixe du rail
//  - Modal pour choisir un type de bloc à insérer (text-media / gallery / highlight)
//  - Inspector pour les blocs insérés (édition complète)
//  - MediaPicker dans tous les champs média (mediathèque + focal point)

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Eye, EyeOff, Save, ExternalLink, Plus, Trash2,
  ChevronLeft, ChevronRight, Check, Loader2, Sparkles, AlertCircle,
  Columns, GalleryHorizontalEnd, X, Image as ImageIcon,
  MoveUp, MoveDown,
} from 'lucide-react';
import DevicePageRenderer, { HearingAidData, Advantage, FAQ } from '@/components/devices/DevicePageRenderer';
import {
  BLOCKS, BlockId, BlockDef, parseBlockVisibility, defaultVisibility,
  ProductContentBlockData, ContentBlockType, CONTENT_BLOCK_TYPES,
  defaultContentBlock, parseMetadata, GalleryMetadata, HighlightMetadata,
  parseImagePositions, getFocal, FocalPoint, ImagePositions,
  parseKickers, DEFAULT_KICKERS, KickerKey, SectionKickers,
  parseHeroBadges, HeroBadge,
} from '@/lib/deviceBlocks';
import MediaPicker from '@/components/admin/MediaPicker';

// ============================================
// Types
// ============================================
type HearingAidEditable = HearingAidData & {
  id: number;
  contentBlocks: ProductContentBlockData[];
};

function safeParseArray<T>(raw: string | null, fb: T[] = []): T[] {
  if (!raw) return fb;
  try { const v = JSON.parse(raw); return Array.isArray(v) ? v : fb; } catch { return fb; }
}

// Identifiant unifié de bloc sélectionné : BlockId (fixe) ou "content:N" (inséré)
type Selection = BlockId | `content:${number}` | null;
function isContentSel(s: Selection): s is `content:${number}` {
  return typeof s === 'string' && s.startsWith('content:');
}
function selToContentId(s: Selection): number | null {
  if (!isContentSel(s)) return null;
  return Number(s.split(':')[1]);
}

// ============================================
// Page
// ============================================
export default function AppareilV2Editor() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<HearingAidEditable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const [selected, setSelected] = useState<Selection>('hero');
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [dirty, setDirty]   = useState(false);

  // Modal de choix du type pour insertion
  const [insertAfter, setInsertAfter] = useState<BlockId | null>(null);

  // Load
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/hearing-aids');
        if (!res.ok) throw new Error('Échec du chargement');
        const list: HearingAidEditable[] = await res.json();
        const found = list.find((p) => p.slug === slug);
        if (!found) throw new Error('Appareil introuvable');
        if (!cancelled) {
          // S'assurer que contentBlocks est toujours un array
          setProduct({ ...found, contentBlocks: found.contentBlocks || [] });
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (slug) load();
    return () => { cancelled = true; };
  }, [slug]);

  const visibility = useMemo(
    () => product ? parseBlockVisibility(product.blockVisibility) : defaultVisibility(),
    [product]
  );

  const imagePositions = useMemo(
    () => product ? parseImagePositions(product.imagePositions) : {},
    [product]
  );

  // ============================================
  // Mutations
  // ============================================
  function patchProduct(patch: Partial<HearingAidEditable>) {
    setProduct((p) => (p ? { ...p, ...patch } : p));
    setDirty(true);
  }

  function setVisibility(id: BlockId, value: boolean) {
    if (!product) return;
    const def = BLOCKS.find((b) => b.id === id);
    if (def?.fixed) return;
    const current = parseBlockVisibility(product.blockVisibility);
    const next = { ...current, [id]: value };
    patchProduct({ blockVisibility: JSON.stringify(next) });
  }

  function setFocalPoint(fieldKey: string, focal: FocalPoint) {
    if (!product) return;
    const positions = parseImagePositions(product.imagePositions);
    const next: ImagePositions = { ...positions, [fieldKey]: focal };
    patchProduct({ imagePositions: JSON.stringify(next) });
  }

  // ---- ContentBlock CRUD (in-memory)
  function patchContentBlock(id: number, patch: Partial<ProductContentBlockData>) {
    if (!product) return;
    const next = product.contentBlocks.map((b) => (b.id === id ? { ...b, ...patch } : b));
    patchProduct({ contentBlocks: next });
  }

  function addContentBlock(type: ContentBlockType, afterBlockId: BlockId | null) {
    if (!product) return;
    // Tempo-id négatif pour les blocs non-encore-persistés
    const tempId = -Date.now();
    // Ordre : juste après les blocs déjà placés à ce slot
    const siblings = product.contentBlocks.filter((b) => b.afterBlockId === afterBlockId);
    const maxOrder = siblings.reduce((m, b) => Math.max(m, b.order), -1);
    const newBlock: ProductContentBlockData = {
      id: tempId,
      ...defaultContentBlock(type, afterBlockId),
      order: maxOrder + 1,
    };
    patchProduct({ contentBlocks: [...product.contentBlocks, newBlock] });
    setSelected(`content:${tempId}`);
    setInsertAfter(null);
  }

  function deleteContentBlock(id: number) {
    if (!product) return;
    if (!confirm('Supprimer ce bloc inséré ?')) return;
    patchProduct({ contentBlocks: product.contentBlocks.filter((b) => b.id !== id) });
    if (selected === `content:${id}`) setSelected(null);
  }

  function moveContentBlock(id: number, dir: -1 | 1) {
    if (!product) return;
    const block = product.contentBlocks.find((b) => b.id === id);
    if (!block) return;
    const siblings = product.contentBlocks
      .filter((b) => b.afterBlockId === block.afterBlockId)
      .sort((a, b) => a.order - b.order);
    const idx = siblings.findIndex((b) => b.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= siblings.length) return;
    const swap = siblings[swapIdx];
    const aOrder = block.order;
    const bOrder = swap.order;
    const next = product.contentBlocks.map((b) =>
      b.id === id ? { ...b, order: bOrder } :
      b.id === swap.id ? { ...b, order: aOrder } : b
    );
    patchProduct({ contentBlocks: next });
  }

  async function save() {
    if (!product) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/hearing-aids', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Échec de l\'enregistrement');
      }
      const saved = await res.json();
      setProduct({ ...saved, contentBlocks: saved.contentBlocks || [] });
      setDirty(false);
      setSavedAt(Date.now());
      // Réattribuer la sélection si elle pointait sur un bloc temp (id négatif)
      if (isContentSel(selected) && (selToContentId(selected) as number) < 0) {
        // L'ordre du dernier bloc créé devrait correspondre à l'ID le plus haut
        const last = (saved.contentBlocks || []).slice(-1)[0];
        if (last) setSelected(`content:${last.id}`);
        else setSelected(null);
      }
      if (saved.slug && saved.slug !== slug) {
        router.replace(`/admin/appareils-v2/${saved.slug}`);
      }
    } catch (e) {
      alert(`Erreur : ${e instanceof Error ? e.message : 'inconnue'}`);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (dirty && !saving) save();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, saving, product]);

  // ============================================
  // Render
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" /> Chargement…
        </div>
      </div>
    );
  }
  if (error || !product) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50 p-6">
        <div className="max-w-md text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h1 className="text-xl font-semibold mb-2">Erreur</h1>
          <p className="text-gray-600 mb-5">{error || 'Appareil introuvable'}</p>
          <Link href="/admin/appareils-v2" className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">
            <ArrowLeft className="w-4 h-4" /> Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  // ContentBlocks groupés par afterBlockId (pour le rail)
  const contentBlocksByAfter = new Map<string, ProductContentBlockData[]>();
  for (const b of product.contentBlocks) {
    const key = b.afterBlockId || '__orphan__';
    if (!contentBlocksByAfter.has(key)) contentBlocksByAfter.set(key, []);
    contentBlocksByAfter.get(key)!.push(b);
  }
  for (const arr of contentBlocksByAfter.values()) arr.sort((a, b) => a.order - b.order);

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">

      {/* ==================== TOP BAR ==================== */}
      <div className="h-14 bg-white border-b border-gray-200 px-4 flex items-center gap-3 shrink-0">
        <Link href="/admin/appareils-v2" className="p-1.5 rounded hover:bg-gray-100 text-gray-500" title="Retour à la liste">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Appareils</span>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="font-semibold text-gray-900">{product.name}</span>
          <span className="ml-1 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded bg-emerald-100 text-emerald-700">Beta · v2.1</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-gray-500 font-mono flex items-center gap-1.5">
            {saving ? <><Loader2 className="w-3 h-3 animate-spin" /> Enregistrement…</>
              : dirty ? <><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Non enregistré</>
              : savedAt ? <><Check className="w-3 h-3 text-emerald-500" /> Enregistré</>
              : <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> À jour</>}
          </span>
          <a href={`/appareils/${product.slug}`} target="_blank" rel="noopener noreferrer"
             className="px-3 py-1.5 text-sm border border-gray-200 rounded-md hover:bg-gray-50 flex items-center gap-1.5 text-gray-700">
            Voir en ligne <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button type="button" onClick={save} disabled={saving || !dirty}
                  className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5" /> Enregistrer
          </button>
        </div>
      </div>

      {/* ==================== BODY ==================== */}
      <div className="flex-1 grid overflow-hidden" style={{
        gridTemplateColumns: `${railCollapsed ? '40px' : '280px'} 1fr ${inspectorCollapsed ? '40px' : '360px'}`,
      }}>

        {/* ============ RAIL ============ */}
        <aside className="bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="h-11 px-3 border-b border-gray-200 flex items-center gap-2">
            {!railCollapsed && (
              <>
                <span className="text-sm font-semibold text-gray-900 flex-1">Blocs de la page</span>
                <span className="text-[10px] font-mono text-gray-400">
                  {BLOCKS.filter(b => visibility[b.id] !== false).length}+{product.contentBlocks.length}/{BLOCKS.length}
                </span>
              </>
            )}
            <button type="button" onClick={() => setRailCollapsed((v) => !v)}
                    className="p-1 rounded hover:bg-gray-100 text-gray-400">
              {railCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {!railCollapsed && (
            <div className="overflow-y-auto py-2 px-1.5 flex-1">
              {BLOCKS.map((b, i) => {
                const visible = visibility[b.id] !== false;
                const isSelected = selected === b.id;
                const count = countItemsForBlock(b, product);
                const inserted = contentBlocksByAfter.get(b.id) || [];

                return (
                  <div key={b.id}>
                    <button type="button" onClick={() => setSelected(b.id)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-[13px] transition ${
                              isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                            }`}>
                      <span className="text-[10px] font-mono text-gray-400 w-5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                      <span className={`flex-1 truncate ${visible ? '' : 'opacity-50 line-through'}`}>{b.name}</span>
                      {count != null && <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 rounded shrink-0">{count}</span>}
                      <span
                        role="button" tabIndex={0}
                        onClick={(e) => { e.stopPropagation(); setVisibility(b.id, !visible); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setVisibility(b.id, !visible); } }}
                        className={`p-1 rounded hover:bg-gray-200 ${b.fixed ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                        title={b.fixed ? 'Bloc structurel — non masquable' : (visible ? 'Masquer' : 'Afficher')}>
                        {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-red-500" />}
                      </span>
                    </button>

                    {/* Blocs INSÉRÉS après ce bloc fixe */}
                    {inserted.map((ib) => {
                      const sel = selected === `content:${ib.id}`;
                      const typeName = CONTENT_BLOCK_TYPES.find((t) => t.type === ib.blockType)?.name || ib.blockType;
                      return (
                        <button key={ib.id} type="button" onClick={() => setSelected(`content:${ib.id}`)}
                                className={`w-full flex items-center gap-2 pl-9 pr-2 py-1.5 rounded-md text-left text-[12px] transition border-l-2 ml-2 ${
                                  sel ? 'bg-emerald-50 text-emerald-700 border-emerald-500' : 'hover:bg-gray-50 text-gray-600 border-emerald-200'
                                }`}>
                          <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="flex-1 truncate italic">{ib.title || typeName}</span>
                          <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-600">{typeName}</span>
                        </button>
                      );
                    })}

                    {/* Zone d'insertion (si le bloc autorise) */}
                    {b.allowInsertAfter && (
                      <InsertZone onAdd={() => setInsertAfter(b.id)} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </aside>

        {/* ============ PREVIEW ============ */}
        <div className="overflow-auto bg-gray-200">
          <div className="min-h-full flex flex-col items-center py-6 px-4">
            <div className="mb-3 text-xs font-mono text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> Preview live · clic = sélectionner un bloc
            </div>
            <div className="w-full max-w-[1100px] bg-white border border-gray-300 rounded-xl overflow-hidden shadow-xl">
              <DevicePageRenderer
                product={product}
                visibility={visibility}
                previewAll
                selectedBlock={selected}
                onBlockSelect={(id) => setSelected(id as Selection)}
              />
            </div>
          </div>
        </div>

        {/* ============ INSPECTOR ============ */}
        <aside className="bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          <div className="h-11 px-3 border-b border-gray-200 flex items-center gap-2">
            <button type="button" onClick={() => setInspectorCollapsed((v) => !v)}
                    className="p-1 rounded hover:bg-gray-100 text-gray-400">
              {inspectorCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {!inspectorCollapsed && (
              <span className="text-sm font-semibold text-gray-900 flex-1 truncate">
                {inspectorTitle(selected, product)}
              </span>
            )}
          </div>

          {!inspectorCollapsed && (
            <div className="overflow-y-auto flex-1 px-4 py-4">
              <Inspector
                selection={selected}
                product={product}
                imagePositions={imagePositions}
                onChange={patchProduct}
                onFocal={setFocalPoint}
                onPatchContent={patchContentBlock}
                onDeleteContent={deleteContentBlock}
                onMoveContent={moveContentBlock}
              />
            </div>
          )}
        </aside>

      </div>

      {/* ==================== INSERT MODAL ==================== */}
      {insertAfter && (
        <InsertModal
          afterBlockId={insertAfter}
          onClose={() => setInsertAfter(null)}
          onChoose={(type) => addContentBlock(type, insertAfter)}
        />
      )}
    </div>
  );
}

// ============================================
// Insert zone (between rail rows)
// ============================================
function InsertZone({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="group relative py-1">
      <div className="absolute left-9 right-3 top-1/2 h-px bg-transparent group-hover:bg-emerald-300 transition-colors"></div>
      <button
        type="button"
        onClick={onAdd}
        className="relative mx-auto block w-5 h-5 rounded-full border border-gray-300 bg-white text-gray-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition opacity-30 group-hover:opacity-100"
        title="Insérer un bloc ici"
      >
        <Plus className="w-3 h-3 mx-auto" />
      </button>
    </div>
  );
}

// ============================================
// Inspector title
// ============================================
function inspectorTitle(selection: Selection, product: HearingAidEditable): string {
  if (!selection) return 'Aucun bloc sélectionné';
  if (isContentSel(selection)) {
    const id = selToContentId(selection)!;
    const block = product.contentBlocks.find((b) => b.id === id);
    if (!block) return 'Bloc supprimé';
    const typeName = CONTENT_BLOCK_TYPES.find((t) => t.type === block.blockType)?.name || block.blockType;
    return `★ ${block.title || typeName}`;
  }
  return BLOCKS.find((b) => b.id === selection)?.name || 'Bloc';
}

// ============================================
// Count helper
// ============================================
function countItemsForBlock(b: BlockDef, p: HearingAidEditable): number | null {
  if (!b.hasRepeat) return null;
  if (b.id === 'promises')    return safeParseArray<Advantage>(p.advantages).length;
  if (b.id === 'highlight-2') return safeParseArray<string>(p.highlightBox2Images).length;
  if (b.id === 'faq')         return safeParseArray<FAQ>(p.productFAQs).length;
  if (b.id === 'accessories') return 0;
  return null;
}

// ============================================
// Insert modal
// ============================================
function InsertModal({
  afterBlockId, onClose, onChoose,
}: { afterBlockId: BlockId; onClose: () => void; onChoose: (type: ContentBlockType) => void }) {
  const def = BLOCKS.find((b) => b.id === afterBlockId);
  const iconMap = {
    'columns': Columns,
    'gallery-horizontal-end': GalleryHorizontalEnd,
    'sparkles': Sparkles,
  } as const;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/40 flex items-center justify-center px-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
           className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
          <Plus className="w-4 h-4 text-emerald-600" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Insérer un bloc</h3>
            <p className="text-xs text-gray-500">après <b>{def?.name}</b></p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 grid sm:grid-cols-3 gap-3">
          {CONTENT_BLOCK_TYPES.map((t) => {
            const Icon = iconMap[t.iconKey];
            return (
              <button key={t.type} type="button" onClick={() => onChoose(t.type)}
                      className="text-left p-4 border border-gray-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50/30 transition group">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 grid place-items-center mb-3 group-hover:bg-emerald-200">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-medium text-sm text-gray-900 mb-1">{t.name}</div>
                <div className="text-xs text-gray-500 leading-snug">{t.description}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Inspector (right pane) — dispatches by selection
// ============================================
function Inspector({
  selection, product, imagePositions,
  onChange, onFocal, onPatchContent, onDeleteContent, onMoveContent,
}: {
  selection: Selection;
  product: HearingAidEditable;
  imagePositions: ImagePositions;
  onChange: (patch: Partial<HearingAidEditable>) => void;
  onFocal: (key: string, focal: FocalPoint) => void;
  onPatchContent: (id: number, patch: Partial<ProductContentBlockData>) => void;
  onDeleteContent: (id: number) => void;
  onMoveContent: (id: number, dir: -1 | 1) => void;
}) {
  if (!selection) {
    return <p className="text-sm text-gray-400 text-center pt-12">Sélectionnez un bloc dans le rail ou directement dans le preview.</p>;
  }

  if (isContentSel(selection)) {
    const id = selToContentId(selection)!;
    const block = product.contentBlocks.find((b) => b.id === id);
    if (!block) return <p className="text-sm text-gray-400">Bloc supprimé.</p>;
    return (
      <ContentBlockInspector
        block={block}
        onChange={(patch) => onPatchContent(id, patch)}
        onDelete={() => onDeleteContent(id)}
        onMove={(dir) => onMoveContent(id, dir)}
      />
    );
  }

  return (
    <FixedBlockInspector
      blockId={selection}
      product={product}
      imagePositions={imagePositions}
      onChange={onChange}
      onFocal={onFocal}
    />
  );
}

// ============================================
// Inspector — bloc fixe
// ============================================
function FixedBlockInspector({
  blockId, product, imagePositions,
  onChange, onFocal,
}: {
  blockId: BlockId;
  product: HearingAidEditable;
  imagePositions: ImagePositions;
  onChange: (patch: Partial<HearingAidEditable>) => void;
  onFocal: (key: string, focal: FocalPoint) => void;
}) {
  // Sprint 5.8 — kickers + heroBadges helpers
  const kickers = parseKickers(product.sectionKickers ?? null);
  const setKicker = (key: KickerKey, value: string) => {
    const next = { ...kickers, [key]: value || DEFAULT_KICKERS[key] };
    onChange({ sectionKickers: JSON.stringify(next) } as Partial<HearingAidEditable>);
  };
  const heroBadges = parseHeroBadges(product.heroBadges ?? null);
  const setHeroBadges = (next: HeroBadge[]) => {
    onChange({ heroBadges: JSON.stringify(next) } as Partial<HearingAidEditable>);
  };

  switch (blockId) {
    case 'topbanner':
    case 'crumbs':
    case 'form':
    case 'cta-final':
      return <StaticBlockHint blockId={blockId} />;

    case 'header':
    case 'footer':
      return <FixedBlockHint />;

    case 'hero':
      return (
        <FieldGroup>
          <TextField label="Nom du produit" value={product.name || ''} onChange={(v) => onChange({ name: v })} />
          <TextField label="Marque" value={product.brand || ''} onChange={(v) => onChange({ brand: v })} />
          <Row>
            <TextField label="Gamme" value={product.range || ''} onChange={(v) => onChange({ range: v })} />
            <TextField label="Type" value={product.type || ''} onChange={(v) => onChange({ type: v })} />
          </Row>
          <TextField label="Catch-phrase (italique)" value={product.shortDesc || ''} onChange={(v) => onChange({ shortDesc: v })} />
          <TextAreaField label="Description hero" value={product.heroDescription || ''} onChange={(v) => onChange({ heroDescription: v })} />
          <MediaPicker
            label="Image hero"
            value={product.heroImage}
            onChange={(url) => onChange({ heroImage: url })}
            focal={getFocal(imagePositions, 'heroImage')}
            onFocalChange={(f) => onFocal('heroImage', f)}
            aspect="video"
          />
          <Row>
            <ColorField label="Dégradé · début" value={product.heroGradientFrom || '#42a4ff'} onChange={(v) => onChange({ heroGradientFrom: v })} />
            <ColorField label="Dégradé · fin"   value={product.heroGradientTo   || '#2d87e6'} onChange={(v) => onChange({ heroGradientTo: v })} />
          </Row>
          {/* Sprint 5.8 — Puces éditables sous le CTA du héros */}
          <ArrayEditor<HeroBadge>
            label="Puces du héros (sous le CTA)"
            newItemLabel="Ajouter une puce"
            items={heroBadges}
            onChange={setHeroBadges}
            empty={{ text: 'Nouvelle puce', dotColor: '#86efac' }}
            renderItem={(item, set) => (
              <>
                <TextField label="Texte" value={item.text} onChange={(v) => set({ ...item, text: v })} />
                <ColorField label="Couleur de la puce (vide = pas de puce)" value={item.dotColor} onChange={(v) => set({ ...item, dotColor: v })} allowEmpty />
              </>
            )}
          />
        </FieldGroup>
      );

    case 'promises':
      return (
        <FieldGroup>
          <KickerField label="Tout ce qu'il vous faut" kickerKey="promises" kickers={kickers} setKicker={setKicker} />
          <ArrayEditor<Advantage>
          label="Promesses"
          newItemLabel="Ajouter une promesse"
          items={safeParseArray<Advantage>(product.advantages)}
          onChange={(arr) => onChange({ advantages: JSON.stringify(arr) })}
          empty={{ title: '', description: '', icon: '✓' }}
          renderItem={(item, set) => (
            <>
              <TextField label="Icône (emoji ou URL)" value={item.icon || ''} onChange={(v) => set({ ...item, icon: v })} />
              <TextField label="Titre" value={item.title} onChange={(v) => set({ ...item, title: v })} />
              <TextAreaField label="Description" value={item.description} onChange={(v) => set({ ...item, description: v })} rows={2} />
            </>
          )}
        />
        </FieldGroup>
      );

    case 'section-1':
      return (
        <FieldGroup>
          <KickerField label="À propos" kickerKey="section1" kickers={kickers} setKicker={setKicker} />
          <TextField     label="Titre"       value={product.section1Title || ''}       onChange={(v) => onChange({ section1Title: v })} />
          <TextAreaField label="Description" value={product.section1Description || ''} onChange={(v) => onChange({ section1Description: v })} />
          <MediaPicker
            label="Média"
            value={product.section1MediaUrl}
            onChange={(url) => onChange({ section1MediaUrl: url })}
            mediaType={(product.section1MediaType as 'image'|'video') || 'image'}
            onTypeChange={(t) => onChange({ section1MediaType: t })}
            focal={getFocal(imagePositions, 'section1MediaUrl')}
            onFocalChange={(f) => onFocal('section1MediaUrl', f)}
          />
        </FieldGroup>
      );

    case 'section-2':
      return (
        <FieldGroup>
          <KickerField label="Design" kickerKey="section2" kickers={kickers} setKicker={setKicker} />
          <TextField     label="Titre"       value={product.section2Title || ''}       onChange={(v) => onChange({ section2Title: v })} />
          <TextAreaField label="Description" value={product.section2Description || ''} onChange={(v) => onChange({ section2Description: v })} />
          <MediaPicker
            label="Image"
            value={product.section2Image}
            onChange={(url) => onChange({ section2Image: url })}
            focal={getFocal(imagePositions, 'section2Image')}
            onFocalChange={(f) => onFocal('section2Image', f)}
            aspect="square"
          />
        </FieldGroup>
      );

    case 'highlight-1':
      return (
        <FieldGroup>
          <KickerField label="Highlight" kickerKey="highlight1" kickers={kickers} setKicker={setKicker} />
          <TextField     label="Titre"       value={product.highlightBox1Title || ''}       onChange={(v) => onChange({ highlightBox1Title: v })} />
          <TextAreaField label="Description" value={product.highlightBox1Description || ''} onChange={(v) => onChange({ highlightBox1Description: v })} />
          <MediaPicker
            label="Image"
            value={product.highlightBox1Image}
            onChange={(url) => onChange({ highlightBox1Image: url })}
            focal={getFocal(imagePositions, 'highlightBox1Image')}
            onFocalChange={(f) => onFocal('highlightBox1Image', f)}
            aspect="square"
          />
        </FieldGroup>
      );

    case 'section-3':
      return (
        <FieldGroup>
          <KickerField label="Connectivité" kickerKey="section3" kickers={kickers} setKicker={setKicker} />
          <TextField     label="Titre"       value={product.section3Title || ''}       onChange={(v) => onChange({ section3Title: v })} />
          <TextAreaField label="Description" value={product.section3Description || ''} onChange={(v) => onChange({ section3Description: v })} />
          <MediaPicker
            label="Image"
            value={product.section3Image}
            onChange={(url) => onChange({ section3Image: url })}
            focal={getFocal(imagePositions, 'section3Image')}
            onFocalChange={(f) => onFocal('section3Image', f)}
            aspect="square"
          />
        </FieldGroup>
      );

    case 'section-4':
      return (
        <FieldGroup>
          <KickerField label="Rechargeable" kickerKey="section4" kickers={kickers} setKicker={setKicker} />
          <TextField     label="Titre"       value={product.section4Title || ''}       onChange={(v) => onChange({ section4Title: v })} />
          <TextAreaField label="Description" value={product.section4Description || ''} onChange={(v) => onChange({ section4Description: v })} />
          <MediaPicker
            label="Média"
            value={product.section4MediaUrl}
            onChange={(url) => onChange({ section4MediaUrl: url })}
            mediaType={(product.section4MediaType as 'image'|'video') || 'video'}
            onTypeChange={(t) => onChange({ section4MediaType: t })}
            focal={getFocal(imagePositions, 'section4MediaUrl')}
            onFocalChange={(f) => onFocal('section4MediaUrl', f)}
          />
        </FieldGroup>
      );

    case 'highlight-2':
      return (
        <FieldGroup>
          <KickerField label="L'expérience au quotidien" kickerKey="highlight2" kickers={kickers} setKicker={setKicker} />
          <TextField label="Titre" value={product.highlightBox2Title || ''} onChange={(v) => onChange({ highlightBox2Title: v })} />
          <ArrayEditor<string>
            label="Galerie d'images"
            newItemLabel="Ajouter une image"
            items={safeParseArray<string>(product.highlightBox2Images)}
            onChange={(arr) => onChange({ highlightBox2Images: JSON.stringify(arr) })}
            empty=""
            renderItem={(item, set, idx) => (
              <MediaPickerLite label={`Image ${idx + 1}`} value={item} onChange={(v) => set(v || '')} />
            )}
          />
        </FieldGroup>
      );

    case 'accessories':
      return (
        <FieldGroup>
          <KickerField label="Compatible avec" kickerKey="accessories" kickers={kickers} setKicker={setKicker} />
          <div className="text-sm text-gray-500 leading-relaxed space-y-3">
            <p className="font-semibold text-gray-700">Bloc en attente d'un champ dédié.</p>
            <p>Pour gérer une liste d'accessoires par appareil, il faudra ajouter un champ JSON dédié dans le schéma.</p>
          </div>
        </FieldGroup>
      );

    case 'faq':
      return (
        <ArrayEditor<FAQ>
          label="Questions / réponses"
          newItemLabel="Ajouter une question"
          items={safeParseArray<FAQ>(product.productFAQs)}
          onChange={(arr) => onChange({ productFAQs: JSON.stringify(arr) })}
          empty={{ question: '', answer: '' }}
          renderItem={(item, set) => (
            <>
              <TextField label="Question" value={item.question} onChange={(v) => set({ ...item, question: v })} />
              <TextAreaField label="Réponse" value={item.answer} onChange={(v) => set({ ...item, answer: v })} rows={3} />
            </>
          )}
        />
      );

    default:
      return null;
  }
}

// ============================================
// Inspector — bloc inséré (ProductContentBlock)
// ============================================
function ContentBlockInspector({
  block, onChange, onDelete, onMove,
}: {
  block: ProductContentBlockData;
  onChange: (patch: Partial<ProductContentBlockData>) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const typeName = CONTENT_BLOCK_TYPES.find((t) => t.type === block.blockType)?.name || block.blockType;

  return (
    <div className="space-y-4">
      {/* Header inséré */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 px-3 py-2.5 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-700">Bloc inséré</div>
          <div className="text-sm font-medium text-gray-900 truncate">{typeName}</div>
        </div>
        <button type="button" onClick={() => onMove(-1)} className="p-1 rounded hover:bg-emerald-100 text-emerald-700" title="Monter">
          <MoveUp className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={() => onMove(1)} className="p-1 rounded hover:bg-emerald-100 text-emerald-700" title="Descendre">
          <MoveDown className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={onDelete} className="p-1 rounded hover:bg-red-50 hover:text-red-600 text-emerald-700" title="Supprimer">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Visibilité */}
      <ToggleField
        label="Visible en ligne"
        value={block.isVisible}
        onChange={(v) => onChange({ isVisible: v })}
      />

      {/* Champs selon le type */}
      {block.blockType === 'text-media' && (
        <FieldGroup>
          <TextField label="Titre" value={block.title || ''} onChange={(v) => onChange({ title: v })} />
          <TextAreaField label="Description" value={block.description || ''} onChange={(v) => onChange({ description: v })} />
          <MediaPicker
            label="Média"
            value={block.mediaUrl}
            onChange={(url) => onChange({ mediaUrl: url })}
            mediaType={(block.mediaType as 'image'|'video') || 'image'}
            onTypeChange={(t) => onChange({ mediaType: t })}
          />
          <SelectField label="Position du média" value={block.mediaPosition || 'right'} onChange={(v) => onChange({ mediaPosition: v })}
            options={[ ['right', 'À droite'], ['left', 'À gauche'] ]} />
          <ColorField label="Couleur de fond (optionnel)" value={block.backgroundColor || ''} onChange={(v) => onChange({ backgroundColor: v || null })} allowEmpty />
        </FieldGroup>
      )}

      {block.blockType === 'gallery' && (() => {
        const meta = parseMetadata<GalleryMetadata>(block.metadata, { images: [] });
        return (
          <FieldGroup>
            <TextField label="Titre (optionnel)" value={block.title || ''} onChange={(v) => onChange({ title: v })} />
            <ArrayEditor<string>
              label="Images"
              newItemLabel="Ajouter une image"
              items={meta.images}
              onChange={(arr) => onChange({ metadata: JSON.stringify({ images: arr } satisfies GalleryMetadata) })}
              empty=""
              renderItem={(item, set, idx) => (
                <MediaPickerLite label={`Image ${idx + 1}`} value={item} onChange={(v) => set(v || '')} />
              )}
            />
            <ColorField label="Couleur de fond (optionnel)" value={block.backgroundColor || ''} onChange={(v) => onChange({ backgroundColor: v || null })} allowEmpty />
          </FieldGroup>
        );
      })()}

      {block.blockType === 'highlight' && (() => {
        const meta = parseMetadata<HighlightMetadata>(block.metadata, {});
        return (
          <FieldGroup>
            <TextField label="Titre" value={block.title || ''} onChange={(v) => onChange({ title: v })} />
            <TextAreaField label="Description" value={block.description || ''} onChange={(v) => onChange({ description: v })} />
            <MediaPicker
              label="Image"
              value={block.mediaUrl}
              onChange={(url) => onChange({ mediaUrl: url })}
              mediaType="image"
              aspect="square"
            />
            <SelectField label="Position de l'image" value={block.mediaPosition || 'left'} onChange={(v) => onChange({ mediaPosition: v })}
              options={[ ['left', 'À gauche'], ['right', 'À droite'] ]} />
            <Row>
              <TextField label="Texte du bouton" value={meta.ctaLabel || ''} onChange={(v) => onChange({ metadata: JSON.stringify({ ...meta, ctaLabel: v }) })} />
              <TextField label="Lien du bouton" value={meta.ctaHref || ''} onChange={(v) => onChange({ metadata: JSON.stringify({ ...meta, ctaHref: v }) })} placeholder="/prendre-rendez-vous" />
            </Row>
          </FieldGroup>
        );
      })()}
    </div>
  );
}

// ============================================
// Reusable field components
// ============================================
function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3.5">{children}</div>;
}
function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2.5">{children}</div>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-1.5">{children}</label>;
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
             className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
    </div>
  );
}

// Sprint 5.8 — Champ dédié pour les "kickers" (titre coloré au-dessus du H2 de chaque section).
function KickerField({
  label, kickerKey, kickers, setKicker,
}: {
  label: string;
  kickerKey: KickerKey;
  kickers: Required<SectionKickers>;
  setKicker: (key: KickerKey, value: string) => void;
}) {
  const value = kickers[kickerKey];
  const isDefault = value === DEFAULT_KICKERS[kickerKey];
  return (
    <div className="border border-blue-100 bg-blue-50/40 rounded-lg p-3 -mx-1">
      <div className="flex items-baseline justify-between mb-1.5">
        <Label>Kicker (titre bleu de la section)</Label>
        {!isDefault && (
          <button type="button" onClick={() => setKicker(kickerKey, DEFAULT_KICKERS[kickerKey])}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-medium">
            Réinitialiser
          </button>
        )}
      </div>
      <input type="text" value={value} onChange={(e) => setKicker(kickerKey, e.target.value)}
             placeholder={DEFAULT_KICKERS[kickerKey]}
             className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm uppercase tracking-wider font-semibold text-primary-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
      <p className="text-[10px] text-gray-500 mt-1.5">
        Par défaut : <span className="font-mono">{DEFAULT_KICKERS[kickerKey]}</span> (section <b>{label}</b>)
      </p>
    </div>
  );
}
function TextAreaField({ label, value, onChange, rows = 4 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea value={value} rows={rows} onChange={(e) => onChange(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
    </div>
  );
}
function ColorField({ label, value, onChange, allowEmpty }: { label: string; value: string; onChange: (v: string) => void; allowEmpty?: boolean }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2 border border-gray-200 rounded-md px-2 py-1 focus-within:ring-2 focus-within:ring-blue-200">
        <input type="color" value={value || '#ffffff'} onChange={(e) => onChange(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 outline-none text-sm font-mono" placeholder={allowEmpty ? 'aucun' : ''} />
        {allowEmpty && value && (
          <button type="button" onClick={() => onChange('')} className="text-gray-400 hover:text-gray-700" title="Effacer">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div>
      <Label>{label}</Label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}
function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md border text-sm transition ${value ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-white text-gray-600'}`}>
      <span className="flex items-center gap-2">
        {value ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        {label}
      </span>
      <span className={`w-7 h-4 rounded-full relative transition ${value ? 'bg-emerald-500' : 'bg-gray-300'}`}>
        <span className={`absolute top-0.5 ${value ? 'left-3.5' : 'left-0.5'} w-3 h-3 rounded-full bg-white transition-all`}></span>
      </span>
    </button>
  );
}

// MediaPicker simplifié pour les arrays d'images
function MediaPickerLite({ label, value, onChange }: { label: string; value: string; onChange: (v: string | null) => void }) {
  return <MediaPicker label={label} value={value || null} onChange={onChange} aspect="square" mediaType="image" />;
}

// ============================================
// Array editor
// ============================================
function ArrayEditor<T>({
  label, newItemLabel, items, onChange, empty, renderItem,
}: {
  label: string;
  newItemLabel: string;
  items: T[];
  onChange: (next: T[]) => void;
  empty: T;
  renderItem: (item: T, set: (next: T) => void, index: number) => React.ReactNode;
}) {
  function update(i: number, value: T) {
    const next = [...items];
    next[i] = value;
    onChange(next);
  }
  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  function add() {
    const newItem = typeof empty === 'object' && empty !== null ? { ...(empty as object) } as T : empty;
    onChange([...items, newItem]);
  }
  return (
    <div>
      <Label>{label} <span className="text-gray-400">({items.length})</span></Label>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-3 bg-gray-50 relative space-y-2.5">
            <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
              <span className="text-[10px] font-mono text-gray-400 px-1.5">{i + 1}</span>
              <button type="button" onClick={() => remove(i)} className="p-1 rounded hover:bg-red-50 hover:text-red-600 text-gray-400" title="Supprimer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            {renderItem(it, (next) => update(i, next), i)}
          </div>
        ))}
        <button type="button" onClick={add}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50">
          <Plus className="w-3.5 h-3.5" /> {newItemLabel}
        </button>
      </div>
    </div>
  );
}

// ============================================
// Hints
// ============================================
function StaticBlockHint({ blockId }: { blockId: BlockId }) {
  const def = BLOCKS.find((b) => b.id === blockId);
  return (
    <div className="text-sm text-gray-500 space-y-3">
      <p>Le bloc <b className="text-gray-700">{def?.name}</b> est <b>statique</b> sur la fiche appareil — son contenu vient du gabarit, pas des champs de l'appareil lui-même.</p>
      <p>Vous pouvez l'<b>afficher / masquer</b> via l'œil dans le rail.</p>
    </div>
  );
}
function FixedBlockHint() {
  return (
    <div className="text-sm text-gray-500 space-y-3">
      <p>Ce bloc est <b>structurel</b> et ne peut être ni masqué ni modifié depuis cet éditeur.</p>
      <p>L'en-tête et le pied de page sont gérés globalement pour tout le site.</p>
    </div>
  );
}
