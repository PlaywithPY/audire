'use client';

import { useEffect, useState } from 'react';
import { useCentre } from '@/contexts/CentreContext';
import CentreSelector from './CentreSelector';

export default function TopBanner() {
  const { currentCentre, loading } = useCentre();
  const [isOpen, setIsOpen] = useState(false);
  const [todayHours, setTodayHours] = useState<string>('');

  // Calculer les horaires et statut d'ouverture du centre actuel
  useEffect(() => {
    if (!currentCentre) return;

    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hour * 60 + minutes;

    const daySchedule = currentCentre.openingHours.find((h) => h.dayOfWeek === day);

    if (!daySchedule || !daySchedule.isOpen) {
      setIsOpen(false);
      setTodayHours('Fermé');
      return;
    }

    // Construire le texte des horaires du jour
    const periods = [];
    if (daySchedule.morningOpen && daySchedule.morningClose) {
      periods.push(`${daySchedule.morningOpen}-${daySchedule.morningClose}`);
    }
    if (daySchedule.afternoonOpen && daySchedule.afternoonClose) {
      periods.push(`${daySchedule.afternoonOpen}-${daySchedule.afternoonClose}`);
    }

    if (periods.length === 0) {
      setTodayHours('Fermé');
      setIsOpen(false);
      return;
    }

    setTodayHours(periods.join(', '));

    // Vérifier si c'est ouvert maintenant
    let open = false;
    if (daySchedule.morningOpen && daySchedule.morningClose) {
      const [moh, mom] = daySchedule.morningOpen.split(':').map(Number);
      const [mch, mcm] = daySchedule.morningClose.split(':').map(Number);
      const morningOpen = moh * 60 + mom;
      const morningClose = mch * 60 + mcm;
      if (currentTime >= morningOpen && currentTime < morningClose) {
        open = true;
      }
    }
    if (daySchedule.afternoonOpen && daySchedule.afternoonClose) {
      const [aoh, aom] = daySchedule.afternoonOpen.split(':').map(Number);
      const [ach, acm] = daySchedule.afternoonClose.split(':').map(Number);
      const afternoonOpen = aoh * 60 + aom;
      const afternoonClose = ach * 60 + acm;
      if (currentTime >= afternoonOpen && currentTime < afternoonClose) {
        open = true;
      }
    }
    setIsOpen(open);
  }, [currentCentre]);

  if (loading || !currentCentre) {
    return (
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-2 text-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <span>Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-2 text-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center md:justify-between gap-2 md:gap-4">
          {/* Sélecteur de centre */}
          <div className="flex items-center gap-3">
            <CentreSelector />
          </div>

          {/* Horaires + Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isOpen ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                }`}
              ></div>
              <span className="font-medium">
                {isOpen ? 'Ouvert' : 'Fermé'}
              </span>
            </div>
            {todayHours && (
              <>
                <span className="hidden md:inline text-white/80">•</span>
                <span className="text-white/90">
                  Aujourd'hui : {todayHours}
                </span>
              </>
            )}
          </div>

          {/* Contact */}
          <div className="flex items-center gap-4">
            <a
              href={`tel:${currentCentre.phoneFixe.replace(/\s/g, '')}`}
              className="hover:text-white/80 transition-colors flex items-center gap-1"
            >
              📞 {currentCentre.phoneFixe}
            </a>
            {currentCentre.phoneMobile && (
              <>
                <span className="hidden md:inline text-white/80">•</span>
                <a
                  href={`tel:${currentCentre.phoneMobile.replace(/\s/g, '')}`}
                  className="hover:text-white/80 transition-colors flex items-center gap-1"
                >
                  📱 {currentCentre.phoneMobile}
                </a>
              </>
            )}
            <span className="hidden md:inline text-white/80">•</span>
            <a
              href={`mailto:${currentCentre.email}`}
              className="hover:text-white/80 transition-colors flex items-center gap-1"
            >
              ✉️ {currentCentre.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
