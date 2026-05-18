'use client';

// =====================================================
// /admin/appareils-v2/[slug] — Éditeur structuré d'appareil
// =====================================================
// Layout 3 colonnes :
//   ◼ Rail (gauche)     — liste des 16 blocs avec toggle visibilité
//   ◼ Preview (centre)  — DevicePageRenderer live, miroir de l'état
//   ◼ Inspector (droite) — formulaire des champs du bloc sélectionné
//
// Toutes les modifications sont en local jusqu'à clic sur "Enregistrer".
// La sauvegarde appelle PUT /api/admin/hearing-aids (route déjà existante).

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Eye, EyeOff, Save, ExternalLink, Plus, Trash2,
  ChevronLeft, ChevronRight, Check, Loader2, Sparkles, AlertCircle,
} from 'lucide-react';
import DevicePageRenderer, { HearingAidData, Advantage, FAQ } from '@/components/devices/DevicePageRenderer';
import {
  BLOCKS, BlockId, BlockDef, parseBlockVisibility, defaultVisibility,
} from '@/lib/deviceBlocks';

// ============================================
// Types & helpers
// ============================================
type HearingAidEditable = HearingAidData & { id: number };

interface PromiseInput { title: string; description: string; icon: string; }

function safeParseArray<T>(raw: string | null, fb: T[] = []): T[] {
  if (!raw) return fb;
  try { const v = JSON.parse(raw); return Array.isArray(v) ? v : fb; } catch { return fb; }
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

  const [selected, setSelected] = useState<BlockId | null>('hero');
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [dirty, setDirty]   = useState(false);

  // Initial load
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
        if (!cancelled) setProduct(found);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (slug) load();
    return () => { cancelled = true; };
  }, [slug]);

  // Visibilité dérivée
  const visibility = useMemo(
    () => product ? parseBlockVisibility(product.blockVisibility) : defaultVisibility(),
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
    if (def?.fixed) return; // header/footer non-masquables
    const current = parseBlockVisibility(product.blockVisibility);
    const next = { ...current, [id]: value };
    patchProduct({ blockVisibility: JSON.stringify(next) });
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
      setProduct(saved);
      setDirty(false);
      setSavedAt(Date.now());
      // Le slug peut avoir changé si le nom a été modifié — on met à jour l'URL.
      if (saved.slug && saved.slug !== slug) {
        router.replace(`/admin/appareils-v2/${saved.slug}`);
      }
    } catch (e) {
      alert(`Erreur : ${e instanceof Error ? e.message : 'inconnue'}`);
    } finally {
      setSaving(false);
    }
  }

  // Cmd/Ctrl-S
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
          <span className="ml-1 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded bg-emerald-100 text-emerald-700">Beta</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Save status */}
          <span className="text-xs text-gray-500 font-mono flex items-center gap-1.5">
            {saving ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Enregistrement…</>
            ) : dirty ? (
              <><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Modifications non enregistrées</>
            ) : savedAt ? (
              <><Check className="w-3 h-3 text-emerald-500" /> Enregistré</>
            ) : (
              <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> À jour</>
            )}
          </span>
          <a
            href={`/appareils/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-md hover:bg-gray-50 flex items-center gap-1.5 text-gray-700"
          >
            Voir en ligne <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={save}
            disabled={saving || !dirty}
            className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Enregistrer
          </button>
        </div>
      </div>

      {/* ==================== BODY ==================== */}
      <div className="flex-1 grid overflow-hidden" style={{
        gridTemplateColumns: `${railCollapsed ? '40px' : '260px'} 1fr ${inspectorCollapsed ? '40px' : '340px'}`,
      }}>

        {/* ============ RAIL (gauche) ============ */}
        <aside className="bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="h-11 px-3 border-b border-gray-200 flex items-center gap-2">
            {!railCollapsed && (
              <>
                <span className="text-sm font-semibold text-gray-900 flex-1">Blocs de la page</span>
                <span className="text-[10px] font-mono text-gray-400">
                  {BLOCKS.filter(b => visibility[b.id] !== false).length}/{BLOCKS.length}
                </span>
              </>
            )}
            <button
              type="button"
              onClick={() => setRailCollapsed((v) => !v)}
              className="p-1 rounded hover:bg-gray-100 text-gray-400"
              title={railCollapsed ? 'Déplier' : 'Replier'}
            >
              {railCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {!railCollapsed && (
            <div className="overflow-y-auto py-2 px-1.5 flex-1">
              {BLOCKS.map((b, i) => {
                const visible = visibility[b.id] !== false;
                const isSelected = selected === b.id;
                const count = countItemsForBlock(b, product);
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelected(b.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-[13px] transition ${
                      isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-gray-400 w-5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <span className={`flex-1 truncate ${visible ? '' : 'opacity-50 line-through'}`}>{b.name}</span>
                    {count != null && (
                      <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 rounded shrink-0">{count}</span>
                    )}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); setVisibility(b.id, !visible); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setVisibility(b.id, !visible); } }}
                      className={`p-1 rounded hover:bg-gray-200 ${b.fixed ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                      title={b.fixed ? 'Bloc structurel — non masquable' : (visible ? 'Masquer' : 'Afficher')}
                    >
                      {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-red-500" />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* ============ PREVIEW (centre) ============ */}
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
                onBlockSelect={(id) => setSelected(id)}
              />
            </div>
          </div>
        </div>

        {/* ============ INSPECTOR (droite) ============ */}
        <aside className="bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          <div className="h-11 px-3 border-b border-gray-200 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInspectorCollapsed((v) => !v)}
              className="p-1 rounded hover:bg-gray-100 text-gray-400"
              title={inspectorCollapsed ? 'Déplier' : 'Replier'}
            >
              {inspectorCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {!inspectorCollapsed && (
              <span className="text-sm font-semibold text-gray-900 flex-1 truncate">
                {selected ? (BLOCKS.find((b) => b.id === selected)?.name || 'Bloc') : 'Aucun bloc sélectionné'}
              </span>
            )}
          </div>

          {!inspectorCollapsed && (
            <div className="overflow-y-auto flex-1 px-4 py-4">
              <BlockInspector
                blockId={selected}
                product={product}
                onChange={patchProduct}
              />
            </div>
          )}
        </aside>

      </div>
    </div>
  );
}

// ============================================
// Count helper (for rail)
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
// Inspector (right pane)
// ============================================
function BlockInspector({
  blockId,
  product,
  onChange,
}: {
  blockId: BlockId | null;
  product: HearingAidEditable;
  onChange: (patch: Partial<HearingAidEditable>) => void;
}) {
  if (!blockId) {
    return <EmptyInspectorHint />;
  }

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
          <TextField
            label="Catch-phrase (italique)"
            value={product.shortDesc || ''}
            onChange={(v) => onChange({ shortDesc: v })}
          />
          <TextAreaField
            label="Description hero"
            value={product.heroDescription || ''}
            onChange={(v) => onChange({ heroDescription: v })}
          />
          <TextField label="Image hero (URL)" value={product.heroImage || ''} onChange={(v) => onChange({ heroImage: v })} placeholder="https://…" />
          <Row>
            <ColorField label="Dégradé · début" value={product.heroGradientFrom || '#42a4ff'} onChange={(v) => onChange({ heroGradientFrom: v })} />
            <ColorField label="Dégradé · fin"   value={product.heroGradientTo   || '#2d87e6'} onChange={(v) => onChange({ heroGradientTo: v })} />
          </Row>
        </FieldGroup>
      );

    case 'promises':
      return (
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
      );

    case 'section-1':
      return (
        <FieldGroup>
          <TextField     label="Titre"       value={product.section1Title || ''}       onChange={(v) => onChange({ section1Title: v })} />
          <TextAreaField label="Description" value={product.section1Description || ''} onChange={(v) => onChange({ section1Description: v })} />
          <SelectField
            label="Type de média"
            value={product.section1MediaType || 'image'}
            onChange={(v) => onChange({ section1MediaType: v })}
            options={[ ['image', 'Image'], ['video', 'Vidéo'] ]}
          />
          <TextField label="URL du média" value={product.section1MediaUrl || ''} onChange={(v) => onChange({ section1MediaUrl: v })} placeholder="https://…" />
        </FieldGroup>
      );

    case 'section-2':
      return (
        <FieldGroup>
          <TextField     label="Titre"       value={product.section2Title || ''}       onChange={(v) => onChange({ section2Title: v })} />
          <TextAreaField label="Description" value={product.section2Description || ''} onChange={(v) => onChange({ section2Description: v })} />
          <TextField     label="Image (URL)" value={product.section2Image || ''}       onChange={(v) => onChange({ section2Image: v })} placeholder="https://…" />
        </FieldGroup>
      );

    case 'highlight-1':
      return (
        <FieldGroup>
          <TextField     label="Titre"       value={product.highlightBox1Title || ''}       onChange={(v) => onChange({ highlightBox1Title: v })} />
          <TextAreaField label="Description" value={product.highlightBox1Description || ''} onChange={(v) => onChange({ highlightBox1Description: v })} />
          <TextField     label="Image (URL)" value={product.highlightBox1Image || ''}       onChange={(v) => onChange({ highlightBox1Image: v })} placeholder="https://…" />
        </FieldGroup>
      );

    case 'section-3':
      return (
        <FieldGroup>
          <TextField     label="Titre"       value={product.section3Title || ''}       onChange={(v) => onChange({ section3Title: v })} />
          <TextAreaField label="Description" value={product.section3Description || ''} onChange={(v) => onChange({ section3Description: v })} />
          <TextField     label="Image (URL)" value={product.section3Image || ''}       onChange={(v) => onChange({ section3Image: v })} placeholder="https://…" />
        </FieldGroup>
      );

    case 'section-4':
      return (
        <FieldGroup>
          <TextField     label="Titre"       value={product.section4Title || ''}       onChange={(v) => onChange({ section4Title: v })} />
          <TextAreaField label="Description" value={product.section4Description || ''} onChange={(v) => onChange({ section4Description: v })} />
          <SelectField
            label="Type de média"
            value={product.section4MediaType || 'video'}
            onChange={(v) => onChange({ section4MediaType: v })}
            options={[ ['image', 'Image'], ['video', 'Vidéo'] ]}
          />
          <TextField label="URL du média" value={product.section4MediaUrl || ''} onChange={(v) => onChange({ section4MediaUrl: v })} placeholder="https://…" />
        </FieldGroup>
      );

    case 'highlight-2':
      return (
        <FieldGroup>
          <TextField label="Titre" value={product.highlightBox2Title || ''} onChange={(v) => onChange({ highlightBox2Title: v })} />
          <ArrayEditor<string>
            label="Galerie d'images"
            newItemLabel="Ajouter une image"
            items={safeParseArray<string>(product.highlightBox2Images)}
            onChange={(arr) => onChange({ highlightBox2Images: JSON.stringify(arr) })}
            empty=""
            renderItem={(item, set, idx) => (
              <TextField label={`Image ${idx + 1} (URL)`} value={item} onChange={set} placeholder="https://…" />
            )}
          />
        </FieldGroup>
      );

    case 'accessories':
      return (
        <div className="text-sm text-gray-500 leading-relaxed space-y-3">
          <p className="font-semibold text-gray-700">Bloc en attente d'un champ dédié.</p>
          <p>Pour gérer une liste d'accessoires par appareil, il faut ajouter un champ JSON
            (ex. <code className="bg-gray-100 px-1 rounded text-xs">compatibleAccessories</code>)
            au modèle <code className="bg-gray-100 px-1 rounded text-xs">HearingAid</code>.</p>
          <p>En attendant, ce bloc affiche un placeholder sur la page publique. Il peut être
            masqué via l'œil dans le rail.</p>
        </div>
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
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, rows = 4 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
      />
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2 border border-gray-200 rounded-md px-2 py-1 focus-within:ring-2 focus-within:ring-blue-200">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 outline-none text-sm font-mono"
        />
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

// ============================================
// Array editor (used for promises, faq, gallery)
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
    const next = items.filter((_, idx) => idx !== i);
    onChange(next);
  }
  function add() {
    // Deep-copy l'empty pour éviter la mutation accidentelle
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
              <button
                type="button"
                onClick={() => remove(i)}
                className="p-1 rounded hover:bg-red-50 hover:text-red-600 text-gray-400"
                title="Supprimer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            {renderItem(it, (next) => update(i, next), i)}
          </div>
        ))}
        <button
          type="button"
          onClick={add}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50"
        >
          <Plus className="w-3.5 h-3.5" /> {newItemLabel}
        </button>
      </div>
    </div>
  );
}

// ============================================
// Inspector hints
// ============================================
function EmptyInspectorHint() {
  return (
    <div className="text-sm text-gray-400 text-center pt-12 px-4">
      Sélectionnez un bloc dans le rail (à gauche) ou directement dans le preview pour l'éditer.
    </div>
  );
}

function StaticBlockHint({ blockId }: { blockId: BlockId }) {
  const def = BLOCKS.find((b) => b.id === blockId);
  return (
    <div className="text-sm text-gray-500 space-y-3">
      <p>
        Le bloc <b className="text-gray-700">{def?.name}</b> est <b>statique</b> sur la fiche
        appareil — son contenu vient du gabarit, pas des champs de l'appareil lui-même.
      </p>
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
