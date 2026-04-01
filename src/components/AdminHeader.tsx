'use client';

import Link from 'next/link';
import AutoSendReminders from './AutoSendReminders';
import { useState } from 'react';

interface AdminHeaderProps {
  currentPage?: 'dashboard' | 'centres' | 'appareils' | 'feature-cards' | 'solutions' | 'image-effects' | 'text-editor' | 'footer' | 'database' | 'setup-page-texts' | 'faqs' | 'settings' | 'testimonials' | 'rendez-vous' | 'mediatheque' | 'sms' | 'sms-templates' | 'content-manager' | 'linear-content-editor';
  title?: string;
}

type MenuItem = {
  href?: string;
  label: string;
  key: string;
  subItems?: { href: string; label: string; key: string }[];
};

export default function AdminHeader({ currentPage = 'dashboard', title }: AdminHeaderProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    { href: '/admin', label: '🏠 Dashboard', key: 'dashboard' },
    { href: '/admin/centres', label: '🏢 Centres', key: 'centres' },
    { href: '/admin/rendez-vous', label: '📅 Rendez-vous', key: 'rendez-vous' },
    { href: '/admin/appareils', label: '🦻 Appareils', key: 'appareils' },
    { href: '/admin/settings', label: '⚙️ Paramètres', key: 'settings' },
    { href: '/admin/testimonials', label: '⭐ Avis clients', key: 'testimonials' },
    { href: '/admin/mediatheque', label: '📷 Médiathèque', key: 'mediatheque' },
    {
      label: '📱 SMS',
      key: 'sms-menu',
      subItems: [
        { href: '/admin/sms', label: '📱 SMS', key: 'sms' },
        { href: '/admin/sms-templates', label: '📝 Modèles SMS', key: 'sms-templates' },
      ],
    },
    { href: '/admin/content-manager', label: '📦 Gestionnaire de Contenu', key: 'content-manager' },
    {
      label: '✏️ Edition',
      key: 'edition',
      subItems: [
        { href: '/admin/linear-content-editor', label: '📋 Éditeur Linéaire (NOUVEAU)', key: 'linear-content-editor' },
        { href: '/admin/feature-cards', label: '🎨 Feature Cards', key: 'feature-cards' },
        { href: '/admin/solutions', label: '📋 Solutions', key: 'solutions' },
        { href: '/admin/faqs', label: '❓ FAQs', key: 'faqs' },
        { href: '/admin/image-effects', label: '🖼️ Images & Effets', key: 'image-effects' },
        { href: '/admin/text-editor', label: '📝 Textes', key: 'text-editor' },
      ],
    },
    { href: '/admin/footer', label: '🦶 Footer', key: 'footer' },
    { href: '/admin/database', label: '🗄️ Base de données', key: 'database' },
  ];

  const editionKeys = ['feature-cards', 'solutions', 'faqs', 'image-effects', 'text-editor', 'content-manager', 'linear-content-editor'];
  const isEditionActive = editionKeys.includes(currentPage);
  const smsKeys = ['sms', 'sms-templates'];
  const isSmsActive = smsKeys.includes(currentPage);

  return (
    <>
      <AutoSendReminders />
      <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary">
              {title || '🛠️ Admin Audire'}
            </h1>
            <div className="flex gap-4 mt-2 text-sm flex-wrap items-center">
              {menuItems.map((item) => {
                if (item.subItems) {
                  return (
                    <div
                      key={item.key}
                      className="relative"
                      onMouseEnter={() => setOpenDropdown(item.key)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <button
                        className={`transition-colors cursor-pointer ${
                          (item.key === 'edition' && isEditionActive) || (item.key === 'sms-menu' && isSmsActive)
                            ? 'text-primary font-bold underline'
                            : 'text-gray-600 hover:text-primary hover:underline'
                        }`}
                      >
                        {item.label} ▾
                      </button>
                      {openDropdown === item.key && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[200px] z-50">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.key}
                              href={subItem.href}
                              className={`block px-4 py-2 text-sm transition-colors ${
                                subItem.key === currentPage
                                  ? 'bg-primary/10 text-primary font-bold'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.key}
                    href={item.href!}
                    className={`transition-colors ${
                      item.key === currentPage
                        ? 'text-primary font-bold underline'
                        : 'text-gray-600 hover:text-primary hover:underline'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <Link
            href="/"
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition"
          >
            ← Retour au site
          </Link>
        </div>
      </header>
    </>
  );
}
