// =====================================================
// Audire — Définitions partagées des blocs (v2.1)
// =====================================================
// Ajoute les types de blocs INSÉRABLES (ProductContentBlock)
// qui peuvent être créés entre n'importe quels deux blocs fixes.

export type BlockId =
  | 'topbanner'
  | 'header'
  | 'crumbs'
  | 'hero'
  | 'promises'
  | 'section-1'
  | 'section-2'
  | 'highlight-1'
  | 'section-3'
  | 'section-4'
  | 'highlight-2'
  | 'accessories'
  | 'faq'
  | 'form'
  | 'cta-final'
  | 'footer';

export interface BlockDef {
  id: BlockId;
  name: string;
  group: 'chrome' | 'content' | 'cta';
  fixed?: boolean;
  hasRepeat?: boolean;
  repeatLabel?: string;
  /** Si false, on n'autorise pas l'insertion d'un bloc libre APRÈS celui-ci */
  allowInsertAfter?: boolean;
}

export const BLOCKS: BlockDef[] = [
  { id: 'topbanner',   name: 'Bandeau téléphone',          group: 'chrome',  allowInsertAfter: false },
  { id: 'header',      name: 'En-tête de site',             group: 'chrome',  fixed: true, allowInsertAfter: false },
  { id: 'crumbs',      name: "Fil d'Ariane",                group: 'chrome',  allowInsertAfter: false },
  { id: 'hero',        name: 'Héros',                       group: 'content', allowInsertAfter: true  },
  { id: 'promises',    name: 'Promesses (avantages)',       group: 'content', hasRepeat: true, repeatLabel: 'promesse', allowInsertAfter: true },
  { id: 'section-1',   name: 'Section · Texte + Média',     group: 'content', allowInsertAfter: true },
  { id: 'section-2',   name: 'Section · Image + Texte',     group: 'content', allowInsertAfter: true },
  { id: 'highlight-1', name: 'Highlight · Encadré 1',       group: 'content', allowInsertAfter: true },
  { id: 'section-3',   name: 'Section · Texte + Image',     group: 'content', allowInsertAfter: true },
  { id: 'section-4',   name: 'Section · Média + Texte',     group: 'content', allowInsertAfter: true },
  { id: 'highlight-2', name: 'Highlight · Encadré 2 (galerie)', group: 'content', hasRepeat: true, repeatLabel: 'image', allowInsertAfter: true },
  { id: 'accessories', name: 'Accessoires (liste libre)',   group: 'content', hasRepeat: true, repeatLabel: 'accessoire', allowInsertAfter: true },
  { id: 'faq',         name: 'FAQ produit',                 group: 'content', hasRepeat: true, repeatLabel: 'question', allowInsertAfter: true },
  { id: 'form',        name: 'Formulaire de contact',       group: 'cta',     allowInsertAfter: false },
  { id: 'cta-final',   name: 'CTA finale',                  group: 'cta',     allowInsertAfter: false },
  { id: 'footer',      name: 'Pied de page',                group: 'chrome',  fixed: true, allowInsertAfter: false },
];

export type BlockVisibility = Partial<Record<BlockId, boolean>>;

export function parseBlockVisibility(raw: string | null | undefined): BlockVisibility {
  if (!raw) return defaultVisibility();
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return defaultVisibility();
    return parsed as BlockVisibility;
  } catch {
    return defaultVisibility();
  }
}

export function defaultVisibility(): BlockVisibility {
  const v: BlockVisibility = {};
  for (const b of BLOCKS) v[b.id] = true;
  v.accessories = false;
  return v;
}

export function shouldRenderBlock(
  id: BlockId,
  visibility: BlockVisibility,
  opts: { previewAll?: boolean } = {}
): boolean {
  const def = BLOCKS.find((b) => b.id === id);
  if (!def) return false;
  if (def.fixed) return true;
  if (opts.previewAll) return true;
  return visibility[id] !== false;
}

export function getBlockDef(id: BlockId): BlockDef | undefined {
  return BLOCKS.find((b) => b.id === id);
}

// ============================================
// Types de blocs INSÉRABLES (ProductContentBlock)
// ============================================
export type ContentBlockType = 'text-media' | 'gallery' | 'highlight';

