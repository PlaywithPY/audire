'use client';

// src/app/admin/editor/EditorView.tsx
// Client shell : topbar + iframe de la page publique en mode édition + (à venir) inspecteur.
// La communication avec l'iframe se fait via postMessage (voir EditorOverlay côté public).

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminTopbar, { type Device } from '@/components/admin/AdminTopbar';
import { ChevronDown } from 'lucide-react';

type Page = { slug: string; label: string; path: string };

const DEVICE_WIDTHS: Record<Device, number> = {
  desktop: 1280,
  tablet: 820,
  mobile: 390,
};

type IframeMessage =
  | { type: 'editor:ready' }
  | { type: 'editor:select'; blockKey: string; rect: { x: number; y: number; width: number; height: number }; data: Record<string, unknown> }
  | { type: 'editor:deselect' }
  | { type: 'editor:dirty' };

export default function EditorView({ page, pages }: { page: Page; pages: Page[] }) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [device, setDevice] = useState<Device>('desktop');
  const [pageMenuOpen, setPageMenuOpen] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [selected, setSelected] = useState<{ blockKey: string; data: Record<string, unknown> } | null>(null);
  const [iframeReady, setIframeReady] = useState(false);

  // Écoute les messages de l'iframe (page publique en mode édition)
  useEffect(() => {
    function onMessage(e: MessageEvent<IframeMessage>) {
      // Sécurité : on accepte uniquement les messages de notre propre iframe
      if (e.source !== iframeRef.current?.contentWindow) return;
      const msg = e.data;
      if (!msg || typeof msg !== 'object') return;

      switch (msg.type) {
        case 'editor:ready':
          setIframeReady(true);
          break;
        case 'editor:select':
          setSelected({ blockKey: msg.blockKey, data: msg.data });
          break;
        case 'editor:deselect':
          setSelected(null);
          break;
        case 'editor:dirty':
          setSaveState('saving');
          window.setTimeout(() => setSaveState('saved'), 600);
          break;
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  function changePage(slug: string) {
    setSelected(null);
    setIframeReady(false);
    setPageMenuOpen(false);
    router.push(`/admin/editor?page=${slug}`);
  }

  return (
    <div className="flex flex-col h-screen">
      <AdminTopbar
        crumbs={[
          { label: 'Site web' },
          { label: 'Éditeur' },
        ]}
        saveState={saveState}
        device={device}
        onDeviceChange={setDevice}
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
        onPublish={() => alert('Publication à venir (Phase 2.5)')}
      />

      <div className="flex-1 overflow-auto bg-gray-100 p-6">
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
            key={page.slug /* force reload sur changement de page */}
            src={`${page.path}?edit=1`}
            className={`w-full bg-white ${iframeReady ? 'block' : 'hidden'}`}
            style={{ height: 'calc(100vh - 120px)', border: 0 }}
            title={`Aperçu : ${page.label}`}
          />
        </div>
      </div>

      {/* Inspecteur (placeholder Phase 2 — sera remplacé par <BlockInspector /> Phase 2.5) */}
      {selected && (
        <div className="fixed bottom-4 right-4 w-72 bg-white border border-gray-200 rounded-lg shadow-xl p-3 text-[13px]">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-mono mb-2">
            Bloc sélectionné
          </div>
          <div className="font-mono text-[11px] bg-gray-50 p-2 rounded break-all">
            {selected.blockKey}
          </div>
          <pre className="mt-2 text-[10px] bg-gray-50 p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(selected.data, null, 2)}
          </pre>
          <div className="mt-2 text-[11px] text-gray-500">
            L'inspecteur d'édition arrive en Phase 2.5.
          </div>
        </div>
      )}
    </div>
  );
}
