'use client';

// src/components/AdminHeader.tsx
// Refonte "uniformisation" — l'ancien gros menu à emojis est remplacé par un
// bandeau fin et moderne (même look que AdminTopbar), puisque la navigation est
// désormais assurée par la sidebar admin. Toutes les pages qui faisaient
// <AdminHeader currentPage=… title=… /> héritent du nouveau style sans aucune
// modification de leur code.
//
// On conserve <AutoSendReminders /> (effet de bord fonctionnel, sans UI).

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import AutoSendReminders from './AutoSendReminders';
import AdminTopbar from './admin/AdminTopbar';

interface AdminHeaderProps {
  // Conservé pour compatibilité ascendante avec les pages existantes.
  currentPage?: string;
  title?: string;
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  // Nettoie un éventuel emoji/symbole en tête de titre ("🏢 Centres" → "Centres").
  const clean = (title || 'Administration').replace(/^[^\p{L}\p{N}]+/u, '').trim() || 'Administration';

  return (
    <>
      <AutoSendReminders />
      <AdminTopbar
        crumbs={[{ label: 'Admin', href: '/admin' }, { label: clean }]}
        rightExtra={
          <Link
            href="/"
            target="_blank"
            className="h-7 px-3 rounded-md border border-gray-200 hover:bg-gray-50 text-[13px] font-medium flex items-center gap-1.5 text-gray-700"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Voir le site
          </Link>
        }
      />
    </>
  );
}