export interface ContentBlockTypeDef {
  type: ContentBlockType;
  name: string;
  description: string;
  /** Icône (clé Lucide) — l'éditeur la résout lui-même */
  iconKey: 'columns' | 'gallery-horizontal-end' | 'sparkles';
}

export const CONTENT_BLOCK_TYPES: ContentBlockTypeDef[] = [
  {
    type: 'text-media',
    name: 'Texte + Média',
    description: 'Une colonne de texte côte à côte avec une image ou une vidéo. Position du média réglable.',
    iconKey: 'columns',
  },
  {
    type: 'gallery',
    name: 'Galerie',
    description: 'Grille de plusieurs images avec un titre optionnel.',
    iconKey: 'gallery-horizontal-end',
  },
  {
    type: 'highlight',
    name: 'Encadré highlight',
    description: 'Carte centrée avec fond clair, titre, texte et bouton d\'appel à l\'action.',
    iconKey: 'sparkles',
  },
];

// ============================================
// Structure d'un ProductContentBlock côté front
// ============================================
export interface ProductContentBlockData {
  id: number;
  hearingAidId?: number;
  order: number;
  isVisible: boolean;
  blockType: ContentBlockType;
  afterBlockId: string | null; // BlockId ou null (= fin de page)
  metadata: string | null;     // JSON spécifique au type
  title: string | null;
  description: string | null;
  mediaUrl: string | null;
  mediaType: string;           // "image" ou "video"
  mediaAlt: string | null;
  mediaFocal: string | null;   // object-position CSS (ex: "50% 30%"), recadrage du média
  mediaZoom: number;           // échelle du zoom (1 = pas de zoom, jusqu'à 2.5)
  mediaPosition: string;       // "left" ou "right"
  backgroundColor: string | null;
}

export interface GalleryMetadata { images: string[]; }
export interface HighlightMetadata { ctaLabel?: string; ctaHref?: string; }

export function parseMetadata<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

/**
 * Defaults pour un nouveau bloc, par type.
 */
export function defaultContentBlock(type: ContentBlockType, afterBlockId: BlockId | null): Omit<ProductContentBlockData, 'id'> {
  const common = {
    order: 0,
    isVisible: true,
    blockType: type,
    afterBlockId,
    title: null,
    description: null,
    mediaUrl: null,
    mediaType: 'image',
    mediaAlt: null,
    mediaFocal: 'center center',
    mediaZoom: 1,
    mediaPosition: 'right',
    backgroundColor: null,
    metadata: null as string | null,
  };
  switch (type) {
    case 'text-media':
      return { ...common, title: 'Nouveau titre', description: 'Texte de la section…' };
    case 'gallery':
      return { ...common, title: 'Galerie', metadata: JSON.stringify({ images: [] } satisfies GalleryMetadata) };
    case 'highlight':
      return {
        ...common, title: 'Titre de l\'encadré', description: 'Description courte qui appuie le titre.',
        metadata: JSON.stringify({ ctaLabel: 'En savoir plus', ctaHref: '/prendre-rendez-vous' } satisfies HighlightMetadata),
      };
  }
}

// ============================================
// Image positions (focal point)
// ============================================
// Stocké dans HearingAid.imagePositions (JSON string).
// Forme : { [fieldName]: { x: 0-100, y: 0-100 } }

export interface FocalPoint { x: number; y: number; zoom?: number; }
export type ImagePositions = Record<string, FocalPoint>;

export function parseImagePositions(raw: string | null | undefined): ImagePositions {
  if (!raw) return {};
  try {
    const v = JSON.parse(raw);
    return (v && typeof v === 'object') ? (v as ImagePositions) : {};
  } catch { return {}; }
}

export function getFocal(positions: ImagePositions, key: string): FocalPoint {
  const p = positions[key];
  return p && typeof p.x === 'number' && typeof p.y === 'number'
    ? { x: p.x, y: p.y, zoom: clampZoom(p.zoom) }
    : { x: 50, y: 50, zoom: 1 };
}

/** Borne le zoom dans une plage utilisable (1 = taille normale, 2.5 = zoom max). */
export function clampZoom(zoom: number | null | undefined): number {
  if (typeof zoom !== 'number' || Number.isNaN(zoom)) return 1;
  return Math.max(1, Math.min(2.5, zoom));
}

