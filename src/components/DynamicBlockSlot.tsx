'use client';

// src/components/DynamicBlockSlot.tsx
// Sprint 3 — la pastille ✏️ disparaît : on clique directement sur le bloc pour
// ouvrir l'inspecteur (qui sait maintenant gérer dynamic:<id>:content).
// Le bloc "text" et "html" rendent désormais le HTML pour préserver le formatage.

import { useEffect, useState, useCallback } from 'react';
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

function BlockBody({ type, content, meta }: { type: string; content: string; meta: Record<string, any> }) {
  switch (type) {
    case 'title':
      return <h2 className="text-3xl md:text-4xl font-bold text-center my-6 text-gray-900">{content}</h2>;
    case 'text':
      // Sprint 3 — rendu HTML pour préserver le formatage de TipTap
      return (
        <div
          className="prose prose-lg max-w-3xl mx-auto px-4 my-4 text-gray-700"
          dangerouslySetInnerHTML={{ __html: content || '<p>Tapez votre texte…</p>' }}
        />
      );
    case 'image':
      return meta.imageUrl ? (
        <img src={meta.imageUrl} alt={meta.alt || ''} className="max-w-3xl mx-auto rounded-xl my-6" />
      ) : (
        <div className="max-w-3xl mx-auto h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl grid place-items-center text-gray-400 my-6">
          Image (cliquer pour configurer)
        </div>
      );
    case 'button': {
      const [label = 'Bouton', href = '#'] = (content || '').split('|');
      return (
        <div className="text-center my-6">
          <a href={href} className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors">{label}</a>
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
