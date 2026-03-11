'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit, GripVertical, Eye, EyeOff, Trash2 } from 'lucide-react';

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

type WYSIWYGEditorProps = {
  blocks: ContentBlock[];
  onReorder: (reorderedBlocks: ContentBlock[]) => void;
  onEdit: (block: ContentBlock) => void;
  onDelete: (blockId: number) => void;
  onToggleVisibility: (blockId: number) => void;
};

function EditableBlock({
  block,
  onEdit,
  onDelete,
  onToggleVisibility,
}: {
  block: ContentBlock;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const [isHovered, setIsHovered] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : block.isVisible ? 1 : 0.4,
  };

  // Rendu du bloc selon son type avec les VRAIS styles du site
  const renderBlockContent = () => {
    if (!block.isVisible) {
      return (
        <div className="py-8 px-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <Eye className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Bloc masqué - Non visible sur le site</p>
          <p className="text-xs text-gray-400 mt-1">{block.blockKey}</p>
        </div>
      );
    }

    switch (block.blockType) {
      case 'title':
        return (
          <div className="py-8">
            <h2 className="text-4xl font-bold text-gray-900">{block.content}</h2>
          </div>
        );

      case 'text':
        return (
          <div className="py-6">
            <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
              {block.content}
            </p>
          </div>
        );

      case 'button':
        const buttonParts = block.content.split('|');
        const buttonText = buttonParts[0] || block.content;
        const buttonLink = buttonParts[1] || '#';
        return (
          <div className="py-6 flex justify-center">
            <a
              href={buttonLink}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg"
              onClick={(e) => e.preventDefault()}
            >
              {buttonText}
            </a>
          </div>
        );

      case 'card':
        let metadata;
        try {
          metadata = block.metadata ? JSON.parse(block.metadata) : {};
        } catch {
          metadata = {};
        }
        return (
          <div className="bg-gray-50 p-8 rounded-2xl hover:shadow-xl transition-all border border-gray-100">
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
            className="py-6 prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        );

        case 'image':
        let imgMetadata;
        try {
          imgMetadata = block.metadata ? JSON.parse(block.metadata) : {};
        } catch {
          imgMetadata = {};
        }

        // Gestion du positionnement absolu
        const hasAbsolutePosition = imgMetadata.position?.type === 'absolute';
        const imageStyle: React.CSSProperties = hasAbsolutePosition
          ? {
              position: 'absolute',
              left: imgMetadata.position.x || 0,
              top: imgMetadata.position.y || 0,
              zIndex: imgMetadata.position.zIndex || 1,
              width: imgMetadata.size?.width || 'auto',
              height: imgMetadata.size?.height || 'auto',
            }
          : {
              width: imgMetadata.size?.width || 'auto',
              height: imgMetadata.size?.height || 'auto',
            };

        return (
          <div className={hasAbsolutePosition ? '' : 'py-6'} style={hasAbsolutePosition ? imageStyle : {}}>
            {hasAbsolutePosition ? (
              <img
                src={imgMetadata.imageUrl || block.content}
                alt={imgMetadata.alt || 'Image'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem' }}
              />
            ) : (
              <img
                src={imgMetadata.imageUrl || block.content}
                alt={imgMetadata.alt || 'Image'}
                className="max-w-full h-auto rounded-2xl shadow-lg mx-auto"
                style={imageStyle}
              />
            )}
            {hasAbsolutePosition && (
              <div className="absolute -top-6 left-0 bg-purple-600 text-white text-xs px-2 py-1 rounded shadow-lg">
                📍 Position: {imgMetadata.position.x} / {imgMetadata.position.y}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="py-6 px-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-700">{block.content}</p>
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Toolbar flottante au hover */}
      {isHovered && (
        <div className="absolute top-2 right-2 z-10 flex gap-1 bg-white rounded-lg shadow-xl border-2 border-blue-500 p-1">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="p-2 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing transition-colors"
            title="Déplacer"
          >
            <GripVertical className="w-4 h-4 text-gray-600" />
          </button>

          {/* Edit button */}
          <button
            onClick={onEdit}
            className="p-2 hover:bg-blue-50 rounded transition-colors"
            title="Éditer"
          >
            <Edit className="w-4 h-4 text-blue-600" />
          </button>

          {/* Visibility toggle */}
          <button
            onClick={onToggleVisibility}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title={block.isVisible ? 'Masquer' : 'Afficher'}
          >
            {block.isVisible ? (
              <Eye className="w-4 h-4 text-gray-600" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {/* Delete button */}
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-50 rounded transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* Label du bloc (petit badge en haut à gauche au hover) */}
      {isHovered && (
        <div className="absolute top-2 left-2 z-10 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg font-medium">
          {block.blockType.toUpperCase()} - {block.blockKey}
        </div>
      )}

      {/* Contour bleu au hover */}
      <div
        className={`border-2 rounded-xl transition-all ${
          isHovered
            ? 'border-blue-500 bg-blue-50/30'
            : 'border-transparent'
        }`}
      >
        {renderBlockContent()}
      </div>
    </div>
  );
}

export default function WYSIWYGEditor({
  blocks,
  onReorder,
  onEdit,
  onDelete,
  onToggleVisibility,
}: WYSIWYGEditorProps) {
  const [items, setItems] = useState(blocks);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px de mouvement avant de démarrer le drag
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const reordered = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index,
      }));

      setItems(reordered);
      onReorder(reordered);
    }
  };

  // Update items when blocks prop changes
  useEffect(() => {
    if (blocks.length !== items.length || blocks.some((b, i) => b.id !== items[i]?.id)) {
      setItems(blocks);
    }
  }, [blocks]);

  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
        <p className="text-gray-600 mb-4 text-lg">📄 Aucun bloc sur cette page</p>
        <p className="text-sm text-gray-500">Cliquez sur "+ Nouveau bloc" pour commencer à construire votre page</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Info bar */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-semibold">Mode Édition WYSIWYG</span>
            <span className="text-blue-200 text-sm">• Survolez les blocs pour les modifier</span>
          </div>
          <span className="text-sm text-blue-200">{items.length} bloc{items.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Page content comme sur le vrai site */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {items.map((block) => (
                <EditableBlock
                  key={block.id}
                  block={block}
                  onEdit={() => onEdit(block)}
                  onDelete={() => onDelete(block.id)}
                  onToggleVisibility={() => onToggleVisibility(block.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Helper tooltip */}
      <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl p-4 border-2 border-blue-200 max-w-xs">
        <p className="text-sm font-semibold text-gray-900 mb-2">💡 Astuce</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• <strong>Survole</strong> un bloc pour voir les actions</li>
          <li>• <strong>Clique ✏️</strong> pour éditer le contenu</li>
          <li>• <strong>Glisse ⋮⋮</strong> pour réorganiser</li>
          <li>• <strong>👁️</strong> pour masquer/afficher</li>
        </ul>
      </div>
    </div>
  );
}
