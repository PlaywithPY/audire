'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Edit, Trash2, Layout, List } from 'lucide-react';

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

type VisualPageBuilderProps = {
  blocks: ContentBlock[];
  onReorder: (reorderedBlocks: ContentBlock[]) => void;
  onEdit: (block: ContentBlock) => void;
  onDelete: (blockId: number) => void;
  onToggleVisibility: (blockId: number) => void;
};

function SortableBlockCompact({
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const blockTypeIcons: Record<string, string> = {
    title: '📝',
    text: '📄',
    card: '🎴',
    html: '🔧',
    image: '🖼️',
    button: '🔘',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg p-3 ${
        isDragging ? 'border-blue-400 shadow-lg' : 'border-gray-200'
      } ${!block.isVisible ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-2">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </button>

        {/* Block Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm">{blockTypeIcons[block.blockType] || '📄'}</span>
            <span className="text-xs font-medium text-gray-700 truncate">{block.blockKey}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleVisibility}
            className="p-1 hover:bg-gray-100 rounded"
            title={block.isVisible ? 'Masquer' : 'Afficher'}
          >
            {block.isVisible ? (
              <Eye className="w-3 h-3 text-gray-600" />
            ) : (
              <EyeOff className="w-3 h-3 text-gray-400" />
            )}
          </button>
          <button
            onClick={onEdit}
            className="p-1 hover:bg-blue-50 rounded"
            title="Éditer"
          >
            <Edit className="w-3 h-3 text-blue-600" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:bg-red-50 rounded"
            title="Supprimer"
          >
            <Trash2 className="w-3 h-3 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

function BlockPreview({ block }: { block: ContentBlock }) {
  if (!block.isVisible) {
    return (
      <div className="p-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg opacity-50">
        <p className="text-sm text-gray-500 text-center">🙈 Bloc masqué</p>
      </div>
    );
  }

  // Rendu du bloc selon son type
  switch (block.blockType) {
    case 'title':
      return (
        <div className="py-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{block.content}</h2>
        </div>
      );

    case 'text':
      return (
        <div className="py-4">
          <p className="text-gray-700 text-lg whitespace-pre-wrap">{block.content}</p>
        </div>
      );

    case 'button':
      const buttonParts = block.content.split('|');
      const buttonText = buttonParts[0] || block.content;
      return (
        <div className="py-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
            {buttonText}
          </button>
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
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-4">
            {metadata.imageUrl ? (
              <img
                src={metadata.imageUrl}
                alt={block.content}
                className="w-16 h-16 object-contain"
              />
            ) : (
              <span className="text-4xl">{metadata.icon || '📷'}</span>
            )}
          </div>
          <h3 className="font-bold text-xl mb-2">{block.content}</h3>
          {metadata.description && (
            <p className="text-gray-600 text-sm">{metadata.description}</p>
          )}
        </div>
      );

    case 'html':
      return (
        <div
          className="py-4"
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
      return (
        <div className="py-4">
          <img
            src={imgMetadata.imageUrl || block.content}
            alt={imgMetadata.alt || 'Image'}
            className="max-w-full rounded-lg shadow-md"
          />
        </div>
      );

    default:
      return (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">{block.content}</p>
        </div>
      );
  }
}

export default function VisualPageBuilder({
  blocks,
  onReorder,
  onEdit,
  onDelete,
  onToggleVisibility,
}: VisualPageBuilderProps) {
  const [items, setItems] = useState(blocks);
  const [viewMode, setViewMode] = useState<'split' | 'list'>('split');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
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
  if (blocks.length !== items.length || blocks.some((b, i) => b.id !== items[i]?.id)) {
    setItems(blocks);
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-600 mb-4">Aucun bloc sur cette page</p>
        <p className="text-sm text-gray-500">Créez votre premier bloc pour commencer</p>
      </div>
    );
  }

  return (
    <div>
      {/* Toggle View Mode */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <GripVertical className="w-4 h-4" />
          <span>Glissez-déposez pour réorganiser</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <List className="w-4 h-4" />
            Liste
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm transition-colors ${
              viewMode === 'split'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Layout className="w-4 h-4" />
            Visuel
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {viewMode === 'list' ? (
            // Mode liste simple
            <div className="space-y-3">
              {items.map((block) => (
                <SortableBlockCompact
                  key={block.id}
                  block={block}
                  onEdit={() => onEdit(block)}
                  onDelete={() => onDelete(block.id)}
                  onToggleVisibility={() => onToggleVisibility(block.id)}
                />
              ))}
            </div>
          ) : (
            // Mode split-screen avec preview
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Colonne gauche : Liste des blocs */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-sm text-gray-700 mb-3">📋 Blocs (ordre)</h3>
                {items.map((block) => (
                  <SortableBlockCompact
                    key={block.id}
                    block={block}
                    onEdit={() => onEdit(block)}
                    onDelete={() => onDelete(block.id)}
                    onToggleVisibility={() => onToggleVisibility(block.id)}
                  />
                ))}
              </div>

              {/* Colonne droite : Preview en temps réel */}
              <div className="bg-white p-6 rounded-lg border-2 border-blue-200 shadow-sm sticky top-4 max-h-screen overflow-y-auto">
                <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <h3 className="font-semibold text-sm text-gray-700">👁️ Preview en temps réel</h3>
                </div>
                <div className="space-y-6">
                  {items.map((block) => (
                    <div
                      key={block.id}
                      className="relative group border-2 border-transparent hover:border-blue-300 rounded-lg transition-all"
                    >
                      <BlockPreview block={block} />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(block)}
                          className="bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg hover:bg-blue-700"
                        >
                          ✏️ Éditer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SortableContext>
      </DndContext>
    </div>
  );
}
