// =====================================================
// Audire — Définitions partagées des blocs de page produit
// =====================================================
// Source de vérité pour l'ordre, la métadonnée et la visibilité
// par défaut des blocs de la fiche appareil v2 (gabarit Zeal).
//
// Utilisé par :
//   - DevicePageRenderer.tsx (rendu public + preview admin)
//   - src/app/admin/appareils-v2/[slug]/page.tsx (rail + inspector)

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
  fixed?: boolean; // si true, non-masquable (toujours rendu)
  hasRepeat?: boolean; // si true, comporte une liste répétable
  repeatLabel?: string;
}

export const BLOCKS: BlockDef[] = [
  { id: 'topbanner',   name: 'Bandeau téléphone',          group: 'chrome'  },
  { id: 'header',      name: 'En-tête de site',             group: 'chrome',  fixed: true },
  { id: 'crumbs',      name: "Fil d'Ariane",                group: 'chrome'  },
  { id: 'hero',        name: 'Héros',                       group: 'content' },
  { id: 'promises',    name: 'Promesses (avantages)',       group: 'content', hasRepeat: true, repeatLabel: 'promesse' },
  { id: 'section-1',   name: 'Section · Texte + Média',     group: 'content' },
  { id: 'section-2',   name: 'Section · Image + Texte',     group: 'content' },
  { id: 'highlight-1', name: 'Highlight · Encadré 1',       group: 'content' },
  { id: 'section-3',   name: 'Section · Texte + Image',     group: 'content' },
  { id: 'section-4',   name: 'Section · Média + Texte',     group: 'content' },
  { id: 'highlight-2', name: 'Highlight · Encadré 2 (galerie)', group: 'content', hasRepeat: true, repeatLabel: 'image' },
  { id: 'accessories', name: 'Accessoires (liste libre)',   group: 'content', hasRepeat: true, repeatLabel: 'accessoire' },
  { id: 'faq',         name: 'FAQ produit',                 group: 'content', hasRepeat: true, repeatLabel: 'question' },
  { id: 'form',        name: 'Formulaire de contact',       group: 'cta'     },
  { id: 'cta-final',   name: 'CTA finale',                  group: 'cta'     },
  { id: 'footer',      name: 'Pied de page',                group: 'chrome',  fixed: true },
];

export type BlockVisibility = Partial<Record<BlockId, boolean>>;

/**
 * Parse le champ JSON `blockVisibility` stocké en base.
 * Fallback : null/invalid → tous les blocs visibles (rétrocompatibilité).
 */
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
  // Le bloc "accessoires" n'a pas encore de champ Prisma dédié : masqué par défaut.
  v.accessories = false;
  return v;
}

/**
 * Décide si un bloc doit être rendu, en tenant compte :
 *   - du flag de visibilité explicite
 *   - du caractère `fixed` (header/footer toujours rendus)
 *   - éventuellement d'un mode "preview admin" qui force tout à apparaître
 */
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
