'use client';

// src/app/admin/solutions/page.tsx
// Refonte moderne du module "Solutions" (anciens outils) — même esprit que le
// reste de l'admin : topbar à fil d'Ariane, lignes repliables, éditeur inline,
// médiathèque. Aucune fonction perdue par rapport à l'ancienne version :
//   • description complète, image de détail (médiathèque), couleur de fond
//   • avantages / points d'attention (ajout, suppression, réordonnancement)
//   • liens vers appareils & accessoires (nom, url, image) + affichage on/off
//   • création d'une solution à partir des valeurs par défaut
// API inchangée : GET/POST/PUT /api/admin/solutions. Aucune migration.

import { useEffect, useState } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import MediaPicker from '@/components/MediaPicker';
import {
  ChevronDown, ChevronRight, Plus, X, Save, Upload, RotateCcw,
  ExternalLink, Eye, EyeOff, Check, Loader2, ArrowUp, ArrowDown,
} from 'lucide-react';

type DeviceLink = { name: string; url: string; imageUrl?: string };

type Solution = {
  id: number;
  solutionKey: string;
  fullDesc: string;
  detailImage: string | null;
  detailEmoji: string;
  backgroundColor: string | null;
  pros: string[];
  cons: string[];
  deviceLinks: DeviceLink[];
  showDeviceLinks: boolean;
  accessoryLinks: DeviceLink[];
  showAccessoryLinks: boolean;
  updatedAt?: string;
};

type SolutionDefault = {
  solutionKey: string;
  title: string;
  fullDesc: string;
  detailEmoji: string;
  pros: string[];
  cons: string[];
};

type Form = {
  fullDesc: string;
  detailImage: string | null;
  detailEmoji: string;
  backgroundColor: string | null;
  pros: string[];
  cons: string[];
  deviceLinks: DeviceLink[];
  showDeviceLinks: boolean;
  accessoryLinks: DeviceLink[];
  showAccessoryLinks: boolean;
};

const DEFAULTS: SolutionDefault[] = [
  {
    solutionKey: 'contour',
    title: "Le contour d'oreille",
    detailEmoji: '🎧',
    fullDesc:
      "Grâce à son boîtier positionné derrière l'oreille, le contour d'oreille est facile à manipuler et à entretenir au quotidien. Il peut intégrer une batterie rechargeable et une connexion Bluetooth pour s'associer à votre téléphone, votre télévision ou d'autres accessoires. Disponible dans différentes teintes pour se fondre dans la couleur de vos cheveux ou de votre peau, il reste très discret malgré son placement externe.",
    pros: [
      'Convient à presque tous les degrés de perte auditive',
      'Facile à manipuler et à entretenir',
      'Batterie rechargeable disponible',
      'Connectivité Bluetooth (TV, téléphone…)',
      'Large choix de teintes discrètes',
    ],
    cons: ["Visible derrière l'oreille", 'Peut parfois gêner le port de lunettes'],
  },
  {
    solutionKey: 'intra',
    title: "L'intra-auriculaire",
    detailEmoji: '👁️',
    fullDesc:
      "Positionné directement dans le conduit auditif, l'intra-auriculaire capte les sons de façon naturelle grâce à sa proximité avec le tympan. Il est particulièrement adapté aux personnes qui portent des lunettes, car son placement ne génère aucune interférence avec les branches. Sa conception sur mesure garantit un ajustement précis et un confort de port élevé.",
    pros: [
      'Discrétion maximale',
      'Moulage personnalisé pour un confort optimal',
      "Son naturel grâce à la position dans l'oreille",
      'Pas de gêne avec les lunettes ou le casque',
    ],
    cons: [
      'Non adapté aux pertes sévères à profondes',
      'Manipulation plus délicate',
      'Entretien fréquent (cérumen)',
    ],
  },
  {
    solutionKey: 'intent',
    title: 'Oticon Intent',
    detailEmoji: '⭐',
    fullDesc:
      "Doté d'une puce de traitement performante et de quatre capteurs intégrés, l'Oticon Intent détecte en temps réel ce que vous faites et s'ajuste automatiquement pour vous offrir le son le plus clair possible dans chaque contexte. Sa connectivité Bluetooth vous permet de le coupler à votre smartphone ou à votre télévision. La batterie rechargeable tient toute la journée, et son boîtier est certifié résistant à l'eau et à la poussière (IP68).",
    pros: [
      'Adaptation automatique à chaque situation',
      'Capteurs de mouvement intégrés',
      'Son clair et naturel dans le bruit',
      'Connectivité Bluetooth complète',
      'Batterie rechargeable longue durée',
      "Résistant à l'eau et à la poussière (IP68)",
    ],
    cons: ['Tarif haut de gamme', "Nécessite un temps d'adaptation"],
  },
];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] uppercase tracking-wider font-mono text-gray-500 block mb-1.5">{children}</label>
  );
}

