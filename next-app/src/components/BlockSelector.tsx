'use client';

import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';

type ContentBlock = {
  id: number;
  pageKey: string;
  blockKey: string;
  blockType: string;
  content: string;
  metadata: string | null;
  order: number;
  isVisible: boolean;
  updatedAt: string;
};

type BlockSelectorProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (block: ContentBlock) => void;
  currentPageKey?: string;
};

export default function BlockSelector({ isOpen, onClose, onSelect, currentPageKey }: BlockSelectorProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<ContentBlock | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchBlocks();
      setSelectedBlock(null);
      setSearchTerm('');
    }
  }, [isOpen, currentPageKey]);

  async function fetchBlocks() {
    setLoading(true);
    try {
      const url = currentPageKey
        ? `/api/admin/blocks?pageKey=${currentPageKey}`
        : '/api/admin/blocks';

      const res = await fetch(url);
      const data = await res.json();

      // Si data est un tableau, l'utiliser directement, sinon on peut avoir besoin d'adapter
      const blocksArray = Array.isArray(data) ? data : [];
      setBlocks(blocksArray);
    } catch (error) {
      console.error('Error fetching blocks:', error);
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredBlocks = blocks.filter(block =>
    // Ne montrer que les blocs visibles
    block.isVisible &&
    // Filtrer par terme de recherche
    (block.blockKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
    block.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    block.blockType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const blockTypeIcons: Record<string, string> = {
    title: '📝',
    text: '📄',
    card: '🎴',
    html: '🔧',
    image: '🖼️',
    button: '🔘',
  };

  const blockTypeLabels: Record<string, string> = {
    title: 'Titre',
    text: 'Texte',
    card: 'Card',
    html: 'HTML',
    image: 'Image',
    button: 'Bouton',
  };

  function renderBlockPreview(block: ContentBlock) {
    switch (block.blockType) {
      case 'title':
        return <h3 className="text-lg font-bold text-gray-800 truncate">{block.content}</h3>;

      case 'text':
        return <p className="text-sm text-gray-600 line-clamp-2">{block.content}</p>;

      case 'button':
        const buttonText = block.content.split('|')[0] || block.content;
        return (
          <button className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg">
            {buttonText}
          </button>
        );

      case 'card':
        let metadata;
        try {
          metadata = block.metadata ? JSON.parse(block.metadata) : {};
        } catch {
          metadata = {};
        }
        return (
          <div className="flex items-center gap-2">
            {metadata.imageUrl ? (
              <img src={metadata.imageUrl} alt="" className="w-8 h-8 object-contain" />
            ) : (
              <span className="text-2xl">{metadata.icon || '📷'}</span>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{block.content}</p>
              {metadata.description && (
                <p className="text-xs text-gray-500 truncate">{metadata.description}</p>
              )}
            </div>
          </div>
        );

      case 'image':
        let imgMetadata;
        try {
          imgMetadata = block.metadata ? JSON.parse(block.metadata) : {};
        } catch {
          imgMetadata = {};
        }
        const imgUrl = imgMetadata.imageUrl || block.content;
        return (
          <div className="flex items-center gap-2">
            <img src={imgUrl} alt="" className="w-16 h-16 object-cover rounded" />
            <span className="text-xs text-gray-500">{imgMetadata.alt || 'Image'}</span>
          </div>
        );

      case 'html':
        return (
          <div className="text-xs text-gray-500 font-mono line-clamp-2">
            {block.content.substring(0, 100)}...
          </div>
        );

      default:
        return <p className="text-sm text-gray-600 truncate">{block.content}</p>;
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold">🧱 Sélectionner un bloc</h2>
            <p className="text-sm text-gray-600 mt-1">
              {currentPageKey
                ? `Blocs de la page "${currentPageKey}"`
                : 'Tous les blocs disponibles'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, type ou contenu..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Blocks grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredBlocks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-gray-500">
                {searchTerm ? 'Aucun bloc ne correspond à votre recherche' : 'Aucun bloc disponible sur cette page'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBlocks.map((block) => (
                <button
                  key={block.id}
                  onClick={() => setSelectedBlock(block)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    selectedBlock?.id === block.id
                      ? 'border-blue-600 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  } ${!block.isVisible ? 'opacity-50' : ''}`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{blockTypeIcons[block.blockType] || '📄'}</span>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{block.blockKey}</p>
                        <p className="text-xs text-gray-500">{blockTypeLabels[block.blockType] || block.blockType}</p>
                      </div>
                    </div>
                    {!block.isVisible && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        Masqué
                      </span>
                    )}
                  </div>

                  {/* Preview */}
                  <div className="bg-white p-3 rounded border border-gray-100 min-h-[80px] flex items-center">
                    {renderBlockPreview(block)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedBlock ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Bloc sélectionné : <strong>{selectedBlock.blockKey}</strong>
              </span>
            ) : (
              'Sélectionnez un bloc pour continuer'
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                if (selectedBlock) {
                  onSelect(selectedBlock);
                  onClose();
                }
              }}
              disabled={!selectedBlock}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Utiliser ce bloc
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
