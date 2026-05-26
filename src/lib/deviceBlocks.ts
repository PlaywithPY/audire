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

export interface FocalPoint { x: number; y: number; }
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
  return p && typeof p.x === 'number' && typeof p.y === 'number' ? p : { x: 50, y: 50 };
}

/** Convertit un focal point en `object-position` CSS. */
export function focalToObjectPosition(p: FocalPoint): string {
  return `${p.x}% ${p.y}%`;
}
