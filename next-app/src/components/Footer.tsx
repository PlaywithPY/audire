'use client';

import Link from 'next/link';
import { useCentre } from '@/contexts/CentreContext';

const daysOfWeekShort = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export default function Footer() {
  const { currentCentre, loading } = useCentre();

  // Valeurs par défaut pendant le chargement
  const phoneLink = currentCentre?.phoneFixe?.replace(/\s/g, '') || '+3242750666';
  const phoneDisplay = currentCentre?.phoneFixe || '042 75 06 66';
  const email = currentCentre?.email || 'centre.audire@gmail.com';
  const address = currentCentre?.address || 'Rue de la Station, 4\n4101 Jemeppe-sur-Meuse';
  const addressLines = address.split('\n');

  // Grouper les horaires par jours consécutifs avec les mêmes horaires
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
          const days =
            currentGroup.length === 1
              ? daysOfWeekShort[currentGroup[0]]
              : `${daysOfWeekShort[currentGroup[0]]} - ${daysOfWeekShort[currentGroup[currentGroup.length - 1]]}`;
          formatted.push(
            <li key={currentGroup[0]}>
              <strong>{days}:</strong> {currentHours}
            </li>
          );
        }
        currentGroup = [hour.dayOfWeek];
        currentHours = hourStr;
      }

      // Dernier élément
      if (index === sortedHours.length - 1 && currentGroup.length > 0) {
        const days =
          currentGroup.length === 1
            ? daysOfWeekShort[currentGroup[0]]
            : `${daysOfWeekShort[currentGroup[0]]} - ${daysOfWeekShort[currentGroup[currentGroup.length - 1]]}`;
        formatted.push(
          <li key={currentGroup[0]}>
            <strong>{days}:</strong> {currentHours}
          </li>
        );
      }
    });

    return formatted.length > 0 ? formatted : <li><strong>Lun - Ven:</strong> 9h-12h, 13h-17h</li>;
  };

  return (
    <footer className="bg-gradient-to-br from-primary/5 to-primary-light/5 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* À propos */}
          <div>
            <h3 className="font-bold text-lg mb-4">{currentCentre?.name || 'Audire'}</h3>
            <p className="text-text-light text-sm mb-4">
              Centre auditif indépendant en province de Liège. Accompagnement humain et solutions de qualité.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="font-bold text-lg mb-4">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/solutions-auditives" className="text-text-light hover:text-primary transition-colors">
                  Solutions auditives
                </Link>
              </li>
              <li>
                <Link href="/remboursements" className="text-text-light hover:text-primary transition-colors">
                  Remboursements
                </Link>
              </li>
              <li>
                <Link href="/notre-accompagnement" className="text-text-light hover:text-primary transition-colors">
                  Notre accompagnement
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-text-light hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-text-light">
              <li>📍 {addressLines[0]}</li>
              <li>
                {currentCentre?.postalCode || '4101'} {currentCentre?.city || 'Jemeppe-sur-Meuse'}
              </li>
              <li>
                📞{' '}
                <a href={`tel:${phoneLink}`} className="hover:text-primary transition-colors">
                  {phoneDisplay}
                </a>
              </li>
              {currentCentre?.phoneMobile && (
                <li>
                  📱{' '}
                  <a
                    href={`tel:${currentCentre.phoneMobile.replace(/\s/g, '')}`}
                    className="hover:text-primary transition-colors"
                  >
                    {currentCentre.phoneMobile}
                  </a>
                </li>
              )}
              <li>
                ✉️{' '}
                <a
                  href={`mailto:${email}`}
                  className="hover:text-primary transition-colors"
                >
                  {email}
                </a>
              </li>
            </ul>
          </div>

          {/* Horaires */}
          <div>
            <h3 className="font-bold text-lg mb-4">Horaires</h3>
            <ul className="space-y-2 text-sm text-text-light">{formatHours()}</ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-wrap justify-between items-center gap-4 text-sm text-text-muted">
          <p>&copy; {new Date().getFullYear()} Audire. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="hover:text-primary transition-colors">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="hover:text-primary transition-colors">
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