export function getZoom(positions: ImagePositions, key: string): number {
  return clampZoom(positions[key]?.zoom);
}

/** Convertit un focal point en `object-position` CSS. */
export function focalToObjectPosition(p: FocalPoint): string {
  return `${p.x}% ${p.y}%`;
}

const OBJECT_POSITION_KEYWORDS: Record<string, number> = { left: 0, top: 0, center: 50, right: 100, bottom: 100 };

/** Parse une string `object-position` CSS ("50% 30%", "center top"…) en FocalPoint, en y associant un zoom. */
export function parseObjectPosition(css: string | null | undefined, zoom?: number | null): FocalPoint {
  const fallback = { x: 50, y: 50, zoom: clampZoom(zoom) };
  if (!css || !css.trim()) return fallback;
  const [rawX, rawY] = css.trim().split(/\s+/);
  const toPercent = (token: string | undefined) => {
    if (!token) return 50;
    if (token.endsWith('%')) { const n = parseFloat(token); return Number.isNaN(n) ? 50 : n; }
    return OBJECT_POSITION_KEYWORDS[token.toLowerCase()] ?? 50;
  };
  return { x: toPercent(rawX), y: toPercent(rawY), zoom: clampZoom(zoom) };
}

/**
 * Style à appliquer à une image en `object-fit: cover` pour à la fois
 * recadrer (object-position) et zoomer (transform: scale, centré sur le point focal).
 */
export function focalToImageStyle(p: FocalPoint | null | undefined): { objectPosition?: string; transform?: string; transformOrigin?: string } {
  if (!p) return {};
  const pos = focalToObjectPosition(p);
  const zoom = clampZoom(p.zoom);
  if (zoom === 1) return { objectPosition: pos };
  return { objectPosition: pos, transform: `scale(${zoom})`, transformOrigin: pos };
}

// ============================================
// Section kickers (textes bleus uppercase au-dessus de chaque H2)
// ============================================
// Stockés dans HearingAid.sectionKickers (JSON string) — éditables par appareil.
// Si non définis, on tombe sur les libellés par défaut (DEFAULT_KICKERS).

export type KickerKey =
  | 'promises'
  | 'section1'
  | 'section2'
  | 'highlight1'
  | 'section3'
  | 'section4'
  | 'highlight2'
  | 'accessories';

export type SectionKickers = Partial<Record<KickerKey, string>>;

export const DEFAULT_KICKERS: Required<SectionKickers> = {
  promises:    "Tout ce qu'il vous faut",
  section1:    "À propos",
  section2:    "Design",
  highlight1:  "Highlight",
  section3:    "Connectivité",
  section4:    "Rechargeable",
  highlight2:  "L'expérience au quotidien",
  accessories: "Compatible avec",
};

export function parseKickers(raw: string | null | undefined): Required<SectionKickers> {
  if (!raw) return { ...DEFAULT_KICKERS };
  try {
    const p = JSON.parse(raw);
    if (!p || typeof p !== 'object') return { ...DEFAULT_KICKERS };
    // Filtre : on ne garde que les clés connues + valeurs string non-vides
    const cleaned: SectionKickers = {};
    for (const k of Object.keys(DEFAULT_KICKERS) as KickerKey[]) {
      const v = (p as Record<string, unknown>)[k];
      if (typeof v === 'string' && v.trim().length > 0) cleaned[k] = v;
    }
    return { ...DEFAULT_KICKERS, ...cleaned };
  } catch {
    return { ...DEFAULT_KICKERS };
  }
}

// ============================================
// Hero badges (puces colorées sous le CTA du héros, ex: "Essai gratuit 30 jours")
// ============================================
// Stockés dans HearingAid.heroBadges (JSON string) — array de { text, dotColor }.
// dotColor accepte un hex (#86efac) ou un mot-clé CSS — vide = pas de puce.

export interface HeroBadge { text: string; dotColor: string; }

export const DEFAULT_HERO_BADGES: HeroBadge[] = [
  { text: 'Essai gratuit 30 jours', dotColor: '#86efac' },
  { text: 'Remboursement INAMI',    dotColor: '#86efac' },
];

