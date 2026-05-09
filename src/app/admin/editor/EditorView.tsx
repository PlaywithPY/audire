'use client';

// src/app/admin/editor/EditorView.tsx
// Sprint 2 — ajout :
//   • listener `editor:blocks-changed` / `editor:layout-changed` (refresh iframe)
//   • prop `onLayoutChanged` passée à <BlockInspector>

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminTopbar, { type Device } from '@/components/admin/AdminTopbar';
import BlockInspector, { type SelectedBlock } from '@/components/admin/BlockInspector';
import PublishBar from '@/components/admin/PublishBar';
import { useEditorHistory, type EditOp } from '@/components/admin/useEditorHistory';
import { useDrafts, draftsStore } from '@/components/admin/useDrafts';
import { ChevronDown } from 'lucide-react';

type Page = { slug: string; label: string; path: string };

const DEVICE_WIDTHS: Record<Device, number> = { desktop: 1280, tablet: 820, mobile: 390 };

export default function EditorView({ page, pages }: { page: Page; pages: Page[] }) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [device, setDevice] = useState<Device>('desktop');
  const [pageMenuOpen, setPageMenuOpen] = useState(false);
  const [selected, setSelected] = useState<SelectedBlock | null>(null);
  const [iframeReady, setIframeReady] = useState(false);
  const [iframeRect, setIframeRect] = useState({ x: 0, y: 0 });
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [liveFaqsById, setLiveFaqsById] = useState<Record<string, { categoryId: number | null }>>({});

  const history = useEditorHistory();
  const d = useDrafts();

  // Helper — recharge l'iframe (utilisé après création/suppression de bloc, changement de layout)
  function refreshIframe() {
    if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
  }

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
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [d.count]);

  // Iframe ↔ parent
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const msg = e.data;
      if (!msg || typeof msg !== 'object') return;

      // ─── Sprint 2 : messages d'invalidation venant de n'importe quel iframe ───
      if (msg.type === 'editor:blocks-changed' || msg.type === 'editor:layout-changed') {
        refreshIframe();
        return;
      }

      // Les autres messages doivent venir de notre iframe
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
  }, []);

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
    return () => {
      window.removeEventListener('editor:apply-undo', onUndo);
      window.removeEventListener('editor:apply-redo', onRedo);
    };
  }, []);

  function changePage(slug: string) {
    setSelected(null); setIframeReady(false); setPageMenuOpen(false); history.clear();
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

  function handleDiscard() {
    d.clear(); history.clear();
    refreshIframe();
  }

  return (
    <div className="flex flex-col h-screen">
      <AdminTopbar
        crumbs={[{ label: 'Site web' }, { label: 'Éditeur' }]}
        device={device} onDeviceChange={setDevice}
        canUndo={history.canUndo} canRedo={history.canRedo}
        onUndo={() => { const op = history.undo(); if (op) { applyTextToIframe(op.blockKey, op.before); saveDraft(op.blockKey, op.before); } }}
        onRedo={() => { const op = history.redo(); if (op) { applyTextToIframe(op.blockKey, op.after); saveDraft(op.blockKey, op.after); } }}
        rightExtra={
          <div className="flex items-center gap-2">
            <PublishBar pendingCount={d.count} onPublish={handlePublish} onDiscard={handleDiscard} />
            <div className="relative">
              <button type="button" onClick={() => setPageMenuOpen((v) => !v)}
                className="h-7 px-2.5 rounded-md border border-gray-200 hover:bg-gray-50 text-[13px] font-medium flex items-center gap-1.5">
                {page.label}<ChevronDown className="w-3 h-3" />
              </button>
              {pageMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-40">
                  {pages.map((p) => (
                    <button key={p.slug} type="button" onClick={() => changePage(p.slug)}
                      className={`w-full text-left px-3 py-1.5 text-[13px] hover:bg-gray-50 ${p.slug === page.slug ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {p.label}<span className="ml-2 text-[11px] text-gray-400 font-mono">{p.path}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        }
        onPreview={() => window.open(page.path, '_blank')}
      />

      <div className="flex-1 overflow-auto bg-gray-100 p-6">
        <div className="mx-auto bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300"
             style={{ maxWidth: DEVICE_WIDTHS[device] }}>
          {!iframeReady && <div className="aspect-[16/10] grid place-items-center text-sm text-gray-500">Chargement de la page…</div>}
          <iframe
            ref={iframeRef} key={page.slug} src={`${page.path}?edit=1`}
            className={`w-full bg-white ${iframeReady ? 'block' : 'hidden'}`}
            style={{ height: 'calc(100vh - 120px)', border: 0 }}
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
          /* Sprint 2 — refresh quand le LayoutPanel sauve un layout */
          onLayoutChanged={refreshIframe}
        />
      )}
    </div>
  );
}
