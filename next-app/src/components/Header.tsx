'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import TopBanner from './TopBanner';
import Logo from './Logo';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Solutions auditives', href: '/solutions-auditives' },
    { name: 'Remboursements', href: '/remboursements' },
    { name: 'Notre accompagnement', href: '/notre-accompagnement' },
    { name: 'Partenaires', href: '/partenaires-pharmaciens' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <TopBanner />

      {/* Header avec logo en survol */}
      <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm flex items-center min-h-[88px] transition-all ${
        isScrolled ? 'shadow-md' : ''
      }`}>
        {/* Logo en position absolute à gauche avec marge - Se décale vers le bas au scroll */}
        <div className={`absolute left-6 z-[51] transition-all duration-300 ${
          isScrolled ? 'top-6' : 'top-1/2 -translate-y-1/2'
        }`}>
          <Logo />
        </div>

        {/* Navigation avec padding-left pour le logo */}
        <nav className="container mx-auto px-4 py-5 pl-48">
          <div className="flex items-center justify-between gap-8">
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-text-light hover:text-primary transition-colors font-medium whitespace-nowrap"
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/test-auditif-gratuit"
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-all font-semibold whitespace-nowrap"
              >
                Test gratuit
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-text p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-2 text-text-light hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/test-auditif-gratuit"
                className="block mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-all font-semibold text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Test gratuit
              </Link>
            </div>
          )}
        </nav>
      </header>
    </>
  );
}
