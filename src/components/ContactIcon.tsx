'use client';

// src/components/ContactIcon.tsx
// Affiche une icône depuis Settings — image uploadée, Lucide ou emoji.
// Une seule chaîne stockée dans Settings :
//   - URL ("https://…" ou "/images/…" ou ".jpg/.png/.svg/…") → <img>
//   - Identifiant Lucide kebab-case ("phone", "map-pin", "mail-open") → composant Lucide
//   - Sinon → texte / emoji

import { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';

type Props = {
  /** Clé de réglage : 'contact_icon_phone' | 'contact_icon_email' | 'contact_icon_address' | 'contact_icon_mobile' */
  settingKey: string;
  /** Valeur par défaut si Settings ne renvoie rien (emoji, nom Lucide ou URL) */
  fallback?: string;
  /** Taille en px (Lucide + image). Pour les emojis, contrôlez via la classe parente. */
  size?: number;
  className?: string;
};

// Cache global partagé entre instances pour éviter N appels.
const cache: Record<string, string | null> = {};
const inflight: Record<string, Promise<string | null>> = {};

async function loadIcon(key: string): Promise<string | null> {
  if (cache[key] !== undefined) return cache[key];
  if (!inflight[key]) {
    inflight[key] = fetch(`/api/settings?key=${encodeURIComponent(key)}`)
      .then((r) => (r.ok ? r.json() : { value: null }))
      .then((d) => {
        cache[key] = d.value || null;
        return cache[key];
      })
      .catch(() => {
        cache[key] = null;
        return null;
      });
  }
  return inflight[key];
}

/** Convertit "phone" / "phone-call" en "Phone" / "PhoneCall" pour récupérer dans lucide-react */
function toLucideName(name: string): string {
  return name
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}

/** Détecte si la valeur est une URL d'image (absolue, relative ou par extension) */
export function isImageValue(value: string): boolean {
  if (!value) return false;
  if (/^(https?:\/\/|\/|data:image\/|blob:)/i.test(value)) return true;
  if (/\.(png|jpe?g|svg|gif|webp|avif)(\?.*)?$/i.test(value)) return true;
  return false;
}

export default function ContactIcon({ settingKey, fallback = '', size = 28, className = '' }: Props) {
  const [value, setValue] = useState<string>(fallback);

  useEffect(() => {
    let active = true;
    loadIcon(settingKey).then((v) => {
      if (active && v) setValue(v);
    });
    return () => {
      active = false;
    };
  }, [settingKey]);

  // 1) Image uploadée → <img>
  if (isImageValue(value)) {
    return (
      <img
        src={value}
        alt=""
        style={{ width: size, height: size, objectFit: 'contain' }}
        className={className}
      />
    );
  }

  // 2) Nom Lucide (kebab/PascalCase, lettres/tirets seulement) → render Lucide
  const isLucide = /^[a-zA-Z][a-zA-Z0-9-]*$/.test(value);
  if (isLucide) {
    const Comp = (Icons as any)[toLucideName(value)] as
      | React.ComponentType<{ size?: number; className?: string }>
      | undefined;
    if (Comp) return <Comp size={size} className={className} />;
  }

  // 3) Sinon → emoji ou texte brut
  return <span className={className}>{value}</span>;
}
