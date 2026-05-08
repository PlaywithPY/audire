'use client';

// src/components/Editable.tsx
// Helper pour rendre un texte éditable depuis l'éditeur admin.
// Remplace le pattern :
//   <h1>{texts['hero-title'] || 'Titre par défaut'}</h1>
// par :
//   <Editable as="h1" pageKey="faq" textKey="hero-title" fallback="Titre par défaut" />
//
// Le composant :
// - Lit la valeur depuis un cache fourni par le parent (texts), OU charge tout seul
// - Ajoute `data-edit-block="<pageKey>.<textKey>"` automatiquement
// - Reste un simple <h1>/<p>/<span>/etc. en production normale
//
// Usage simple (le parent passe déjà les textes — recommandé) :
//   <Editable as="h1" pageKey="faq" textKey="hero-title" fallback="Titre" texts={texts} />
//
// Usage autonome (le composant fetch lui-même — pratique pour blocs isolés) :
//   <Editable as="h1" pageKey="faq" textKey="hero-title" fallback="Titre" />

import { useEffect, useState, type ElementType, type ReactNode, type HTMLAttributes } from 'react';

type EditableProps = {
  as?: ElementType;
  pageKey: string;
  textKey: string;
  fallback?: string;
  texts?: Record<string, string>;
  className?: string;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, 'children'>;

const cache = new Map<string, Record<string, string>>();

export default function Editable({
  as: Tag = 'span',
  pageKey,
  textKey,
  fallback,
  texts,
  className,
  children,
  ...rest
}: EditableProps) {
  const [autoTexts, setAutoTexts] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    if (texts) return; // parent fournit déjà
    if (cache.has(pageKey)) { setAutoTexts(cache.get(pageKey)!); return; }
    let cancelled = false;
    fetch(`/api/page-texts?pageKey=${pageKey}`)
      .then((r) => r.ok ? r.json() : {})
      .then((data) => {
        if (cancelled) return;
        cache.set(pageKey, data);
        setAutoTexts(data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [pageKey, textKey, texts]);

  const source = texts ?? autoTexts ?? {};
  const value = source[textKey] ?? fallback ?? '';

  return (
    <Tag
      data-edit-block={`${pageKey}.${textKey}`}
      className={className}
      {...rest}
    >
      {children ?? value}
    </Tag>
  );
}
