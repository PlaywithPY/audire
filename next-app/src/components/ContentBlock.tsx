import { prisma } from '@/lib/prisma';
import Image from 'next/image';

type ContentBlockProps = {
  pageKey: string;
  blockKey: string;
  defaultContent?: string;
  defaultType?: 'title' | 'text' | 'html' | 'image' | 'button';
  className?: string;
};

/**
 * Composant pour afficher un bloc de contenu éditable
 * Si le bloc n'existe pas en DB, affiche le contenu par défaut
 */
export async function ContentBlock({
  pageKey,
  blockKey,
  defaultContent = '',
  defaultType = 'text',
  className = '',
}: ContentBlockProps) {
  // Récupérer le bloc depuis la DB
  let block = await prisma.contentBlock.findUnique({
    where: {
      pageKey_blockKey: { pageKey, blockKey },
    },
  });

  // Si le bloc n'existe pas, utiliser les valeurs par défaut
  const content = block?.content || defaultContent;
  const blockType = block?.blockType || defaultType;
  const isVisible = block?.isVisible !== false;

  // Ne rien afficher si le bloc est masqué
  if (!isVisible) {
    return null;
  }

  // Rendu selon le type de bloc
  switch (blockType) {
    case 'title':
      return (
        <h1 className={className} data-block-key={blockKey}>
          {content}
        </h1>
      );

    case 'text':
      return (
        <p className={className} data-block-key={blockKey}>
          {content}
        </p>
      );

    case 'html':
      return (
        <div
          className={className}
          data-block-key={blockKey}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );

    case 'image':
      return (
        <div className={className} data-block-key={blockKey}>
          {content && (
            <Image
              src={content}
              alt={blockKey}
              width={800}
              height={600}
              className="w-full h-auto"
            />
          )}
        </div>
      );

    case 'button':
      // Format: "Label|URL"
      const [label, url] = content.split('|');
      return (
        <a
          href={url || '#'}
          className={className}
          data-block-key={blockKey}
        >
          {label || content}
        </a>
      );

    default:
      return (
        <div className={className} data-block-key={blockKey}>
          {content}
        </div>
      );
  }
}
