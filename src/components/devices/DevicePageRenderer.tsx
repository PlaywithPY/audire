'use client';

// =====================================================
// DevicePageRenderer (v2.1) — rendu unifié de la fiche appareil
// =====================================================
// v2.1 :
//   - Affiche les ProductContentBlock insérés à la bonne place
//     (après chaque bloc fixe, selon afterBlockId)
//   - Applique le focal point (imagePositions) aux médias
//   - 3 types de blocs insérables : text-media, gallery, highlight

import { useState } from 'react';
import Link from 'next/link';
import {
  BLOCKS,
  BlockId,
  BlockVisibility,
  shouldRenderBlock,
  ProductContentBlockData,
  parseMetadata,
  GalleryMetadata,
  HighlightMetadata,
  parseImagePositions,
  getFocal,
  focalToObjectPosition,
  parseKickers,
  parseHeroBadges,
} from '@/lib/deviceBlocks';

// ============================================
// Types
// ============================================
export interface HearingAidData {
  id: number;
  slug: string;
  name: string;
  brand: string;
  range: string | null;
  type: string | null;
  shortDesc: string | null;
  price: string | null;
  mainImage: string | null;
  gallery: string | null;

  heroGradientFrom: string | null;
  heroGradientTo: string | null;
  heroImage: string | null;
  heroDescription: string | null;

  advantages: string | null;
  section1Title: string | null;
  section1Description: string | null;
  section1MediaUrl: string | null;
  section1MediaType: string | null;
  section2Title: string | null;
  section2Description: string | null;
  section2Image: string | null;
  section3Title: string | null;
  section3Description: string | null;
  section3Image: string | null;
  section4Title: string | null;
  section4Description: string | null;
  section4MediaUrl: string | null;
  section4MediaType: string | null;
  highlightBox1Title: string | null;
  highlightBox1Description: string | null;
  highlightBox1Image: string | null;
  highlightBox2Title: string | null;
  highlightBox2Images: string | null;
  productFAQs: string | null;

  blockVisibility: string | null;
  imagePositions: string | null;
  /** Sprint 5.8 — JSON : { promises, section1, section2, highlight1, section3, section4, highlight2, accessories } */
  sectionKickers?: string | null;
  /** Sprint 5.8 — JSON : [{ text, dotColor }] */
  heroBadges?: string | null;
  contentBlocks?: ProductContentBlockData[];
}

export interface Advantage { title: string; description: string; icon: string; }
export interface FAQ { question: string; answer: string; }

export interface DevicePageRendererProps {
  product: HearingAidData;
  visibility: BlockVisibility;
  previewAll?: boolean;
  selectedBlock?: BlockId | string | null;
  onBlockSelect?: (id: BlockId | string) => void;
}

// ============================================
// Helpers
// ============================================
function safeParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

