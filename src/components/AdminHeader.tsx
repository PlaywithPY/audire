import Link from 'next/link';

interface AdminHeaderProps {
  currentPage?: 'dashboard' | 'feature-cards' | 'solutions' | 'image-effects' | 'text-editor' | 'footer' | 'database' | 'setup-page-texts' | 'faqs' | 'settings' | 'testimonials';
  title?: string;
}

export default function AdminHeader({ currentPage = 'dashboard', title }: AdminHeaderProps) {
  const links = [
    { href: '/admin', label: '🏠 Dashboard', key: 'dashboard' },
    { href: '/admin/settings', label: '⚙️ Paramètres', key: 'settings' },
    { href: '/admin/testimonials', label: '⭐ Avis clients', key: 'testimonials' },
    { href: '/admin/feature-cards', label: '🎨 Feature Cards', key: 'feature-cards' },
    { href: '/admin/solutions', label: '📋 Solutions', key: 'solutions' },
    { href: '/admin/faqs', label: '❓ FAQs', key: 'faqs' },
    { href: '/admin/image-effects', label: '🖼️ Images & Effets', key: 'image-effects' },
    { href: '/admin/text-editor', label: '📝 Textes', key: 'text-editor' },
    { href: '/admin/footer', label: '🦶 Footer', key: 'footer' },
    { href: '/admin/database', label: '🗄️ Base de données', key: 'database' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {title || '🛠️ Admin Audire'}
          </h1>
          <div className="flex gap-4 mt-2 text-sm">
            {links.filter(link => link.key !== currentPage).map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="text-gray-600 hover:text-primary hover:underline transition-colors"
              >
                {link.label}
              </Link>
            ))}
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
  );
}
