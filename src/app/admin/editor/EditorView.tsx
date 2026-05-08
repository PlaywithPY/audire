'use client';

// src/app/admin/editor/EditorView.tsx
// Phase 2.5 — shell éditeur complet : topbar + iframe + inspecteur réel + undo/redo.

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminTopbar, { type Device } from '@/components/admin/AdminTopbar';
import BlockInspector, { type SelectedBlock } from '@/components/admin/BlockInspector';
import { useEditorHistory, type EditOp } from '@/components/admin/useEditorHistory';
import { ChevronDown } from 'lucide-react';

type Page = { slug: string; label: string; path: string };

const DEVICE_WIDTHS: Record<Device, number> = { desktop: 1280, tablet: 820, mobile: 390 };

export default function EditorView({ page, pages }: { page: Page; pages: Page[] }) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [device, setDevice] = useState<Device>('desktop');
  const [pageMenuOpen, setPageMenuOpen] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [selected, setSelected] = useState<SelectedBlock | null>(null);
  const [iframeReady, setIframeReady] = useState(false);
  const [iframeRect, setIframeRect] = useState({ x: 0, y: 0 });

  const history = useEditorHistory();

  // Communication avec l'iframe
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.source !== iframeRef.current?.contentWindow) return;
      const msg = e.data;
      if (!msg || typeof msg !== 'object') return;

      switch (msg.type) {
        case 'editor:ready':
          setIframeReady(true);
          break;
        case 'editor:select':
          setSelected({ blockKey: msg.blockKey, rect: msg.rect, data: msg.data });
          break;
        case 'editor:deselect':
          setSelected(null);
          break;
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // Position de l'iframe → pour positionner l'inspecteur
  useEffect(() => {
    function update() {
      if (!iframeRef.current) return;
      const r = iframeRef.current.getBoundingClientRect();
      setIframeRect({ x: r.x, y: r.y });
    }
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [device, iframeReady]);

  // Applique un texte dans l'iframe
  function applyTextToIframe(blockKey: string, text: string) {
    iframeRef.current?.contentWindow?.postMessage({ type: 'editor:apply-text', blockKey, text }, '*');
  }

  // Listeners undo/redo (déclenchés par les raccourcis clavier dans le hook)
  useEffect(() => {
    function applyOp(op: EditOp, direction: 'undo' | 'redo') {
      const text = direction === 'undo' ? op.before : op.after;
      applyTextToIframe(op.blockKey, text);
      // Sauvegarde côté serveur
      const [pageKey, ...keyParts] = op.blockKey.split('.');
      fetch('/api/page-texts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageKey, textKey: keyParts.join('.'), content: text }),
      }).catch(() => {});
    }
    const onUndo = (e: Event) => applyOp((e as CustomEvent<EditOp>).detail, 'undo');
    const onRedo = (e: Event) => applyOp((e as CustomEvent<EditOp>).detail, 'redo');
    window.addEventListener('editor:apply-undo', onUndo);
    window.addEventListener('editor:apply-redo', onRedo);
    return () => {
      window.removeEventListener('editor:apply-undo', onUndo);
      window.removeEventListener('editor:apply-redo', onRedo);
    };
  }, []);

  function changePage(slug: string) {
    setSelected(null);
    setIframeReady(false);
    setPageMenuOpen(false);
    history.clear();
    router.push(`/admin/editor?page=${slug}`);
  }

  return (
    <div className="flex flex-col h-screen">
      <AdminTopbar
        crumbs={[{ label: 'Site web' }, { label: 'Éditeur' }]}
        saveState={saveState}
        device={device}
        onDeviceChange={setDevice}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onUndo={() => {
          const op = history.undo();
          if (op) applyTextToIframe(op.blockKey, op.before);
        }}
        onRedo={() => {
          const op = history.redo();
          if (op) applyTextToIframe(op.blockKey, op.after);
        }}
        rightExtra={
          <div className="relative">
            <button
              type="button"
              onClick={() => setPageMenuOpen((v) => !v)}
              className="h-7 px-2.5 rounded-md border border-gray-200 hover:bg-gray-50 text-[13px] font-medium flex items-center gap-1.5"
            >
              {page.label}
              <ChevronDown className="w-3 h-3" />
            </button>
            {pageMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-40">
                {pages.map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => changePage(p.slug)}
                    className={`w-full text-left px-3 py-1.5 text-[13px] hover:bg-gray-50 ${
                      p.slug === page.slug ? 'font-semibold text-gray-900' : 'text-gray-700'
                    }`}
                  >
                    {p.label}
                    <span className="ml-2 text-[11px] text-gray-400 font-mono">{p.path}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        }
        onPreview={() => window.open(page.path, '_blank')}
      />

      <div ref={containerRef} className="flex-1 overflow-auto bg-gray-100 p-6">
        <div
          className="mx-auto bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300"
          style={{ maxWidth: DEVICE_WIDTHS[device] }}
        >
          {!iframeReady && (
            <div className="aspect-[16/10] grid place-items-center text-sm text-gray-500">
              Chargement de la page…
            </div>
          )}
          <iframe
            ref={iframeRef}
            key={page.slug}
            src={`${page.path}?edit=1`}
            className={`w-full bg-white ${iframeReady ? 'block' : 'hidden'}`}
            style={{ height: 'calc(100vh - 120px)', border: 0 }}
            title={`Aperçu : ${page.label}`}
          />
        </div>
      </div>

      {selected && (
        <BlockInspector
          selected={selected}
          iframeRect={iframeRect}
          onChange={(text) => {
            applyTextToIframe(selected.blockKey, text);
            setSaveState('saving');
          }}
          onCommit={(before, after) => {
            history.push({ blockKey: selected.blockKey, before, after });
            setSaveState('saved');
          }}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
