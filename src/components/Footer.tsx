'use client';

// Footer.tsx — version unifiée : icônes téléphone/email/adresse/mobile lues depuis Settings.

import Link from 'next/link';
import { useCentre } from '@/contexts/CentreContext';
import { useState, useEffect } from 'react';
import ContactIcon from './ContactIcon';

const daysOfWeekShort = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

interface FooterTexts { [key: string]: string }

export default function Footer() {
  const { currentCentre, loading } = useCentre();
  const [texts, setTexts] = useState<FooterTexts>({});

  useEffect(() => {
    fetch('/api/page-texts?pageKey=footer')
      .then((r) => (r.ok ? r.json() : {}))
      .then(setTexts)
      .catch((e) => console.error('Error loading footer texts:', e));
  }, []);

  const phoneLink = currentCentre?.phoneFixe?.replace(/\s/g, '') || '+3242750666';
  const phoneDisplay = currentCentre?.phoneFixe || '042 75 06 66';
  const email = currentCentre?.email || 'centre.audire@gmail.com';
  const address = currentCentre?.address || 'Rue de la Station, 4\n4101 Jemeppe-sur-Meuse';
  const addressLines = address.split('\n');

  const formatHours = () => {
    if (loading || !currentCentre?.openingHours || currentCentre.openingHours.length === 0) {
      return <li><strong>Lun - Ven:</strong> 9h-12h, 13h-17h</li>;
    }
    const formatted: JSX.Element[] = [];
    let currentGroup: number[] = [];
    let currentHours: string | null = null;
    const sortedHours = [...currentCentre.openingHours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

    sortedHours.forEach((hour, index) => {
      const hourStr = hour.isOpen
        ? `${hour.morningOpen || ''}-${hour.morningClose || ''}, ${hour.afternoonOpen || ''}-${hour.afternoonClose || ''}`
        : 'Fermé';
      if (hourStr === currentHours) {
        currentGroup.push(hour.dayOfWeek);
      } else {
        if (currentGroup.length > 0) {
          const days = currentGroup.length === 1
            ? daysOfWeekShort[currentGroup[0]]
            : `${daysOfWeekShort[currentGroup[0]]} - ${daysOfWeekShort[currentGroup[currentGroup.length - 1]]}`;
          formatted.push(<li key={currentGroup[0]}><strong>{days}:</strong> {currentHours}</li>);
        }
        currentGroup = [hour.dayOfWeek];
        currentHours = hourStr;
      }
      if (index === sortedHours.length - 1 && currentGroup.length > 0) {
        const days = currentGroup.length === 1
          ? daysOfWeekShort[currentGroup[0]]
          : `${daysOfWeekShort[currentGroup[0]]} - ${daysOfWeekShort[currentGroup[currentGroup.length - 1]]}`;
        formatted.push(<li key={currentGroup[0]}><strong>{days}:</strong> {currentHours}</li>);
      }
    });
    return formatted.length > 0 ? formatted : <li><strong>Lun - Ven:</strong> 9h-12h, 13h-17h</li>;
  };

  return (
    <footer className="bg-gradient-to-br from-primary/5 to-primary-light/5 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">{texts['title'] || currentCentre?.name || 'Audire'}</h3>
            <p className="text-text-light text-sm mb-4">
              {texts['description'] || 'Centre auditif indépendant en province de Liège. Accompagnement humain et solutions de qualité.'}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">{texts['quick-links-title'] || 'Liens rapides'}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/solutions-auditives" className="text-text-light hover:text-primary transition-colors">Solutions auditives</Link></li>
              <li><Link href="/remboursements" className="text-text-light hover:text-primary transition-colors">Remboursements</Link></li>
              <li><Link href="/notre-accompagnement" className="text-text-light hover:text-primary transition-colors">Notre accompagnement</Link></li>
              <li><Link href="/notre-histoire" className="text-text-light hover:text-primary transition-colors">Notre histoire</Link></li>
              <li><Link href="/faq" className="text-text-light hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">{texts['contact-title'] || 'Contact'}</h3>
            <ul className="space-y-2 text-sm text-text-light">
              <li className="flex items-center gap-2">
                <ContactIcon settingKey="contact_icon_address" fallback="📍" size={16} />
                {addressLines[0]}
              </li>
              <li className="ml-6">{currentCentre?.postalCode || '4101'} {currentCentre?.city || 'Jemeppe-sur-Meuse'}</li>
              <li className="flex items-center gap-2">
                <ContactIcon settingKey="contact_icon_phone" fallback="📞" size={16} />
                <a href={`tel:${phoneLink}`} className="hover:text-primary transition-colors">{phoneDisplay}</a>
              </li>
              {currentCentre?.phoneMobile && (
                <li className="flex items-center gap-2">
                  <ContactIcon settingKey="contact_icon_mobile" fallback="📱" size={16} />
                  <a href={`tel:${currentCentre.phoneMobile.replace(/\s/g, '')}`} className="hover:text-primary transition-colors">
                    {currentCentre.phoneMobile}
                  </a>
                </li>
              )}
              <li className="flex items-center gap-2">
                <ContactIcon settingKey="contact_icon_email" fallback="✉️" size={16} />
                <a href={`mailto:${email}`} className="hover:text-primary transition-colors">{email}</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">{texts['hours-title'] || 'Horaires'}</h3>
            <ul className="space-y-2 text-sm text-text-light">{formatHours()}</ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-wrap justify-between items-center gap-4 text-sm text-text-muted">
          <p>&copy; {new Date().getFullYear()} {texts['copyright'] || 'Audire. Tous droits réservés.'}</p>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="hover:text-primary transition-colors">{texts['legal-link-1'] || 'Mentions légales'}</Link>
            <Link href="/confidentialite" className="hover:text-primary transition-colors">{texts['legal-link-2'] || 'Politique de confidentialité'}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
