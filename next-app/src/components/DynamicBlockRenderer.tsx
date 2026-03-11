'use client';

import { useEffect, useState } from 'react';

type ContentBlock = {
  id: number;
  pageKey: string;
  blockKey: string;
  blockType: string;
  content: string;
  metadata: string | null;
  order: number;
  isVisible: boolean;
};

type DynamicBlockRendererProps = {
  pageKey: string;
  className?: string;
  absoluteOnly?: boolean; // Afficher uniquement les blocs en position absolue
};

export default function DynamicBlockRenderer({
  pageKey,
  className = '',
  absoluteOnly = false
}: DynamicBlockRendererProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlocks();
  }, [pageKey]);

  async function fetchBlocks() {
    try {
      const res = await fetch(`/api/blocks?pageKey=${pageKey}`);
      const data = await res.json();

      // Filtrer les blocs
      let filteredBlocks = data.filter((b: ContentBlock) => b.isVisible);

      // Si absoluteOnly, ne garder que les blocs en position absolue
      if (absoluteOnly) {
        filteredBlocks = filteredBlocks.filter((b: ContentBlock) => {
          try {
            const meta = b.metadata ? JSON.parse(b.metadata) : {};
            return meta.position?.type === 'absolute';
          } catch {
            return false;
          }
        });
      }

      setBlocks(filteredBlocks);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return null; // Pas de loader pour ne pas casser le design
  }

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}

function BlockRenderer({ block }: { block: ContentBlock }) {
  let metadata: any = {};
  try {
    metadata = block.metadata ? JSON.parse(block.metadata) : {};
  } catch {
    metadata = {};
  }

  // Gestion du positionnement absolu si défini
  const hasAbsolutePosition = metadata.position?.type === 'absolute';
  const positionStyle = hasAbsolutePosition
    ? {
        position: 'absolute' as const,
        left: metadata.position.x || 0,
        top: metadata.position.y || 0,
        zIndex: metadata.position.zIndex || 1,
      }
    : {};

  // Gestion de la taille
  const sizeStyle = {
    width: metadata.size?.width || 'auto',
    height: metadata.size?.height || 'auto',
  };

  const combinedStyle = { ...positionStyle, ...sizeStyle };

  switch (block.blockType) {
    case 'title':
      return (
        <h2 className="text-4xl font-bold text-gray-900 mb-6" style={combinedStyle}>
          {block.content}
        </h2>
      );

    case 'text':
      return (
        <p className="text-lg text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap" style={combinedStyle}>
          {block.content}
        </p>
      );

    case 'button':
      const buttonParts = block.content.split('|');
      const buttonText = buttonParts[0] || block.content;
      const buttonLink = buttonParts[1] || '#';
      return (
        <a
          href={buttonLink}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg mb-6"
          style={combinedStyle}
        >
          {buttonText}
        </a>
      );

    case 'card':
      return (
        <div
          className="bg-gray-50 p-8 rounded-2xl hover:shadow-xl transition-all border border-gray-100 mb-6"
          style={combinedStyle}
        >
          <div className="mb-6">
            {metadata.imageUrl ? (
              <img
                src={metadata.imageUrl}
                alt={block.content}
                className="w-16 h-16 object-contain"
              />
            ) : (
              <span className="text-5xl">{metadata.icon || '📷'}</span>
            )}
          </div>
          <h3 className="text-2xl font-bold mb-3 text-gray-900">{block.content}</h3>
          {metadata.description && (
            <p className="text-gray-600 leading-relaxed">{metadata.description}</p>
          )}
        </div>
      );

    case 'html':
      return (
        <div
          className="prose prose-lg max-w-none mb-6"
          style={combinedStyle}
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      );

    case 'image':
      const imageUrl = metadata.imageUrl || block.content;
      const imageAlt = metadata.alt || 'Image';

      return (
        <div
          style={combinedStyle}
          className={hasAbsolutePosition ? 'pointer-events-auto' : 'mb-6'}
        >
          <img
            src={imageUrl}
            alt={imageAlt}
            className={hasAbsolutePosition ? '' : 'max-w-full h-auto rounded-2xl shadow-lg'}
            style={
              hasAbsolutePosition
                ? { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem' }
                : {}
            }
          />
        </div>
      );

    default:
      return (
        <div className="mb-6" style={combinedStyle}>
          <p className="text-gray-700">{block.content}</p>
        </div>
      );
  }
}