export function parseHeroBadges(raw: string | null | undefined): HeroBadge[] {
  if (raw == null) return [...DEFAULT_HERO_BADGES];
  try {
    const p = JSON.parse(raw);
    if (!Array.isArray(p)) return [...DEFAULT_HERO_BADGES];
    // Tableau vide explicite = aucune puce (intentionnel)
    return p
      .filter((b: unknown): b is { text: unknown; dotColor?: unknown } =>
        b !== null && typeof b === 'object' && typeof (b as { text?: unknown }).text === 'string'
      )
      .map((b) => ({
        text: String(b.text),
        dotColor: typeof b.dotColor === 'string' ? b.dotColor : '',
      }));
  } catch {
    return [...DEFAULT_HERO_BADGES];
  }
}

// ============================================
// Extras par section (Sprint 5.9)
// ============================================
// Stockés dans HearingAid.sectionExtras (JSON) — un objet keyé par section.
// Chaque section peut contenir :
//   - extraImages : tableau d'URLs (affichées en bande horizontale scrollable)
//   - stats       : tableau de "stat cards" (un grand chiffre + un petit libellé)

export interface StatCard {
  num: string;
  label: string;
}

export interface SectionExtra {
  extraImages?: string[];
  stats?: StatCard[];
}

// Clés de section où l'on peut ajouter des extras
export type ExtrasSectionKey =
  | 'hero'
  | 'promises'
  | 'section1'
  | 'section2'
  | 'highlight1'
  | 'section3'
  | 'section4';

export type SectionExtras = Partial<Record<ExtrasSectionKey, SectionExtra>>;

export function parseSectionExtras(raw: string | null | undefined): SectionExtras {
  if (!raw) return {};
  try {
    const p = JSON.parse(raw);
    if (!p || typeof p !== 'object') return {};
    const out: SectionExtras = {};
    for (const k of Object.keys(p) as ExtrasSectionKey[]) {
      const v = (p as Record<string, unknown>)[k];
      if (!v || typeof v !== 'object') continue;
      const entry: SectionExtra = {};
      const imgs = (v as { extraImages?: unknown }).extraImages;
      if (Array.isArray(imgs)) entry.extraImages = imgs.filter((u) => typeof u === 'string') as string[];
      const stats = (v as { stats?: unknown }).stats;
      if (Array.isArray(stats)) {
        entry.stats = stats
          .filter((s): s is { num: unknown; label: unknown } => s !== null && typeof s === 'object')
          .map((s) => ({ num: String(s.num ?? ''), label: String(s.label ?? '') }))
          .filter((s) => s.num || s.label);
      }
      if (entry.extraImages?.length || entry.stats?.length) out[k] = entry;
    }
    return out;
  } catch {
    return {};
  }
}

export function getSectionExtra(extras: SectionExtras, key: ExtrasSectionKey): SectionExtra {
  return extras[key] || {};
}

// ============================================
// Accessoires partagés (Sprint 5.9)
// ============================================
// Liste maintenue dans un Setting (key = "accessories.shared") au format JSON.
// Chaque appareil stocke un sous-ensemble via HearingAid.accessoryIds (JSON: number[]).

export interface Accessory {
  id: number;
  name: string;
  imageUrl?: string;
  href?: string;
  description?: string;
}

export function parseAccessoriesList(raw: string | null | undefined): Accessory[] {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw);
    if (!Array.isArray(p)) return [];
    return p
      .filter((a): a is Record<string, unknown> => a !== null && typeof a === 'object')
      .map((a, i): Accessory => {
        const idRaw = a.id;
        const id = typeof idRaw === 'number' ? idRaw : Number(idRaw) || (i + 1);
        const name = typeof a.name === 'string' ? a.name : '';
        const imageUrl = typeof a.imageUrl === 'string' ? a.imageUrl : undefined;
        const href = typeof a.href === 'string' ? a.href : undefined;
        const description = typeof a.description === 'string' ? a.description : undefined;
        return { id, name, imageUrl, href, description };
      })
      .filter((a) => a.name);
  } catch {
    return [];
  }
}

export function parseAccessoryIds(raw: string | null | undefined): number[] {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw);
    if (!Array.isArray(p)) return [];
    return p.filter((n): n is number => typeof n === 'number').sort((a, b) => a - b);
  } catch {
    return [];
  }
}
