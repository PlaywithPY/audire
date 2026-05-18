'use client';

// Sprint 5.5 — DynamicBlockSlot enrichi :
//   1. Nouveau type "bg-image" → image plein largeur avec effet parallax/zoom/fade/fixed/none
//   2. Type "image" enrichi : width, objectFit, height, borderRadius, marginY

import { useEffect, useState, useCallback, useRef } from 'react';
import { Trash2 } from 'lucide-react';

type Block = {
  id: number; pageKey: string; blockKey: string; blockType: string;
  content: string; metadata: string | null; order: number; isVisible: boolean;
};

type Props = { pageKey: string; slot: string; className?: string };

function parseMeta(m: string | null): Record<string, any> {
  if (!m) return {}; try { return JSON.parse(m); } catch { return {}; }
}

export default function DynamicBlockSlot({ pageKey, slot, className = '' }: Props) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [editMode, setEditMode] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/blocks?pageKey=${encodeURIComponent(pageKey)}`);
    if (!res.ok) return;
    const all: Block[] = await res.json();
    setBlocks(all.filter((b) => b.isVisible !== false && parseMeta(b.metadata).slot === slot)
      .sort((a, b) => a.order - b.order));
  }, [pageKey, slot]);

  useEffect(() => {
    setEditMode(new URLSearchParams(window.location.search).get('edit') === '1');
    load();
  }, [load]);

  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.data?.type === 'editor:blocks-changed') load();
    }
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [load]);

  if (blocks.length === 0) return null;

  return (
    <div className={`dynamic-block-slot ${className}`} data-slot={slot}>
      {blocks.map((b) => (
        <BlockShell key={b.id} block={b} editMode={editMode} onChanged={load} />
      ))}
    </div>
  );
}

function BlockShell({ block, editMode, onChanged }: { block: Block; editMode: boolean; onChanged: () => void }) {
  const meta = parseMeta(block.metadata);

  async function onDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Supprimer ce bloc (${block.blockType}) ?`)) return;
    await fetch(`/api/blocks?id=${block.id}`, { method: 'DELETE' });
    onChanged();
    try { window.parent?.postMessage({ type: 'editor:blocks-changed' }, '*'); } catch {}
  }

  return (
    <div className="relative group/block my-4">
      {editMode && (
        <div className="absolute -top-2 right-2 z-20 hidden group-hover/block:flex items-center gap-1 bg-white border border-gray-200 rounded-md shadow-md p-0.5">
          <button onClick={onDelete} title="Supprimer ce bloc"
            className="w-6 h-6 grid place-items-center rounded hover:bg-red-50 text-red-600">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
      <div data-edit-block={`dynamic:${block.id}:content`}>
        <BlockBody type={block.blockType} content={block.content} meta={meta} />
      </div>
    </div>
  );
}

// ===========================================================================
// Rendu par type de bloc
// ===========================================================================
function BlockBody({ type, content, meta }: { type: string; content: string; meta: Record<string, any> }) {
  switch (type) {
    case 'title':
      return <h2 className="text-3xl md:text-4xl font-bold text-center my-6 text-gray-900">{content}</h2>;
    case 'text':
      return (
        <div className="prose prose-lg max-w-3xl mx-auto px-4 my-4 text-gray-700"
          dangerouslySetInnerHTML={{ __html: content || '<p>Tapez votre texte…</p>' }} />
      );
    case 'image':
      return <InlineImage meta={meta} />;
    case 'bg-image':
      return <BgImageBlock meta={meta} />;
    case 'button': {
      const [label = 'Bouton', href = '#'] = (content || '').split('|');
      return (
        <div className="text-center my-6">
          <a href={href} className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors">
            {label}
          </a>
        </div>
      );
    }
    case 'card':
      return (
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md border border-gray-100 p-6 my-6 text-center">
          {meta.icon && <div className="text-4xl mb-3">{meta.icon}</div>}
          <h3 className="text-lg font-bold text-gray-900 mb-2">{content}</h3>
          {meta.description && <p className="text-sm text-gray-600">{meta.description}</p>}
        </div>
      );
    case 'spacer':
      return <div style={{ height: meta.height ?? 48 }} />;
    case 'divider':
      return <hr className="max-w-3xl mx-auto my-8 border-gray-200" />;
    case 'html':
      return <div className="max-w-3xl mx-auto px-4 my-4 prose" dangerouslySetInnerHTML={{ __html: content }} />;
    default:
      return <div className="text-sm text-gray-400 italic text-center my-4">Type "{type}" non géré</div>;
  }
}

// ===========================================================================
// Image inline avec options avancées (Sprint 5D)
// ===========================================================================
const WIDTH_CLS: Record<string, string> = {
  contained: 'max-w-3xl mx-auto',
  full:      'w-full',
  bleed:     'w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]',
};
const RADIUS_CLS: Record<string, string> = {
  none: 'rounded-none',
  md:   'rounded-md',
  lg:   'rounded-xl',
  full: 'rounded-3xl',
};
const MARGIN_CLS: Record<string, string> = {
  compact: 'my-2',
  normal:  'my-6',
  large:   'my-12',
};

function InlineImage({ meta }: { meta: Record<string, any> }) {
  const width      = meta.width      ?? 'contained';
  const fit        = meta.objectFit  ?? 'cover';
  const radius     = meta.borderRadius ?? 'lg';
  const marginY    = meta.marginY    ?? 'normal';
  const height     = meta.height ? `${meta.height}px` : 'auto';

  const wrapperCls = `${WIDTH_CLS[width] || WIDTH_CLS.contained} ${MARGIN_CLS[marginY] || MARGIN_CLS.normal}`;
  const imgCls     = `${RADIUS_CLS[radius] || RADIUS_CLS.lg} ${width === 'bleed' ? '' : 'w-full'}`;

  if (!meta.imageUrl) {
    return (
      <div className={`${wrapperCls}`}>
        <div className={`h-48 bg-gray-100 border-2 border-dashed border-gray-300 grid place-items-center text-gray-400 ${RADIUS_CLS[radius]}`}>
          Image (cliquer pour configurer)
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperCls}>
      <img
        src={meta.imageUrl}
        alt={meta.alt || ''}
        className={imgCls}
        style={{
          height,
          width: width === 'bleed' ? '100vw' : '100%',
          objectFit: fit as any,
        }}
      />
    </div>
  );
}

// ===========================================================================
// Image de fond plein largeur avec effet (Sprint 5.5)
// ===========================================================================
function BgImageBlock({ meta }: { meta: Record<string, any> }) {
  const effectType   = (meta.effectType ?? 'parallax') as 'parallax' | 'zoom' | 'fade' | 'fixed' | 'none';
  const height       = meta.height ?? 480;
  const overlayColor = meta.overlayColor ?? null;
  const imageUrl     = meta.imageUrl ?? '';
  const alt          = meta.alt ?? '';

  // Wrapper full-bleed (échappe au container)
  const bleedCls = 'relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden';

  if (!imageUrl) {
    return (
      <div className={bleedCls} style={{ height: `${height}px` }}>
        <div className="absolute inset-0 grid place-items-center bg-gray-100 border-y-2 border-dashed border-gray-300 text-gray-400">
          Image de fond (cliquer pour configurer)
        </div>
      </div>
    );
  }

  return (
    <div className={bleedCls} style={{ height: `${height}px` }}>
      {effectType === 'parallax' && <BgParallax url={imageUrl} alt={alt} speed={meta.effectSpeed ?? 0.5} />}
      {effectType === 'zoom'     && <BgZoom url={imageUrl} alt={alt} scale={meta.effectScale ?? 1.2} />}
      {effectType === 'fade'     && <BgFade url={imageUrl} alt={alt} />}
      {effectType === 'fixed'    && <BgFixed url={imageUrl} />}
      {effectType === 'none'     && <BgSimple url={imageUrl} alt={alt} />}
      {overlayColor && <div className="absolute inset-0" style={{ backgroundColor: overlayColor }} />}
    </div>
  );
}

function BgParallax({ url, alt, speed }: { url: string; alt: string; speed: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      if (!wrapRef.current || !imgRef.current) return;
      const r = wrapRef.current.getBoundingClientRect();
      const wh = window.innerHeight;
      if (r.bottom < 0 || r.top > wh) return;
      const rel = r.top - wh;
      const off = -rel * (1 - speed);
      imgRef.current.style.transform = `translateY(${off * speed}px)`;
    };
    window.addEventListener('scroll', onScroll); onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [speed]);
  return (
    <div ref={wrapRef} className="absolute inset-0">
      <div ref={imgRef} className="absolute inset-0 w-full" style={{ height: '120%', top: '-10%' }}>
        <img src={url} alt={alt} className="w-full h-full object-cover" />
      </div>
    </div>
  );
}

