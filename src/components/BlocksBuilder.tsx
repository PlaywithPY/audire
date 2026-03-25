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
import { GripVertical, Eye, EyeOff, Edit, Trash2 } from 'lucide-react';

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

type BlocksBuilderProps = {
  blocks: ContentBlock[];
  onReorder: (reorderedBlocks: ContentBlock[]) => void;
  onEdit: (block: ContentBlock) => void;
  onDelete: (blockId: number) => void;
  onToggleVisibility: (blockId: number) => void;
};

function SortableBlock({
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

  const blockTypeLabels: Record<string, string> = {
    title: 'Titre',
    text: 'Texte',
    card: 'Card',
    html: 'HTML',
    image: 'Image',
    button: 'Bouton',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border-2 rounded-lg p-4 ${
        isDragging ? 'border-blue-400 shadow-lg' : 'border-gray-200'
      } ${!block.isVisible ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded"
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </button>

        {/* Block Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{blockTypeIcons[block.blockType] || '📄'}</span>
            <span className="font-semibold text-gray-700">{blockTypeLabels[block.blockType]}</span>
            <span className="text-xs text-gray-500">#{block.order}</span>
            {!block.isVisible && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Caché</span>
            )}
          </div>
          <p className="text-sm text-gray-600 truncate">{block.blockKey}</p>
          <p className="text-xs text-gray-400 truncate mt-1">{block.content.substring(0, 80)}...</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
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
          <button
            onClick={onEdit}
            className="p-2 hover:bg-blue-50 rounded transition-colors"
            title="Éditer"
          >
            <Edit className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-50 rounded transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BlocksBuilder({
  blocks,
  onReorder,
  onEdit,
  onDelete,
  onToggleVisibility,
}: BlocksBuilderProps) {
  const [items, setItems] = useState(blocks);

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
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
        <GripVertical className="w-4 h-4" />
        <span>Glissez-déposez les blocs pour réorganiser l'ordre d'affichage</span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {items.map((block) => (
            <SortableBlock
              key={block.id}
              block={block}
              onEdit={() => onEdit(block)}
              onDelete={() => onDelete(block.id)}
              onToggleVisibility={() => onToggleVisibility(block.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