export default function SolutionsAdmin() {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  async function load() {
    try {
      const r = await fetch('/api/admin/solutions');
      if (r.ok) setSolutions(await r.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="flex flex-col h-screen">
      <AdminTopbar crumbs={[{ label: 'Site web' }, { label: 'Solutions' }]} />

      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-4xl mx-auto p-8 space-y-4">
          <p className="text-[13px] text-gray-500 leading-relaxed">
            Fiches détaillées par type d'appareil. Elles s'affichent quand on déplie une
            card sur la page <span className="font-medium text-gray-700">Solutions auditives</span>.
          </p>

          {loading ? (
            <p className="text-gray-500 text-sm">Chargement…</p>
          ) : (
            DEFAULTS.map((def) => (
              <SolutionRow
                key={def.solutionKey}
                def={def}
                existing={solutions.find((s) => s.solutionKey === def.solutionKey) ?? null}
                open={open === def.solutionKey}
                onToggle={() => setOpen(open === def.solutionKey ? null : def.solutionKey)}
                onChanged={load}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Ligne / éditeur d'une solution ─────────────── */

function seedForm(def: SolutionDefault, existing: Solution | null): Form {
  return {
    fullDesc: existing?.fullDesc ?? def.fullDesc,
    detailImage: existing?.detailImage ?? null,
    detailEmoji: existing?.detailEmoji ?? def.detailEmoji,
    backgroundColor: existing?.backgroundColor ?? null,
    pros: existing?.pros ?? def.pros,
    cons: existing?.cons ?? def.cons,
    deviceLinks: existing?.deviceLinks ?? [],
    showDeviceLinks: existing?.showDeviceLinks ?? true,
    accessoryLinks: existing?.accessoryLinks ?? [],
    showAccessoryLinks: existing?.showAccessoryLinks ?? true,
  };
}

type PickerTarget =
  | { kind: 'detail' }
  | { kind: 'device'; index: number }
  | { kind: 'accessory'; index: number };

function SolutionRow({
  def, existing, open, onToggle, onChanged,
}: {
  def: SolutionDefault;
  existing: Solution | null;
  open: boolean;
  onToggle: () => void;
  onChanged: () => void;
}) {
  const exists = !!existing;
  const [form, setForm] = useState<Form>(() => seedForm(def, existing));
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [picker, setPicker] = useState<PickerTarget | null>(null);

  useEffect(() => {
    setForm(seedForm(def, existing));
    setStatus('idle');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id, def.solutionKey]);

  function patch(p: Partial<Form>) { setForm((f) => ({ ...f, ...p })); }

  async function save() {
    setStatus('saving');
    try {
      const r = await fetch('/api/admin/solutions', {
        method: exists ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          exists ? { id: existing!.id, ...form } : { solutionKey: def.solutionKey, ...form },
        ),
      });
      if (!r.ok) throw new Error(String(r.status));
      setStatus('saved');
      onChanged();
      window.setTimeout(() => setStatus('idle'), 1500);
    } catch (e) {
      console.error('Solution save failed', e);
      setStatus('error');
    }
  }

  function onPick(url: string) {
    if (!picker) return;
    if (picker.kind === 'detail') {
      patch({ detailImage: url });
    } else if (picker.kind === 'device') {
      const next = [...form.deviceLinks];
      next[picker.index] = { ...next[picker.index], imageUrl: url };
      patch({ deviceLinks: next });
    } else {
      const next = [...form.accessoryLinks];
      next[picker.index] = { ...next[picker.index], imageUrl: url };
      patch({ accessoryLinks: next });
    }
    setPicker(null);
  }

  const noImage = !form.detailImage || form.detailImage.trim() === '';

  return (
    <div className={`rounded-lg border bg-white ${exists ? 'border-gray-200' : 'border-dashed border-gray-300'}`}>
      {/* En-tête repliable */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 grid place-items-center shrink-0 border border-gray-100">
          {!noImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.detailImage as string} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">{form.detailEmoji}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-gray-900 truncate">{def.title}</span>
            {!exists && (
              <span className="text-[10px] uppercase tracking-wider font-mono text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                à créer
              </span>
            )}
          </div>
          <p className="text-[12px] text-gray-500 truncate">{form.fullDesc}</p>
        </div>
        <code className="text-[10px] font-mono text-gray-400 px-2 py-1 bg-gray-50 rounded hidden sm:block">{def.solutionKey}</code>
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>

      {/* Éditeur */}
      {open && (
        <div className="border-t border-gray-100 p-4 bg-gray-50/40 space-y-5">
          {/* Image + couleur de fond */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Image du panneau détaillé</Label>
              <div className="rounded-lg overflow-hidden border border-gray-200 bg-white h-32 relative grid place-items-center">
                {!noImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.detailImage as string} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">{form.detailEmoji}</span>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setPicker({ kind: 'detail' })}
                  className="flex-1 h-8 px-3 rounded-md bg-gray-900 text-white text-[12px] font-medium hover:bg-black flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3 h-3" /> Choisir
                </button>
                {!noImage && (
                  <button
                    type="button"
                    onClick={() => patch({ detailImage: null })}
                    className="h-8 px-3 rounded-md border border-gray-300 text-gray-700 text-[12px] font-medium hover:bg-white flex items-center gap-1.5"
                    title="Retirer l'image (afficher l'emoji)"
                  >
                    <RotateCcw className="w-3 h-3" /> Emoji
                  </button>
                )}
              </div>
              <div className="mt-2">
                <Label>Emoji de secours</Label>
                <input
                  value={form.detailEmoji}
                  onChange={(e) => patch({ detailEmoji: e.target.value })}
                  maxLength={4}
                  className="w-16 text-center text-[16px] p-1.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>

            <div>
              <Label>Couleur de fond de la section</Label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.backgroundColor || ''}
                  onChange={(e) => patch({ backgroundColor: e.target.value || null })}
                  placeholder="#f9fafb, transparent…"
                  className="flex-1 min-w-0 text-[12px] p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400 font-mono"
                />
                <input
                  type="color"
                  value={form.backgroundColor && form.backgroundColor.startsWith('#') ? form.backgroundColor : '#ffffff'}
                  onChange={(e) => patch({ backgroundColor: e.target.value })}
                  className="w-9 h-9 shrink-0 border border-gray-200 rounded-md cursor-pointer bg-white"
                  title="Sélecteur de couleur"
                />
                {form.backgroundColor && (
                  <button
                    type="button"
                    onClick={() => patch({ backgroundColor: null })}
                    className="h-9 px-2 shrink-0 rounded-md border border-gray-200 text-gray-600 hover:bg-white"
                    title="Réinitialiser (blanc)"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Vide = blanc par défaut.</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label>Description complète</Label>
            <textarea
              value={form.fullDesc}
              onChange={(e) => patch({ fullDesc: e.target.value })}
              rows={5}
              className="w-full text-[13px] p-2.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400 resize-y leading-relaxed"
            />
          </div>

          {/* Avantages / Points d'attention */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StringListEditor
              label="✅ Avantages"
              items={form.pros}
              onChange={(pros) => patch({ pros })}
              placeholder="Avantage"
            />
            <StringListEditor
              label="⚠️ Points d'attention"
              items={form.cons}
              onChange={(cons) => patch({ cons })}
              placeholder="Point d'attention"
            />
          </div>

          {/* Liens appareils */}
          <LinkListEditor
            label="Liens vers les appareils de ce type"
            items={form.deviceLinks}
            show={form.showDeviceLinks}
            onShowChange={(v) => patch({ showDeviceLinks: v })}
            onChange={(deviceLinks) => patch({ deviceLinks })}
            onPickImage={(index) => setPicker({ kind: 'device', index })}
            addLabel="Ajouter un appareil"
          />

          {/* Liens accessoires */}
          <LinkListEditor
            label="Accessoires disponibles"
            items={form.accessoryLinks}
            show={form.showAccessoryLinks}
            onShowChange={(v) => patch({ showAccessoryLinks: v })}
            onChange={(accessoryLinks) => patch({ accessoryLinks })}
            onPickImage={(index) => setPicker({ kind: 'accessory', index })}
            addLabel="Ajouter un accessoire"
          />

          {/* Barre d'enregistrement */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-200">
            <span className="text-[10px] text-gray-400">
              {status === 'error' ? 'Échec de l\'enregistrement' : 'Enregistrement direct (pas besoin de Publier)'}
            </span>
            <button
              type="button"
              onClick={save}
              disabled={status === 'saving'}
              className="h-8 px-4 rounded-md bg-gray-900 text-white text-[12px] font-medium hover:bg-black disabled:opacity-50 flex items-center gap-1.5"
            >
              {status === 'saving' ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enregistrement…</>
              ) : status === 'saved' ? (
                <><Check className="w-3.5 h-3.5" /> Enregistré</>
              ) : exists ? (
                <><Save className="w-3.5 h-3.5" /> Enregistrer</>
              ) : (
                <><Plus className="w-3.5 h-3.5" /> Créer la solution</>
              )}
            </button>
          </div>
        </div>
      )}

      <MediaPicker
        isOpen={!!picker}
        onClose={() => setPicker(null)}
        onSelect={onPick}
        currentMedia={picker?.kind === 'detail' ? (form.detailImage || '') : ''}
        mediaType="image"
      />
    </div>
  );
}

/* ─────────────── Éditeur de liste de chaînes (pros / cons) ─────────────── */

function StringListEditor({
  label, items, onChange, placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  function update(i: number, v: string) { const n = [...items]; n[i] = v; onChange(n); }
  function remove(i: number) { onChange(items.filter((_, idx) => idx !== i)); }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const n = [...items];
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold text-gray-700">{label}</span>
        <button
          type="button"
          onClick={() => onChange([...items, ''])}
          className="text-[11px] text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Ajouter
        </button>
      </div>
      <div className="space-y-1.5">
        {items.length === 0 && <p className="text-[11px] text-gray-400 italic">Aucun élément.</p>}
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="flex flex-col">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                className="text-gray-300 hover:text-gray-600 disabled:opacity-30 leading-none"><ArrowUp className="w-3 h-3" /></button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1}
                className="text-gray-300 hover:text-gray-600 disabled:opacity-30 leading-none"><ArrowDown className="w-3 h-3" /></button>
            </div>
            <input
              value={it}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 min-w-0 text-[12px] p-1.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400"
            />
            <button type="button" onClick={() => remove(i)}
              className="w-7 h-7 grid place-items-center rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── Éditeur de liste de liens (appareils / accessoires) ─────────────── */

function LinkListEditor({
  label, items, show, onShowChange, onChange, onPickImage, addLabel,
}: {
  label: string;
  items: DeviceLink[];
  show: boolean;
  onShowChange: (v: boolean) => void;
  onChange: (items: DeviceLink[]) => void;
  onPickImage: (index: number) => void;
  addLabel: string;
}) {
  function update(i: number, field: keyof DeviceLink, v: string) {
    const n = [...items]; n[i] = { ...n[i], [field]: v } as DeviceLink; onChange(n);
  }
  function remove(i: number) { onChange(items.filter((_, idx) => idx !== i)); }

  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[12px] font-semibold text-gray-800 truncate">{label}</span>
          <button
            type="button"
            onClick={() => onShowChange(!show)}
            className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${
              show ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'
            }`}
            title={show ? 'Section affichée sur le site' : 'Section masquée'}
          >
            {show ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {show ? 'Affichée' : 'Masquée'}
          </button>
        </div>
        <button
          type="button"
          onClick={() => onChange([...items, { name: '', url: '' }])}
          className="text-[11px] text-gray-600 hover:text-gray-900 flex items-center gap-1 shrink-0"
        >
          <Plus className="w-3 h-3" /> {addLabel}
        </button>
      </div>

      <div className="space-y-2">
        {items.length === 0 && <p className="text-[11px] text-gray-400 italic">Aucun lien pour le moment.</p>}
        {items.map((link, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-2.5 bg-white space-y-2">
            <div className="flex gap-2">
              <input
                value={link.name}
                onChange={(e) => update(i, 'name', e.target.value)}
                placeholder="Nom"
                className="flex-1 min-w-0 text-[12px] p-1.5 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
              />
              <input
                value={link.url}
                onChange={(e) => update(i, 'url', e.target.value)}
                placeholder="/lien-vers-la-page"
                className="flex-1 min-w-0 text-[12px] p-1.5 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
              />
              {link.url && (
                <a href={link.url} target="_blank" rel="noreferrer"
                  className="w-7 h-7 grid place-items-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 shrink-0" title="Tester">
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <button type="button" onClick={() => remove(i)}
                className="w-7 h-7 grid place-items-center rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              {link.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={link.imageUrl} alt={link.name} className="h-10 w-10 object-cover rounded border border-gray-200 shrink-0" />
              ) : (
                <div className="h-10 w-10 rounded border border-dashed border-gray-300 grid place-items-center text-gray-300 shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                </div>
              )}
              <input
                value={link.imageUrl || ''}
                onChange={(e) => update(i, 'imageUrl', e.target.value)}
                placeholder="URL image (optionnel)"
                className="flex-1 min-w-0 text-[11px] p-1.5 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 font-mono"
              />
              <button type="button" onClick={() => onPickImage(i)}
                className="h-8 px-2.5 shrink-0 rounded-md border border-gray-200 hover:bg-gray-50 text-[11px] font-medium flex items-center gap-1.5">
                <Upload className="w-3 h-3" /> Choisir
              </button>
              {link.imageUrl && (
                <button type="button" onClick={() => update(i, 'imageUrl', '')}
                  className="w-8 h-8 grid place-items-center rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0" title="Retirer l'image">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