// ============================================
// Component
// ============================================
export default function DevicePageRenderer({
  product,
  visibility,
  previewAll = false,
  selectedBlock = null,
  onBlockSelect,
}: DevicePageRendererProps) {
  const advantages = safeParse<Advantage[]>(product.advantages, []);
  const faqs = safeParse<FAQ[]>(product.productFAQs, []);
  const highlight2Images = safeParse<string[]>(product.highlightBox2Images, []);
  const gallery = safeParse<string[]>(product.gallery, []);
  const imagePositions = parseImagePositions(product.imagePositions);
  const contentBlocks = product.contentBlocks || [];

  // Sprint 5.8 — kickers + heroBadges éditables
  const kickers     = parseKickers(product.sectionKickers);
  const heroBadges  = parseHeroBadges(product.heroBadges);

  const heroFrom = product.heroGradientFrom || '#42a4ff';
  const heroTo   = product.heroGradientTo   || '#2d87e6';

  const onClickBlock = (id: BlockId | string) => {
    if (onBlockSelect) onBlockSelect(id);
  };

  // Wrapper helper — pour les blocs FIXES
  const FixedBlock = ({ id, children }: { id: BlockId; children: React.ReactNode }) => {
    if (!shouldRenderBlock(id, visibility, { previewAll })) return null;
    const hidden = visibility[id] === false;
    const selected = selectedBlock === id;
    return (
      <section
        data-block={id}
        onClick={onBlockSelect ? (e) => { e.stopPropagation(); onClickBlock(id); } : undefined}
        className={[
          'relative transition-all',
          onBlockSelect ? 'cursor-pointer' : '',
          hidden ? 'opacity-40 grayscale' : '',
          selected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white' : '',
        ].join(' ')}
      >
        {previewAll && hidden && (
          <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-gray-900 text-white text-[10px] font-mono uppercase tracking-wider shadow-lg">
            Masqué
          </div>
        )}
        {children}
      </section>
    );
  };

  // Wrapper pour les blocs INSÉRÉS
  const InsertedBlock = ({ block, children }: { block: ProductContentBlockData; children: React.ReactNode }) => {
    if (!previewAll && !block.isVisible) return null;
    const selectedKey = `content:${block.id}`;
    const selected = selectedBlock === selectedKey;
    return (
      <section
        data-block={selectedKey}
        data-content-block-id={block.id}
        onClick={onBlockSelect ? (e) => { e.stopPropagation(); onClickBlock(selectedKey); } : undefined}
        className={[
          'relative transition-all',
          onBlockSelect ? 'cursor-pointer' : '',
          !block.isVisible && previewAll ? 'opacity-40 grayscale' : '',
          selected ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-white' : '',
        ].join(' ')}
      >
        {previewAll && (
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-mono uppercase tracking-wider shadow-lg">
            Bloc inséré · {block.blockType}
          </div>
        )}
        {children}
      </section>
    );
  };

  // Pour chaque bloc fixe, on récupère les blocs insérés qui s'affichent juste après
  function blocksAfter(fixedId: BlockId): ProductContentBlockData[] {
    return contentBlocks
      .filter((b) => b.afterBlockId === fixedId)
      .sort((a, b) => a.order - b.order);
  }
  // Blocs orphelins (afterBlockId null ou inconnu) → en queue avant le footer
  function orphanBlocks(): ProductContentBlockData[] {
    return contentBlocks
      .filter((b) => !b.afterBlockId || !BLOCKS.some((x) => x.id === b.afterBlockId))
      .sort((a, b) => a.order - b.order);
  }

  // Rend un ProductContentBlock selon son blockType
  const renderInserted = (b: ProductContentBlockData) => (
    <InsertedBlock key={b.id} block={b}>
      <ContentBlockRenderer block={b} />
    </InsertedBlock>
  );

  return (
    <div className="device-page bg-white text-gray-900" style={{ fontFamily: 'var(--font-body, Inter, system-ui, sans-serif)' }}>

      {/* TOP BANNER */}
      <FixedBlock id="topbanner">
        <div className="bg-primary-dark text-white text-xs sm:text-sm">
          <div className="max-w-6xl mx-auto px-6 py-2 flex flex-wrap items-center justify-between gap-2">
            <span>📞 042 75 06 66 — Centre Audire, Jemeppe-sur-Meuse</span>
            <span className="hidden md:inline">Test auditif gratuit · Essai 30 jours sans engagement</span>
          </div>
        </div>
      </FixedBlock>
      {blocksAfter('topbanner').map(renderInserted)}

      {/* HEADER */}
      <FixedBlock id="header">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[var(--border,#C4DDF8)] shadow-sm">
          <div className="max-w-6xl mx-auto px-6 min-h-[72px] flex items-center gap-6">
            <Link href="/" className="text-[26px] font-bold text-primary-dark tracking-tight" style={{ fontFamily: 'var(--font-heading, Playfair Display, Georgia, serif)' }}>
              audire<span className="text-primary">.</span>
            </Link>
            <nav className="hidden lg:flex items-center gap-5 flex-1 justify-center text-sm font-medium text-gray-700">
              <Link href="/" className="hover:text-primary">Accueil</Link>
              <Link href="/solutions-auditives" className="text-primary">Solutions auditives</Link>
              <Link href="/remboursements" className="hover:text-primary">Remboursements</Link>
              <Link href="/notre-accompagnement" className="hover:text-primary">Accompagnement</Link>
              <Link href="/notre-histoire" className="hover:text-primary">Notre histoire</Link>
              <Link href="/faq" className="hover:text-primary">FAQ</Link>
              <Link href="/contact" className="hover:text-primary">Contact</Link>
            </nav>
            <div className="hidden lg:flex items-center gap-2">
              <Link href="/prendre-rendez-vous" className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-dark transition">Prendre RDV</Link>
              <Link href="/contact" className="bg-white text-primary border-2 border-primary px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/5 transition">Test gratuit</Link>
            </div>
          </div>
        </header>
      </FixedBlock>
      {/* (pas d'insertion après header — chrome) */}

      {/* CRUMBS */}
      <FixedBlock id="crumbs">
        <div className="bg-[var(--bg-alt,#F0F7FF)] border-b border-[var(--border,#C4DDF8)]">
          <div className="max-w-6xl mx-auto px-6 py-3">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-primary">Accueil</Link>
              <span>/</span>
              <Link href="/solutions-auditives" className="hover:text-primary">Solutions auditives</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{product.name}</span>
            </nav>
          </div>
        </div>
      </FixedBlock>

      {/* HERO */}
      <FixedBlock id="hero">
        <div className="relative overflow-hidden text-white" style={{
          background: `radial-gradient(900px 500px at 85% 20%, rgba(255,255,255,.18), transparent 60%), linear-gradient(120deg, #16243a 0%, ${heroTo} 60%, ${heroFrom} 100%)`,
        }}>
          {product.heroImage && (
            <div className="absolute inset-y-0 right-0 w-1/2 hidden md:block opacity-70">
              <img
                src={product.heroImage}
                alt={product.name}
                className="w-full h-full object-cover"
                style={{ objectPosition: focalToObjectPosition(getFocal(imagePositions, 'heroImage')) }}
              />
            </div>
          )}
          <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
            <div className="grid md:grid-cols-2 gap-10">
              <div className="max-w-xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/30 text-[11px] font-semibold uppercase tracking-widest">
                    {product.brand}{product.range ? ` · ${product.range}` : ''}
                  </span>
                  {product.type && <span className="text-white/70 text-sm">{product.type}</span>}
                </div>
                <h1 className="text-4xl md:text-6xl font-semibold leading-[1.05] mb-5" style={{ fontFamily: 'var(--font-heading, Playfair Display, Georgia, serif)' }}>
                  {product.name}
                </h1>
                {product.shortDesc && (
                  <p className="text-xl md:text-2xl text-white/95 italic mb-3" style={{ fontFamily: 'var(--font-heading, Playfair Display, Georgia, serif)' }}>
                    {product.shortDesc}
                  </p>
                )}
                {product.heroDescription && (
                  <p className="text-base md:text-lg text-white/85 mb-8 leading-relaxed">{product.heroDescription}</p>
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/prendre-rendez-vous" className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-dark font-semibold rounded-xl hover:bg-gray-100 transition shadow-lg">
                    Prendre rendez-vous
                  </Link>
                  <Link href="tel:+3242750666" className="inline-flex items-center justify-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/40 hover:bg-white/20 transition">
                    📞 Appeler le centre
                  </Link>
                </div>
                <div className="mt-7 flex items-center gap-6 text-white/80 text-sm flex-wrap">
                  {heroBadges.map((b, i) => (
                    <span key={i} className="flex items-center gap-2">
                      {b.dotColor && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.dotColor }}></span>}
                      {b.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </FixedBlock>
      {blocksAfter('hero').map(renderInserted)}

      {/* PROMISES */}
      <FixedBlock id="promises">
        <div className="py-14 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <p className="text-primary-dark text-xs font-semibold uppercase tracking-widest mb-2">{kickers.promises}</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900" style={{ fontFamily: 'var(--font-heading, Playfair Display, Georgia, serif)' }}>
                {advantages.length || 'Plusieurs'} promesses, un seul appareil
              </h2>
            </div>
            {advantages.length > 0 ? (
              <div className={`grid gap-8 max-w-6xl mx-auto ${advantages.length >= 5 ? 'sm:grid-cols-2 lg:grid-cols-5' : advantages.length === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                {advantages.map((a, i) => (
                  <div key={i} className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#EBF5FF] to-[#D7EBFF] text-primary-dark grid place-items-center shadow-[inset_0_0_0_1px_rgba(45,135,230,0.12)]">
                      {a.icon?.startsWith('http') || a.icon?.startsWith('/') ? (
                        <img src={a.icon} alt={a.title} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-3xl">{a.icon || '✓'}</span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold mb-1.5 text-gray-900">{a.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{a.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <PreviewPlaceholder previewAll={previewAll}>Aucune promesse définie</PreviewPlaceholder>
            )}
          </div>
        </div>
      </FixedBlock>
      {blocksAfter('promises').map(renderInserted)}

      {/* SECTION 1 */}
      <FixedBlock id="section-1">
        {(product.section1Title || previewAll) && (
          <div className="py-14 bg-[var(--bg,#F8FBFF)]">
            <div className="max-w-6xl mx-auto px-6">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <p className="text-primary-dark text-xs font-semibold uppercase tracking-widest mb-2">{kickers.section1}</p>
                  <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-5" style={{ fontFamily: 'var(--font-heading, Playfair Display, Georgia, serif)' }}>
                    {product.section1Title || <em className="text-gray-400">Titre à définir</em>}
                  </h2>
                  {product.section1Description ? (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.section1Description}</p>
                  ) : <PreviewPlaceholder previewAll={previewAll}>Description manquante</PreviewPlaceholder>}
                </div>
                <MediaSlot url={product.section1MediaUrl} type={product.section1MediaType} alt={product.section1Title || ''} focal={getFocal(imagePositions, 'section1MediaUrl')} />
              </div>
            </div>
          </div>
        )}
      </FixedBlock>
      {blocksAfter('section-1').map(renderInserted)}

      {/* SECTION 2 */}
      <FixedBlock id="section-2">
        {(product.section2Title || previewAll) && (
          <div className="py-14 bg-white">
            <div className="max-w-6xl mx-auto px-6">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="order-2 md:order-1">
                  <ImageSlot url={product.section2Image} alt={product.section2Title || ''} aspect="square" focal={getFocal(imagePositions, 'section2Image')} />
                  {gallery.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {gallery.slice(0, 3).map((url, i) => (
                        <div key={i} className="aspect-square rounded-2xl bg-gray-100 overflow-hidden">
                          <img src={url} alt={`Galerie ${i+1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="order-1 md:order-2">
                  <p className="text-primary-dark text-xs font-semibold uppercase tracking-widest mb-2">{kickers.section2}</p>
                  <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-5" style={{ fontFamily: 'var(--font-heading, Playfair Display, Georgia, serif)' }}>
                    {product.section2Title || <em className="text-gray-400">Titre à définir</em>}
                  </h2>
                  {product.section2Description ? (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.section2Description}</p>
                  ) : <PreviewPlaceholder previewAll={previewAll}>Description manquante</PreviewPlaceholder>}
                </div>
              </div>
            </div>
          </div>
        )}
      </FixedBlock>
      {blocksAfter('section-2').map(renderInserted)}

      {/* HIGHLIGHT 1 */}
      <FixedBlock id="highlight-1">
        {(product.highlightBox1Title || previewAll) && (
          <div className="py-14" style={{ background: 'linear-gradient(135deg, rgba(66,164,255,0.05), rgba(66,164,255,0.10))' }}>
            <div className="max-w-5xl mx-auto px-6">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="grid md:grid-cols-2 gap-8 items-center p-8 md:p-12">
                  <ImageSlot url={product.highlightBox1Image} alt={product.highlightBox1Title || ''} aspect="square" focal={getFocal(imagePositions, 'highlightBox1Image')} />
                  <div>
                    <p className="text-primary-dark text-xs font-semibold uppercase tracking-widest mb-2">{kickers.highlight1}</p>
                    <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-heading, Playfair Display, Georgia, serif)' }}>
                      {product.highlightBox1Title || <em className="text-gray-400">Titre à définir</em>}
                    </h2>
                    {product.highlightBox1Description && (
                      <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-line">{product.highlightBox1Description}</p>
                    )}
                    <Link href="/prendre-rendez-vous" className="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition shadow-lg">
                      Tester {product.name} en centre
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </FixedBlock>
      {blocksAfter('highlight-1').map(renderInserted)}

      {/* SECTION 3 */}
      <FixedBlock id="section-3">
        {(product.section3Title || previewAll) && (
          <div className="py-14 bg-white">
            <div className="max-w-6xl mx-auto px-6">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <p className="text-primary-dark text-xs font-semibold uppercase tracking-widest mb-2">{kickers.section3}</p>
                  <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-5" style={{ fontFamily: 'var(--font-heading, Playfair Display, Georgia, serif)' }}>
                    {product.section3Title || <em className="text-gray-400">Titre à définir</em>}
                  </h2>
                  {product.section3Description ? (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.section3Description}</p>
                  ) : <PreviewPlaceholder previewAll={previewAll}>Description manquante</PreviewPlaceholder>}
                </div>
                <ImageSlot url={product.section3Image} alt={product.section3Title || ''} aspect="square" focal={getFocal(imagePositions, 'section3Image')} />
              </div>
            </div>
          </div>
        )}
      </FixedBlock>
      {blocksAfter('section-3').map(renderInserted)}

      {/* SECTION 4 */}
      <FixedBlock id="section-4">
        {(product.section4Title || previewAll) && (
          <div className="py-14 bg-[var(--bg,#F8FBFF)]">
            <div className="max-w-6xl mx-auto px-6">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="order-2 md:order-1">
                  <MediaSlot url={product.section4MediaUrl} type={product.section4MediaType} alt={product.section4Title || ''} focal={getFocal(imagePositions, 'section4MediaUrl')} />
                </div>
                <div className="order-1 md:order-2">
                  <p className="text-primary-dark text-xs font-semibold uppercase tracking-widest mb-2">{kickers.section4}</p>
                  <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-5" style={{ fontFamily: 'var(--font-heading, Playfair Display, Georgia, serif)' }}>
                    {product.section4Title || <em className="text-gray-400">Titre à définir</em>}
                  </h2>
                  {product.section4Description ? (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.section4Description}</p>
                  ) : <PreviewPlaceholder previewAll={previewAll}>Description manquante</PreviewPlaceholder>}
                </div>
              </div>
            </div>
          </div>
        )}
      </FixedBlock>
      {blocksAfter('section-4').map(renderInserted)}

      {/* HIGHLIGHT 2 */}
      <FixedBlock id="highlight-2">
        {(product.highlightBox2Title || previewAll) && (
          <div className="py-14" style={{ background: 'linear-gradient(135deg, rgba(66,164,255,0.05), rgba(66,164,255,0.10))' }}>
            <div className="max-w-6xl mx-auto px-6">
              <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
                <div className="text-center max-w-2xl mx-auto mb-8">
                  <p className="text-primary-dark text-xs font-semibold uppercase tracking-widest mb-2">{kickers.highlight2}</p>
                  <h2 className="text-3xl md:text-4xl font-semibold text-gray-900" style={{ fontFamily: 'var(--font-heading, Playfair Display, Georgia, serif)' }}>
                    {product.highlightBox2Title || <em className="text-gray-400">Titre à définir</em>}
                  </h2>
                </div>
                {highlight2Images.length > 0 ? (
                  <div className={`grid gap-5 mb-8 ${highlight2Images.length >= 4 ? 'grid-cols-2 md:grid-cols-4' : highlight2Images.length === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2'}`}>
                    {highlight2Images.map((url, i) => (
                      <div key={i} className="aspect-square rounded-2xl bg-gray-100 overflow-hidden">
                        <img src={url} alt={`${product.name} — ${i+1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <PreviewPlaceholder previewAll={previewAll}>Aucune image dans la galerie</PreviewPlaceholder>
                )}
                <div className="text-center">
                  <Link href="/prendre-rendez-vous" className="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition shadow-lg">
                    Réserver mon essai
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </FixedBlock>
      {blocksAfter('highlight-2').map(renderInserted)}

      {/* ACCESSORIES */}
      <FixedBlock id="accessories">
        <div className="py-14 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <p className="text-primary-dark text-xs font-semibold uppercase tracking-widest mb-2">{kickers.accessories}</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900" style={{ fontFamily: 'var(--font-heading, Playfair Display, Georgia, serif)' }}>
                Des accessoires qui prolongent l'expérience
              </h2>
            </div>
            <PreviewPlaceholder previewAll={previewAll}>
              Liste d'accessoires non encore configurable en base — à câbler dans une v2.2
            </PreviewPlaceholder>
          </div>
        </div>
      </FixedBlock>
      {blocksAfter('accessories').map(renderInserted)}

      {/* FAQ */}
      <FixedBlock id="faq">
        {(faqs.length > 0 || previewAll) && (
          <div className="py-14 bg-white">
            <div className="max-w-4xl mx-auto px-6">
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-8 text-center" style={{ fontFamily: 'var(--font-heading, Playfair Display, Georgia, serif)' }}>
                Pourquoi choisir {product.name} ?
              </h2>
              {faqs.length > 0 ? <FAQList faqs={faqs} /> : <PreviewPlaceholder previewAll={previewAll}>Aucune FAQ définie</PreviewPlaceholder>}
            </div>
          </div>
        )}
      </FixedBlock>
      {blocksAfter('faq').map(renderInserted)}

      {/* FORM */}
      <FixedBlock id="form">
        <div className="py-14 bg-[var(--bg,#F8FBFF)]">
          <div className="max-w-2xl mx-auto px-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-heading, Playfair Display, Georgia, serif)' }}>
                Une question sur {product.name} ?
              </h2>
              <p className="text-gray-600">Remplissez ce formulaire et nous vous recontacterons rapidement.</p>
            </div>
            <form className="bg-white rounded-2xl shadow-lg p-7 space-y-5 border border-[var(--border,#C4DDF8)]" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Nom *" name="name" />
                <Field label="Téléphone *" name="phone" type="tel" />
              </div>
              <Field label="Email *" name="email" type="email" />
              <Field label="Message *" name="message" textarea />
              <button type="submit" className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition shadow-md">
                Envoyer ma demande
              </button>
            </form>
          </div>
        </div>
      </FixedBlock>

      {/* Orphelins (afterBlockId vide / inconnu) — juste avant la CTA */}
      {orphanBlocks().map(renderInserted)}

      {/* CTA FINAL */}
      <FixedBlock id="cta-final">
        <div className="py-16 text-white text-center" style={{
          background: `radial-gradient(900px 400px at 80% 10%, rgba(255,255,255,.18), transparent 60%), linear-gradient(135deg, ${heroFrom} 0%, ${heroTo} 100%)`,
        }}>
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-semibold mb-4" style={{ fontFamily: 'var(--font-heading, Playfair Display, Georgia, serif)' }}>
              Prêt à découvrir {product.name} ?
            </h2>
            <p className="text-xl text-white/90 mb-7">
              Venez l'essayer gratuitement pendant 30 jours. Sans engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/prendre-rendez-vous" className="inline-flex items-center justify-center px-7 py-3.5 bg-white text-primary-dark font-semibold rounded-xl hover:bg-gray-100 transition shadow-lg">
                Réserver un test gratuit
              </Link>
              <Link href="/solutions-auditives" className="inline-flex items-center justify-center px-7 py-3.5 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/40 hover:bg-white/20 transition">
                Voir tous les appareils
              </Link>
            </div>
          </div>
        </div>
      </FixedBlock>

      {/* FOOTER */}
      <FixedBlock id="footer">
        <footer className="border-t border-[var(--border,#C4DDF8)]" style={{ background: 'linear-gradient(135deg, rgba(66,164,255,0.04), rgba(90,179,255,0.04))' }}>
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="font-bold text-base mb-3 text-gray-900">Audire</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Centre auditif indépendant en province de Liège. Accompagnement humain et solutions de qualité.</p>
              </div>
              <div>
                <h4 className="font-bold text-base mb-3 text-gray-900">Liens rapides</h4>
                <ul className="space-y-1.5 text-sm">
                  <li><Link href="/solutions-auditives" className="text-gray-600 hover:text-primary">Solutions auditives</Link></li>
                  <li><Link href="/remboursements" className="text-gray-600 hover:text-primary">Remboursements</Link></li>
                  <li><Link href="/notre-accompagnement" className="text-gray-600 hover:text-primary">Notre accompagnement</Link></li>
                  <li><Link href="/faq" className="text-gray-600 hover:text-primary">FAQ</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-base mb-3 text-gray-900">Contact</h4>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  <li>📍 Rue de la Station, 4 — 4101 Jemeppe-sur-Meuse</li>
                  <li>📞 <a href="tel:+3242750666" className="hover:text-primary">042 75 06 66</a></li>
                  <li>✉️ <a href="mailto:centre.audire@gmail.com" className="hover:text-primary">centre.audire@gmail.com</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-base mb-3 text-gray-900">Horaires</h4>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  <li><strong>Lun – Ven :</strong> 9h–12h, 13h–17h</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-[var(--border,#C4DDF8)] pt-6 flex flex-wrap justify-between gap-4 text-xs text-gray-500">
              <p>© 2026 Audire. Tous droits réservés.</p>
              <div className="flex gap-4">
                <Link href="/mentions-legales" className="hover:text-primary">Mentions légales</Link>
                <Link href="/confidentialite" className="hover:text-primary">Politique de confidentialité</Link>
              </div>
            </div>
          </div>
        </footer>
      </FixedBlock>

    </div>
  );
}

// ============================================
// Renderer pour un ProductContentBlock inséré
// ============================================
function ContentBlockRenderer({ block }: { block: ProductContentBlockData }) {
  const bg = block.backgroundColor || undefined;
  switch (block.blockType) {
    case 'gallery': {
      const meta = parseMetadata<GalleryMetadata>(block.metadata, { images: [] });
      return (
        <div className="py-14" style={bg ? { backgroundColor: bg } : undefined}>
          <div className="max-w-6xl mx-auto px-6">
            {block.title && (
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-8 text-center" style={{ fontFamily: 'var(--font-heading, Playfair Display, Georgia, serif)' }}>
                {block.title}
              </h2>
            )}
            {meta.images.length > 0 ? (
              <div className={`grid gap-5 ${meta.images.length >= 4 ? 'grid-cols-2 md:grid-cols-4' : meta.images.length === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2'}`}>
                {meta.images.map((url, i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-gray-100 overflow-hidden">
                    <img src={url} alt={`Galerie ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center text-gray-500 text-sm">
                Aucune image dans la galerie
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'highlight': {
      const meta = parseMetadata<HighlightMetadata>(block.metadata, {});
      return (
        <div className="py-14" style={bg ? { backgroundColor: bg } : { background: 'linear-gradient(135deg, rgba(66,164,255,0.05), rgba(66,164,255,0.10))' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="grid md:grid-cols-2 gap-8 items-center p-8 md:p-12">
                {block.mediaUrl ? (
                  <div className={`aspect-square rounded-2xl bg-gray-100 overflow-hidden shadow-xl ${block.mediaPosition === 'right' ? 'md:order-2' : ''}`}>
                    {block.mediaType === 'video' ? (
                      <video src={block.mediaUrl} controls className="w-full h-full object-cover" />
                    ) : (
                      <img src={block.mediaUrl} alt={block.mediaAlt || block.title || ''} className="w-full h-full object-cover" />
                    )}
                  </div>
                ) : (
                  <div className={`aspect-square rounded-2xl bg-gradient-to-br from-[#EEF6FF] to-[#E1EEFC] grid place-items-center ${block.mediaPosition === 'right' ? 'md:order-2' : ''}`}>
                    <span className="text-xs uppercase tracking-widest font-mono text-primary-dark bg-white/90 px-3 py-1.5 rounded">Image à ajouter</span>
                  </div>
                )}
                <div>
                  {block.title && (
                    <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-heading, Playfair Display, Georgia, serif)' }}>
                      {block.title}
                    </h2>
                  )}
                  {block.description && (
                    <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-line">{block.description}</p>
                  )}
                  {meta.ctaLabel && (
                    <Link href={meta.ctaHref || '#'} className="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition shadow-lg">
                      {meta.ctaLabel}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'text-media':
    default: {
      const isLeft = block.mediaPosition === 'left';
      return (
        <div className="py-14" style={bg ? { backgroundColor: bg } : undefined}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className={isLeft ? 'md:order-2' : ''}>
                {block.title && (
                  <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-5" style={{ fontFamily: 'var(--font-heading, Playfair Display, Georgia, serif)' }}>
                    {block.title}
                  </h2>
                )}
                {block.description && (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{block.description}</p>
                )}
              </div>
              <div className={isLeft ? 'md:order-1' : ''}>
                <MediaSlot url={block.mediaUrl} type={block.mediaType} alt={block.mediaAlt || block.title || ''} />
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

// ============================================
// Sub-components
// ============================================
function MediaSlot({ url, type, alt, focal }: { url: string | null; type: string | null; alt: string; focal?: { x: number; y: number } }) {
  if (!url) {
    return (
      <div className="aspect-video rounded-2xl bg-gradient-to-br from-[#EEF6FF] to-[#E1EEFC] grid place-items-center">
        <span className="text-xs uppercase tracking-widest font-mono text-primary-dark bg-white/90 px-3 py-1.5 rounded">Média à ajouter</span>
      </div>
    );
  }
  if (type === 'video') {
    return (
      <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-xl">
        <video src={url} controls className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className="aspect-video rounded-2xl bg-gray-100 overflow-hidden shadow-xl">
      <img src={url} alt={alt} className="w-full h-full object-cover" style={focal ? { objectPosition: `${focal.x}% ${focal.y}%` } : undefined} />
    </div>
  );
}

function ImageSlot({ url, alt, aspect = 'square', focal }: { url: string | null; alt: string; aspect?: 'square' | 'video'; focal?: { x: number; y: number } }) {
  const aspectClass = aspect === 'video' ? 'aspect-video' : 'aspect-square';
  if (!url) {
    return (
      <div className={`${aspectClass} rounded-2xl bg-gradient-to-br from-[#EEF6FF] to-[#E1EEFC] grid place-items-center`}>
        <span className="text-xs uppercase tracking-widest font-mono text-primary-dark bg-white/90 px-3 py-1.5 rounded">Image à ajouter</span>
      </div>
    );
  }
  return (
    <div className={`${aspectClass} rounded-2xl bg-gray-100 overflow-hidden shadow-xl`}>
      <img src={url} alt={alt} className="w-full h-full object-cover" style={focal ? { objectPosition: `${focal.x}% ${focal.y}%` } : undefined} />
    </div>
  );
}

function PreviewPlaceholder({ children, previewAll }: { children: React.ReactNode; previewAll?: boolean }) {
  if (!previewAll) return null;
  return (
    <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center text-gray-500 text-sm">
      {children}
    </div>
  );
}

function Field({ label, name, type = 'text', textarea }: { label: string; name: string; type?: string; textarea?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {textarea ? (
        <textarea id={name} name={name} rows={4} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-sm" />
      ) : (
        <input id={name} name={name} type={type} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-sm" />
      )}
    </div>
  );
}

function FAQList({ faqs }: { faqs: FAQ[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {faqs.map((f, i) => (
        <div key={i} className="border border-[var(--border,#C4DDF8)] rounded-xl overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-[var(--bg-alt,#F0F7FF)] transition text-left"
          >
            <span className="font-semibold text-gray-900">{f.question}</span>
            <svg className={`w-4 h-4 text-gray-500 transition-transform ${open === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {open === i && (
            <div className="px-5 py-3.5 bg-[var(--bg-alt,#F0F7FF)] border-t border-[var(--border,#C4DDF8)] text-gray-700 leading-relaxed whitespace-pre-line">
              {f.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
