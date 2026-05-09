'use client';

// src/components/BlockLayoutWrapper.tsx
// Lit le layout stocké pour `blockKey` et applique les classes Tailwind correspondantes
// au DIV qui enveloppe ses enfants. Public (GET /api/admin/block-layout est accessible).
//
// Usage côté page :
//   <BlockLayoutWrapper blockKey="home.hero-reassure-title" defaultMaxWidth="2xl">
//     <div className="bg-white/10 …">…</div>
//   </BlockLayoutWrapper>

import { useEffect, useState } from 'react';

export type BlockLayout = {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  align?: 'left' | 'center' | 'right';
  padding?: 'compact' | 'normal' | 'large';
  hideDesktop?: boolean;
  hideTablet?: boolean;
  hideMobile?: boolean;
};

const MAX_W: Record<NonNullable<BlockLayout['maxWidth']>, string> = {
  sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl',
  '2xl': 'max-w-2xl', '3xl': 'max-w-3xl', '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl', '6xl': 'max-w-6xl', '7xl': 'max-w-7xl', full: 'max-w-full',
};
const ALIGN: Record<NonNullable<BlockLayout['align']>, string> = {
  left: 'text-left mr-auto ml-0',
  center: 'text-center mx-auto',
  right: 'text-right ml-auto mr-0',
};
const PADDING: Record<NonNullable<BlockLayout['padding']>, string> = {
  compact: 'p-3', normal: 'p-6', large: 'p-10',
};

// Cache global pour éviter les appels redondants
const cache: Record<string, BlockLayout | null> = {};
const inflight: Record<string, Promise<BlockLayout | null>> = {};

async function loadLayout(key: string): Promise<BlockLayout | null> {
  if (cache[key] !== undefined) return cache[key];
  if (!inflight[key]) {
    inflight[key] = fetch(`/api/admin/block-layout?key=${encodeURIComponent(key)}`)
      .then((r) => (r.ok ? r.json() : { layout: null }))
      .then((d) => { cache[key] = d.layout || null; return cache[key]; })
      .catch(() => { cache[key] = null; return null; });
  }
  return inflight[key];
}

export function clearLayoutCache(key?: string) {
  if (key) { delete cache[key]; delete inflight[key]; }
  else { Object.keys(cache).forEach(k => delete cache[k]); Object.keys(inflight).forEach(k => delete inflight[k]); }
}

export function useBlockLayout(blockKey: string): BlockLayout | null {
  const [layout, setLayout] = useState<BlockLayout | null>(null);
  useEffect(() => {
    let active = true;
    loadLayout(blockKey).then((l) => { if (active) setLayout(l); });
    return () => { active = false; };
  }, [blockKey]);
  return layout;
}

export function layoutToClasses(l: BlockLayout | null, defaults: BlockLayout = {}): string {
  if (!l && !defaults) return '';
  const merged = { ...defaults, ...(l || {}) };
  const out: string[] = [];
  if (merged.maxWidth) out.push(MAX_W[merged.maxWidth]);
  if (merged.align) out.push(ALIGN[merged.align]);
  if (merged.padding) out.push(PADDING[merged.padding]);
  if (merged.hideDesktop) out.push('lg:hidden');
  if (merged.hideTablet) out.push('md:max-lg:hidden');
  if (merged.hideMobile) out.push('max-md:hidden');
  return out.join(' ');
}

type Props = {
  blockKey: string;
  defaultMaxWidth?: BlockLayout['maxWidth'];
  defaultAlign?: BlockLayout['align'];
  defaultPadding?: BlockLayout['padding'];
  /** Classes additionnelles toujours appliquées (ex: bg, rounded, animate) */
  className?: string;
  children: React.ReactNode;
};

export default function BlockLayoutWrapper({
  blockKey, defaultMaxWidth, defaultAlign, defaultPadding, className = '', children,
}: Props) {
  const layout = useBlockLayout(blockKey);
  const cls = layoutToClasses(layout, {
    maxWidth: defaultMaxWidth, align: defaultAlign, padding: defaultPadding,
  });
  return <div data-block-layout={blockKey} className={`${cls} ${className}`.trim()}>{children}</div>;
}
