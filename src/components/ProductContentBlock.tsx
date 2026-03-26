interface ContentBlock {
  id: number;
  title: string | null;
  description: string | null;
  mediaUrl: string | null;
  mediaType: string;
  mediaAlt: string | null;
  mediaPosition: string;
  backgroundColor: string | null;
}

interface ProductContentBlockProps {
  block: ContentBlock;
}

export default function ProductContentBlock({ block }: ProductContentBlockProps) {
  const bgColor = block.backgroundColor || 'transparent';
  const isMediaLeft = block.mediaPosition === 'left';

  return (
    <section
      className="py-16"
      style={{ backgroundColor: bgColor }}
    >
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Media */}
          <div
            className={`relative ${isMediaLeft ? 'order-2 md:order-1' : 'order-2 md:order-2'}`}
          >
            {block.mediaUrl && (
              <>
                {block.mediaType === 'video' ? (
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-xl">
                    <video
                      src={block.mediaUrl}
                      controls
                      className="w-full h-full object-cover"
                    >
                      Votre navigateur ne supporte pas les vidéos.
                    </video>
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden shadow-xl">
                    <img
                      src={block.mediaUrl}
                      alt={block.mediaAlt || block.title || 'Image'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Text */}
          <div
            className={`${isMediaLeft ? 'order-1 md:order-2' : 'order-1 md:order-1'}`}
          >
            {block.title && (
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {block.title}
              </h2>
            )}
            {block.description && (
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {block.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
