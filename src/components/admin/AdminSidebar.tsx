'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import {
  LayoutDashboard, CalendarDays, Clock, Building2, Ear, MessageSquare,
  Pencil, FileText, Image as ImageIcon, Settings, Database,
  ChevronDown, ChevronRight, ExternalLink, Wrench, LogOut, Boxes,
} from 'lucide-react';

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeTone?: 'gray' | 'new' | 'legacy';
};
type Section = { label: string; items: Item[] };

const SECTIONS: Section[] = [
  {
    label: 'Opérations',
    items: [
      { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
      { href: '/admin/appointments', label: 'Rendez-vous', icon: CalendarDays },
      { href: '/admin/rendez-vous', label: 'Créneaux', icon: Clock },
      { href: '/admin/centres', label: 'Centres', icon: Building2 },
      // Sprint 5.10 — badge "beta" retiré, le nouvel éditeur est la version par défaut.
      // L'ancien éditeur (formulaire complet) est descendu dans "Anciens outils".
      { href: '/admin/appareils-v2', label: 'Appareils', icon: Ear },
      { href: '/admin/sms', label: 'SMS', icon: MessageSquare },
      // Uniformisation — "Modèles SMS" remonté des Anciens outils, c'est un outil courant.
      { href: '/admin/sms-templates', label: 'Modèles SMS', icon: FileText },
    ],
  },
  {
    label: 'Site web',
    items: [
      { href: '/admin/editor', label: 'Éditeur', icon: Pencil },
      { href: '/admin/faq-management', label: 'FAQ — Gestion', icon: FileText },
      { href: '/admin/feature-cards-management', label: 'Feature cards', icon: ImageIcon },
      // Refait en moderne — sorti des Anciens outils.
      { href: '/admin/solutions', label: 'Solutions', icon: Boxes },
      { href: '/admin/testimonials', label: 'Témoignages', icon: FileText },
      { href: '/admin/mediatheque', label: 'Médiathèque', icon: ImageIcon },
      { href: '/admin/image-effects', label: 'Images & effets', icon: ImageIcon },
    ],
  },
  {
    label: 'Système',
    items: [
      { href: '/admin/settings', label: 'Réglages', icon: Settings },
      { href: '/admin/database', label: 'Base de données', icon: Database },
    ],
  },
];

const LEGACY_ITEMS: Item[] = [
  // Sprint 5.10 — l'ancien éditeur d'appareils (formulaire complet) est conservé ici
  // tant que le nouvel éditeur ne couvre pas tous les champs (technicalSpecs, etc.)
  { href: '/admin/appareils',             label: 'Appareils (legacy)',     icon: Ear },
  { href: '/admin/editeur-visuel',        label: 'Éditeur visuel',         icon: Wrench },
  { href: '/admin/constructeur-visuel',   label: 'Constructeur visuel',    icon: Wrench },
  { href: '/admin/linear-content-editor', label: 'Éditeur linéaire',       icon: Wrench },
  { href: '/admin/content-manager',       label: 'Gestionnaire contenu',   icon: Wrench },
  { href: '/admin/text-editor',           label: 'Éditeur de textes',      icon: Wrench },
  { href: '/admin/setup-page-texts',      label: 'Setup textes',           icon: Wrench },
  // Feature Cards Editor — l'ancien "Feature cards (legacy)" est retiré : édition
  // inline dans l'éditeur (/admin/editor) + outil moderne "Cards visuelles".
  { href: '/admin/faqs',                  label: 'FAQs',                   icon: Wrench },
  { href: '/admin/categories',            label: 'Catégories FAQ',         icon: Wrench },
  { href: '/admin/footer',                label: 'Footer',                 icon: Wrench },
];

function badgeStyle(tone: Item['badgeTone']) {
  switch (tone) {
    case 'new':    return 'bg-emerald-100 text-emerald-700 font-semibold';
    case 'legacy': return 'bg-amber-100 text-amber-800';
    default:       return 'bg-gray-100 text-gray-500';
  }
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [legacyOpen, setLegacyOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    // Cas particulier : /admin/appareils ne doit pas être actif quand on est sur /admin/appareils-v2
    if (href === '/admin/appareils') {
      return pathname === '/admin/appareils' || (pathname?.startsWith('/admin/appareils/') && !pathname?.startsWith('/admin/appareils-v2'));
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-gray-200">
        <div className="w-7 h-7 rounded-md bg-gray-900 text-white grid place-items-center text-xs font-bold">A</div>
        <span className="font-semibold text-sm">Audire</span>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-gray-400 font-mono">admin</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-1.5 space-y-3">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-mono px-2.5 pb-1.5 pt-1">
              {section.label}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
                    active ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-gray-900' : 'text-gray-400'}`} />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge != null && (
                    <span className={`text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded ${badgeStyle(item.badgeTone)}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        <div className="pt-2 border-t border-gray-100 mt-3">
          <button type="button" onClick={() => setLegacyOpen((v) => !v)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] uppercase tracking-wider font-mono text-gray-400 hover:text-gray-600">
            {legacyOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Anciens outils
          </button>
          {legacyOpen && (
            <div className="mt-1 space-y-0.5">
              {LEGACY_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[12px] transition-colors ${
                      active ? 'bg-amber-50 text-amber-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}>
                    <Icon className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                    <span className="flex-1 truncate">{item.label}</span>
                  </Link>
                );
              })}
              <div className="px-2.5 py-2 text-[10px] text-gray-400 leading-snug">
                Conservés le temps que le nouvel éditeur soit validé sur toutes les pages.
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="border-t border-gray-200 p-3 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-primary text-white grid place-items-center text-[11px] font-semibold">
          {(session?.user?.name || session?.user?.email || 'A').slice(0, 2).toUpperCase()}
        </div>
        <div className="text-[12px] leading-tight min-w-0 flex-1">
          <div className="font-medium truncate">{session?.user?.name || session?.user?.email || 'Admin'}</div>
          <div className="text-gray-500 text-[11px]">Administrateur</div>
        </div>
        <Link href="/" title="Voir le site" className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <button type="button" onClick={() => signOut({ callbackUrl: '/admin/login' })}
          title="Se déconnecter" className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
