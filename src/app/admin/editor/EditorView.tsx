'use client';

// src/app/admin/editor/EditorView.tsx
// Sprint 4.1 — pleine largeur en desktop + bouton "Plein écran" qui cache la sidebar admin.

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminTopbar, { type Device } from '@/components/admin/AdminTopbar';
import BlockInspector, { type SelectedBlock } from '@/components/admin/BlockInspector';
import PublishBar from '@/components/admin/PublishBar';
import { useEditorHistory, type EditOp } from '@/components/admin/useEditorHistory';
import { useDrafts, draftsStore } from '@/components/admin/useDrafts';
import { ChevronDown, Search, Maximize2, Minimize2 } from 'lucide-react';

type Page = { slug: string; label: string; path: string };

// Sprint 4.1 — desktop = 100% (limité uniquement par le viewport).
const DEVICE_WIDTHS: Record<Device, number | string> = { desktop: '100%', tablet: 820, mobile: 390 };

export default function EditorView({ page, pages }: { page: Page; pages: Page[] }) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [device, setDevice] = useState<Device>('desktop');
  const [pageMenuOpen, setPageMenuOpen] = useState(false);
  const [pageFilter, setPageFilter] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [selected, setSelected] = useState<SelectedBlock | null>(null);
  const [iframeReady, setIframeReady] = useState(false);
  const [iframeRect, setIframeRect] = useState({ x: 0, y: 0 });
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [liveFaqsById, setLiveFaqsById] = useState<Record<string, { categoryId: number | null }>>({});

  const history = useEditorHistory();
  const d = useDrafts();

  function refreshIframe() {
    if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
  }

  // Sprint 4.1 — toggle plein écran : on met l'éditeur en position fixed inset:0,
  // ce qui passe au-dessus de la sidebar admin (peu importe son selector).
  useEffect(() => {
    if (fullscreen) {
      document.documentElement.style.setProperty('overflow', 'hidden');
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFullscreen(false); };
      window.addEventListener('keydown', onKey);
      return () => { document.documentElement.style.removeProperty('overflow'); window.removeEventListener('keydown', onKey); };
    }
  }, [fullscreen]);

  const syncFromIframe = useCallback((pathname: string) => {
    if (!pathname) return;
    const match = pages.find((p) => p.path === pathname || (p.path !== '/' && pathname.startsWith(p.path)));
    if (!match || match.slug === page.slug) return;
    setSelected(null); setIframeReady(false); history.clear();
    router.push(`/admin/editor?page=${match.slug}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages, page.slug]);

  useEffect(() => {
    fetch('/api/categories').then((r) => r.ok ? r.json() : []).then((cats: any[]) => {
      setCategories(cats.map((c) => ({ id: c.id, name: c.name })));
    });
    fetch('/api/faqs').then((r) => r.ok ? r.json() : []).then((faqs: any[]) => {
      const map: Record<string, { categoryId: number | null }> = {};
      faqs.forEach((f) => { map[String(f.id)] = { categoryId: f.categoryId ?? null }; });
      setLiveFaqsById(map);
    });
  }, []);

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (d.count === 0) return;
      e.preventDefault(); e.returnValue = '';
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [d.count]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const msg = e.data;
      if (!msg || typeof msg !== 'object') return;
      if (msg.type === 'editor:blocks-changed' || msg.type === 'editor:layout-changed') { refreshIframe(); return; }
      if (msg.type === 'editor:navigate' && typeof msg.path === 'string') { syncFromIframe(msg.path); return; }
      if (e.source !== iframeRef.current?.contentWindow) return;
      switch (msg.type) {
        case 'editor:ready':
          setIframeReady(true);
          iframeRef.current?.contentWindow?.postMessage({ type: 'editor:apply-drafts', drafts: draftsStore.read() }, '*');
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
  }, [syncFromIframe]);

  function onIframeLoad() {
    try {
      const w = iframeRef.current?.contentWindow;
      if (!w) return;
      syncFromIframe(w.location.pathname);
    } catch {}
  }

  useEffect(() => {
    function update() {
      if (!iframeRef.current) return;
      const r = iframeRef.current.getBoundingClientRect();
      setIframeRect({ x: r.x, y: r.y });
    }
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
  }, [device, iframeReady, fullscreen]);

  function applyTextToIframe(blockKey: string, text: string) {
    iframeRef.current?.contentWindow?.postMessage({ type: 'editor:apply-text', blockKey, text }, '*');
  }

  function saveDraft(blockKey: string, value: string) {
    if (blockKey.startsWith('faq-item:')) {
      const [, id, field] = blockKey.split(':');
      if (field === 'question' || field === 'answer') d.setFaqItem(id, { [field]: value });
    } else if (blockKey.startsWith('faq-category:')) {
      const [, id, field] = blockKey.split(':');
      if (field === 'name' || field === 'description' || field === 'imageUrl') d.setCategory(id, { [field]: value });
    } else if (blockKey.includes('.')) {
      d.setPageText(blockKey, value);
    }
  }

  let faqCategoryId: number | null | undefined = undefined;
  if (selected?.blockKey.startsWith('faq-item:')) {
    const [, id] = selected.blockKey.split(':');
    const draftCatId = d.drafts.faqItems[id]?.categoryId;
    faqCategoryId = draftCatId !== undefined ? draftCatId : (liveFaqsById[id]?.categoryId ?? null);
  }

  useEffect(() => {
    function applyOp(op: EditOp) { applyTextToIframe(op.blockKey, op.before); saveDraft(op.blockKey, op.before); }
    function applyOpRedo(op: EditOp) { applyTextToIframe(op.blockKey, op.after); saveDraft(op.blockKey, op.after); }
    const onUndo = (e: Event) => applyOp((e as CustomEvent<EditOp>).detail);
    const onRedo = (e: Event) => applyOpRedo((e as CustomEvent<EditOp>).detail);
    window.addEventListener('editor:apply-undo', onUndo);
    window.addEventListener('editor:apply-redo', onRedo);
    return () => { window.removeEventListener('editor:apply-undo', onUndo); window.removeEventListener('editor:apply-redo', onRedo); };
  }, []);

  function changePage(slug: string) {
    setSelected(null); setIframeReady(false); setPageMenuOpen(false); setPageFilter(''); history.clear();
    router.push(`/admin/editor?page=${slug}`);
  }

  async function handlePublish() {
    const res = await fetch('/api/admin/publish', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draftsStore.read()),
    });
    if (!res.ok) { alert('Erreur lors de la publication.'); return; }
    d.clear(); history.clear();
    iframeRef.current?.contentWindow?.postMessage({ type: 'editor:reset-blocks' }, '*');
    refreshIframe();
  }

  function handleDiscard() { d.clear(); history.clear(); refreshIframe(); }

  const filteredPages = pageFilter
    ? pages.filter((p) =>
        p.label.toLowerCase().includes(pageFilter.toLowerCase()) ||
        p.path.toLowerCase().includes(pageFilter.toLowerCase()))
    : pages;

  // Conteneur racine — fixed inset:0 quand fullscreen, sinon flex column normal.
  const rootCls = fullscreen
    ? 'fixed inset-0 bg-white z-[9999] flex flex-col'
    : 'flex flex-col h-screen';

  return (
    <div className={rootCls}>
      <AdminTopbar
        crumbs={[{ label: 'Site web' }, { label: 'Éditeur' }]}
        device={device} onDeviceChange={setDevice}
        canUndo={history.canUndo} canRedo={history.canRedo}
        onUndo={() => { const op = history.undo(); if (op) { applyTextToIframe(op.blockKey, op.before); saveDraft(op.blockKey, op.before); } }}
        onRedo={() => { const op = history.redo(); if (op) { applyTextToIframe(op.blockKey, op.after); saveDraft(op.blockKey, op.after); } }}
        rightExtra={
          <div className="flex items-center gap-2">
            <PublishBar pendingCount={d.count} onPublish={handlePublish} onDiscard={handleDiscard} />

            {/* Sprint 4.1 — toggle plein écran */}
            <button type="button" onClick={() => setFullscreen((v) => !v)}
              title={fullscreen ? 'Quitter le plein écran (Échap)' : 'Plein écran — masque la sidebar admin'}
              className="h-7 w-7 grid place-items-center rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600">
              {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            <div className="relative">
              <button type="button" onClick={() => setPageMenuOpen((v) => !v)}
                className="h-7 px-2.5 rounded-md border border-gray-200 hover:bg-gray-50 text-[13px] font-medium flex items-center gap-1.5 max-w-[200px]">
                <span className="truncate">{page.label}</span><ChevronDown className="w-3 h-3 flex-shrink-0" />
              </button>
              {pageMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setPageMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-40 overflow-hidden">
                    <div className="p-2 border-b border-gray-100">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" autoFocus value={pageFilter} onChange={(e) => setPageFilter(e.target.value)}
                          placeholder="Filtrer les pages…"
                          className="w-full text-[12px] pl-7 pr-2 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400" />
                      </div>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto py-1">
                      {filteredPages.length === 0 ? (
                        <div className="px-3 py-3 text-[12px] text-gray-400 text-center">Aucune page</div>
                      ) : filteredPages.map((p) => (
                        <button key={p.slug} type="button" onClick={() => changePage(p.slug)}
                          className={`w-full text-left px-3 py-2 text-[13px] hover:bg-gray-50 flex items-baseline justify-between gap-2 ${
                            p.slug === page.slug ? 'bg-primary/5 font-semibold text-gray-900' : 'text-gray-700'
                          }`}>
                          <span className="truncate">{p.label}</span>
                          <span className="text-[10px] text-gray-400 font-mono flex-shrink-0">{p.path}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        }
        onPreview={() => window.open(page.path, '_blank')}
      />

      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        {/* Sprint 4.1 — desktop = max-w-none, autres devices = device width */}
        <div className="mx-auto bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300"
             style={{
               width: device === 'desktop' ? '100%' : DEVICE_WIDTHS[device],
               maxWidth: '100%',
             }}>
          {!iframeReady && <div className="aspect-[16/10] grid place-items-center text-sm text-gray-500">Chargement de la page…</div>}
          <iframe
            ref={iframeRef} key={page.slug} src={`${page.path}?edit=1`}
            onLoad={onIframeLoad}
            className={`w-full bg-white ${iframeReady ? 'block' : 'hidden'}`}
            style={{ height: 'calc(100vh - 100px)', border: 0 }}
            title={`Aperçu : ${page.label}`}
          />
        </div>
      </div>

      {selected && (
        <BlockInspector
          selected={selected} iframeRect={iframeRect}
          onChange={(text) => applyTextToIframe(selected.blockKey, text)}
          onCommit={(before, after) => {
            history.push({ blockKey: selected.blockKey, before, after });
            saveDraft(selected.blockKey, after);
          }}
          onClose={() => setSelected(null)}
          categories={categories}
          faqCategoryId={faqCategoryId}
          onFaqCategoryChange={(catId) => {
            if (!selected.blockKey.startsWith('faq-item:')) return;
            const [, id] = selected.blockKey.split(':');
            d.setFaqItem(id, { categoryId: catId });
          }}
          onLayoutChanged={refreshIframe}
        />
      )}
    </div>
  );
}
