// src/app/admin/editor/page.tsx
// Sprint 4 — liste complète des pages publiques (toutes celles du site).

import EditorView from './EditorView';

export const dynamic = 'force-dynamic';

const EDITABLE_PAGES = [
  { slug: 'home',                  label: 'Accueil',              path: '/' },
  { slug: 'notre-histoire',        label: 'Notre histoire',       path: '/notre-histoire' },
  { slug: 'notre-accompagnement',  label: 'Notre accompagnement', path: '/notre-accompagnement' },
  { slug: 'solutions-auditives',   label: 'Solutions auditives',  path: '/solutions-auditives' },
  { slug: 'test-auditif-gratuit',  label: 'Test auditif gratuit', path: '/test-auditif-gratuit' },
  { slug: 'partenaires-pharmaciens', label: 'Partenaires pharmaciens', path: '/partenaires-pharmaciens' },
  { slug: 'remboursements',        label: 'Remboursements',       path: '/remboursements' },
  { slug: 'contact',               label: 'Contact',              path: '/contact' },
  { slug: 'prendre-rendez-vous',   label: 'Prendre rendez-vous',  path: '/prendre-rendez-vous' },
  { slug: 'faq',                   label: 'FAQ',                  path: '/faq' },
  { slug: 'mentions-legales',      label: 'Mentions légales',     path: '/mentions-legales' },
  { slug: 'confidentialite',       label: 'Confidentialité',      path: '/confidentialite' },
];

export default async function EditorPage({
  searchParams,
}: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const slug = params.page || 'home';
  const page = EDITABLE_PAGES.find((p) => p.slug === slug) || EDITABLE_PAGES[0];
  return <EditorView page={page} pages={EDITABLE_PAGES} />;
}
