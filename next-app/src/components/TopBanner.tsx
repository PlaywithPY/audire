'use client';

import { useEffect, useState } from 'react';

export default function TopBanner() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkIfOpen = () => {
      const now = new Date();
      const day = now.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
      const hour = now.getHours();
      const minutes = now.getMinutes();
      const currentTime = hour * 60 + minutes;

      // Horaires : Lun-Ven 9h-12h et 13h-17h
      if (day >= 1 && day <= 5) {
        const morningOpen = 9 * 60; // 9h00
        const morningClose = 12 * 60; // 12h00
        const afternoonOpen = 13 * 60; // 13h00
        const afternoonClose = 17 * 60; // 17h00

        if (
          (currentTime >= morningOpen && currentTime < morningClose) ||
          (currentTime >= afternoonOpen && currentTime < afternoonClose)
        ) {
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      } else {
        // Fermé le weekend
        setIsOpen(false);
      }
    };

    checkIfOpen();
    const interval = setInterval(checkIfOpen, 60000); // Vérifier toutes les minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-2 text-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center md:justify-between gap-2 md:gap-4">
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
            <span className="hidden md:inline text-white/80">•</span>
            <span className="text-white/90">
              Lun-Ven : 9h-12h, 13h-17h
            </span>
          </div>

          {/* Contact */}
          <div className="flex items-center gap-4">
            <a
              href="tel:+3242750666"
              className="hover:text-white/80 transition-colors flex items-center gap-1"
            >
              📞 042 75 06 66
            </a>
            <span className="hidden md:inline text-white/80">•</span>
            <a
              href="mailto:centre.audire@gmail.com"
              className="hover:text-white/80 transition-colors flex items-center gap-1"
            >
              ✉️ centre.audire@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
