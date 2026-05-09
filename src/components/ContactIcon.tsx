'use client';

// src/components/ContactIcon.tsx
// Affiche une icône depuis Settings — Lucide ou emoji.
// Utilise un cache via fetch + setState pour ne pas rappeler l'API à chaque rendu.

import { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';

type Props = {
  /** Clé de réglage : 'contact_icon_phone' | 'contact_icon_email' | 'contact_icon_address' | 'contact_icon_mobile' */
  settingKey: string;
  /** Valeur par défaut si Settings ne renvoie rien (emoji ou nom Lucide) */
  fallback?: string;
  /** Taille pour Lucide (px). Pour les emojis, contrôlez via la classe parente. */
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

  // Si la valeur ressemble à un nom Lucide (kebab-case ou PascalCase, lettres/tirets seulement) → render Lucide
  const isLucide = /^[a-zA-Z][a-zA-Z0-9-]*$/.test(value);
  if (isLucide) {
    const Comp = (Icons as any)[toLucideName(value)] as React.ComponentType<{ size?: number; className?: string }> | undefined;
    if (Comp) return <Comp size={size} className={className} />;
  }
  // Si la valeur ressemble à une URL d'image → render <img>
  const isImage = /^(https?:\/\/|\/)/.test(value) || /\.(png|jpg|jpeg|svg|gif|webp)$/i.test(value);
  if (isImage) {
    return (
      <img
        src={value}
        alt=""
        style={{ width: size, height: size, objectFit: 'contain' }}
        className={className}
      />
    );
  }
  // Sinon → emoji ou texte
  return <span className={className}>{value}</span>;
}