function BgZoom({ url, alt, scale }: { url: string; alt: string; scale: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      if (!wrapRef.current || !imgRef.current) return;
      const r = wrapRef.current.getBoundingClientRect();
      const wh = window.innerHeight;
      if (r.bottom < 0 || r.top > wh) return;
      const p = Math.min(Math.max((wh - r.top) / (wh + r.height), 0), 1);
      imgRef.current.style.transform = `scale(${1 + (scale - 1) * p})`;
    };
    window.addEventListener('scroll', onScroll); onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [scale]);
  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      <div ref={imgRef} className="absolute inset-0 transition-transform duration-100">
        <img src={url} alt={alt} className="w-full h-full object-cover" />
      </div>
    </div>
  );
}

function BgFade({ url, alt }: { url: string; alt: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      if (!wrapRef.current || !imgRef.current) return;
      const r = wrapRef.current.getBoundingClientRect();
      const wh = window.innerHeight;
      if (r.bottom < 0 || r.top > wh) return;
      const p = Math.min(Math.max((wh - r.top) / (wh + r.height), 0), 1);
      let opacity = 1; if (p < 0.3) opacity = p / 0.3; else if (p > 0.7) opacity = (1 - p) / 0.3;
      imgRef.current.style.opacity = `${opacity}`;
    };
    window.addEventListener('scroll', onScroll); onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div ref={wrapRef} className="absolute inset-0">
      <div ref={imgRef} className="absolute inset-0 transition-opacity duration-300">
        <img src={url} alt={alt} className="w-full h-full object-cover" />
      </div>
    </div>
  );
}

function BgFixed({ url }: { url: string }) {
  return (
    <div className="absolute inset-0"
      style={{ backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }} />
  );
}

function BgSimple({ url, alt }: { url: string; alt: string }) {
  return <img src={url} alt={alt} className="absolute inset-0 w-full h-full object-cover" />;
}
