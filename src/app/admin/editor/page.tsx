// src/app/admin/editor/page.tsx
// Server component — page selector + editor shell.
// Phase 2 : on démarre avec FAQ, mais l'architecture supporte n'importe quelle page publique.

import EditorView from './EditorView';

export const dynamic = 'force-dynamic';

const EDITABLE_PAGES = [
  { slug: 'faq', label: 'FAQ', path: '/faq' },
  { slug: 'contact', label: 'Contact', path: '/contact' },
  { slug: 'remboursements', label: 'Remboursements', path: '/remboursements' },
  { slug: 'notre-accompagnement', label: 'Notre accompagnement', path: '/notre-accompagnement' },
  { slug: 'notre-histoire', label: 'Notre histoire', path: '/notre-histoire' },
  { slug: 'solutions-auditives', label: 'Solutions auditives', path: '/solutions-auditives' },
  { slug: 'test-auditif-gratuit', label: 'Test auditif gratuit', path: '/test-auditif-gratuit' },
  { slug: 'home', label: 'Accueil', path: '/' },
];

export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const slug = params.page || 'faq'; // FAQ par défaut — page test de la phase 2
  const page = EDITABLE_PAGES.find((p) => p.slug === slug) || EDITABLE_PAGES[0];

  return <EditorView page={page} pages={EDITABLE_PAGES} />;
}
