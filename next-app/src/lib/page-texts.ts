/**
 * Helper pour charger et utiliser les textes de la table PageText
 */

import React from 'react';
import { prisma } from '@/lib/prisma';

/**
 * Récupère tous les textes d'une page depuis la DB
 * Retourne un objet avec textKey => content
 *
 * @example
 * const texts = await getPageTexts('home');
 * console.log(texts['hero-title']); // "Mieux entendre, simplement."
 */
export async function getPageTexts(pageKey: string): Promise<Record<string, string>> {
  const pageTexts = await prisma.pageText.findMany({
    where: { pageKey },
    select: {
      textKey: true,
      content: true,
    },
  });

  // Convertir en objet pour un accès facile
  const textsMap: Record<string, string> = {};
  for (const text of pageTexts) {
    textsMap[text.textKey] = text.content;
  }

  return textsMap;
}

/**
 * Récupère un texte spécifique d'une page
 * Retourne le contenu ou la valeur par défaut si non trouvé
 *
 * @example
 * const title = await getPageText('home', 'hero-title', 'Titre par défaut');
 */
export async function getPageText(
  pageKey: string,
  textKey: string,
  defaultValue: string = ''
): Promise<string> {
  const pageText = await prisma.pageText.findUnique({
    where: {
      pageKey_textKey: {
        pageKey,
        textKey,
      },
    },
    select: {
      content: true,
    },
  });

  return pageText?.content ?? defaultValue;
}

/**
 * Composant React Server Component pour afficher un texte de la DB
 *
 * @example
 * <PageText pageKey="home" textKey="hero-title" />
 * <PageText pageKey="home" textKey="hero-title" fallback="Titre par défaut" />
 * <PageText pageKey="home" textKey="hero-title" as="h1" className="text-5xl" />
 */
type PageTextProps = {
  pageKey: string;
  textKey: string;
  fallback?: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  dangerouslySetInnerHTML?: boolean;
};

export async function PageText({
  pageKey,
  textKey,
  fallback = '',
  as = 'span',
  className,
  dangerouslySetInnerHTML = false,
}: PageTextProps) {
  const content = await getPageText(pageKey, textKey, fallback);

  if (dangerouslySetInnerHTML) {
    return React.createElement(as, {
      className,
      dangerouslySetInnerHTML: { __html: content },
    });
  }

  return React.createElement(as, { className }, content);
}

/**
 * Hook client-side pour charger les textes d'une page
 * Utilise l'API pour récupérer les textes côté client
 *
 * @example
 * 'use client';
 * const { texts, loading, error } = usePageTexts('home');
 * return <h1>{texts['hero-title']}</h1>;
 */
export function usePageTexts(pageKey: string) {
  // Ce hook serait implémenté côté client avec useState/useEffect
  // Pour l'instant, on utilise les Server Components
  throw new Error('usePageTexts not implemented yet - use Server Components instead');
}
