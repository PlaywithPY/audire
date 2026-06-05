'use client';

// =====================================================
// FocalField — sélecteur de point focal "universel"
// =====================================================
// Brique réutilisable pour TOUTES les surfaces qui gèrent une image et
// stockent le cadrage sous forme d'une string CSS `object-position`
// (ex. "center 35%", "left top", "50% 50%").
//
// Réutilise le FocalPointPicker (drag d'un point sur l'image) déjà utilisé
// dans l'éditeur produit appareils-v2, mais convertit en/depuis la string
// CSS attendue par les cartes (CardImage.imagePosition, etc.).
//
// Usage :
//   <FocalField
//     imageUrl={image}
//     value={position}                 // string CSS object-position
//     onChange={(pos) => setPosition(pos)}
//     aspect="video"
//   />

import FocalPointPicker from './FocalPointPicker';

interface Props {
  /** URL de l'image à recadrer (vide = état placeholder) */
  imageUrl: string | null | undefined;
  /** Valeur courante : string CSS `object-position` (ex. "center 35%") */
  value: string;
  /** Renvoie une nouvelle string CSS `object-position` */
  onChange: (next: string) => void;
  /** Ratio d'aperçu du picker */
  aspect?: 'square' | 'video' | 'auto';
  /** Libellé optionnel au-dessus du picker */
  label?: string;
  /** Afficher les raccourcis (Centre / Haut / Bas / Gauche / Droite). Défaut: true */
  presets?: boolean;
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));

/** Convertit un token CSS (mot-clé ou %) en pourcentage sur l'axe demandé. */
function tokenToPercent(token: string, axis: 'x' | 'y'): number {
  const t = token.trim().toLowerCase();
  if (t.endsWith('%')) {
    const n = parseFloat(t);
    return Number.isNaN(n) ? 50 : clamp(n);
  }
  if (t === 'center') return 50;
  if (axis === 'x') {
    if (t === 'left') return 0;
    if (t === 'right') return 100;
  } else {
    if (t === 'top') return 0;
    if (t === 'bottom') return 100;
  }
  const n = parseFloat(t);
  return Number.isNaN(n) ? 50 : clamp(n);
}

/** "center 35%" → { x: 50, y: 35 } (tolère l'ordre inversé des mots-clés). */
export function parsePosition(value: string | null | undefined): { x: number; y: number } {
  if (!value || !value.trim()) return { x: 50, y: 50 };
  const parts = value.trim().split(/\s+/);
  let xs = parts[0] ?? 'center';
  let ys = parts[1] ?? 'center';
  // object-position autorise "top left" aussi bien que "left top" : on remet x/y dans l'ordre.
  if (/^(top|bottom)$/.test(xs.toLowerCase()) || /^(left|right)$/.test(ys.toLowerCase())) {
    const tmp = xs; xs = ys; ys = tmp;
  }
  return { x: tokenToPercent(xs, 'x'), y: tokenToPercent(ys, 'y') };
}

/** { x: 50, y: 35 } → "50% 35%" */
export function formatPosition(p: { x: number; y: number }): string {
  return `${Math.round(clamp(p.x))}% ${Math.round(clamp(p.y))}%`;
}

const PRESETS: ReadonlyArray<{ label: string; value: string }> = [
  { label: 'Centre', value: '50% 50%' },
  { label: 'Haut', value: '50% 0%' },
  { label: 'Bas', value: '50% 100%' },
  { label: 'Gauche', value: '0% 50%' },
  { label: 'Droite', value: '100% 50%' },
];

export default function FocalField({
  imageUrl,
  value,
  onChange,
  aspect = 'video',
  label,
  presets = true,
}: Props) {
  const hasImage = !!imageUrl && imageUrl.trim() !== '';
  const focal = parsePosition(value);

  // Un preset est "actif" si la position courante correspond exactement.
  const current = formatPosition(focal);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-500">
          {label}
        </label>
      )}

      {hasImage ? (
        <FocalPointPicker
          imageUrl={imageUrl as string}
          value={focal}
          onChange={(f) => onChange(formatPosition(f))}
          aspect={aspect}
        />
      ) : (
        <div
          className={`w-full ${aspect === 'square' ? 'aspect-square' : 'aspect-video'} rounded-lg border border-dashed border-gray-300 bg-gray-50 grid place-items-center text-[11px] text-gray-400 text-center px-3`}
        >
          Ajoutez une image pour régler le point focal
        </div>
      )}

      {presets && hasImage && (
        <div className="flex flex-wrap gap-1">
          {PRESETS.map((p) => {
            const active = formatPosition(parsePosition(p.value)) === current;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => onChange(p.value)}
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                  active
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
