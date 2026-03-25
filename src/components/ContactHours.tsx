'use client';

import { useCentre } from '@/contexts/CentreContext';

const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function ContactHours() {
  const { currentCentre, loading } = useCentre();

  // Horaires par défaut pendant le chargement ou si aucun centre
  const defaultHours = [
    { jour: 'Lundi', horaires: '9h-12h, 13h-17h', isOpen: true },
    { jour: 'Mardi', horaires: '9h-12h, 13h-17h', isOpen: true },
    { jour: 'Mercredi', horaires: '9h-12h, 13h-17h', isOpen: true },
    { jour: 'Jeudi', horaires: '9h-12h, 13h-17h', isOpen: true },
    { jour: 'Vendredi', horaires: '9h-12h, 13h-17h', isOpen: true },
    { jour: 'Samedi', horaires: 'Sur rendez-vous', isOpen: true, highlight: true },
    { jour: 'Dimanche', horaires: 'Fermé', isOpen: false, closed: true },
  ];

  // Pendant le chargement
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="divide-y divide-border">
          {defaultHours.map((item) => (
            <div
              key={item.jour}
              className="flex justify-between items-center px-8 py-4 animate-pulse"
            >
              <span className="font-semibold">{item.jour}</span>
              <span className="h-4 w-32 bg-gray-200 rounded"></span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Si pas de centre ou pas d'horaires, utiliser les horaires par défaut
  if (!currentCentre?.openingHours || currentCentre.openingHours.length === 0) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="divide-y divide-border">
          {defaultHours.map((item) => (
            <div
              key={item.jour}
              className={`flex justify-between items-center px-8 py-4 ${
                item.closed ? 'bg-gray-50' : item.highlight ? 'bg-secondary' : 'hover:bg-bg'
              } transition-colors`}
            >
              <span className="font-semibold">{item.jour}</span>
              <span className={item.closed ? 'text-text-muted' : 'text-primary font-medium'}>
                {item.horaires}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Formater les horaires depuis le centre actuel
  const formattedHours = currentCentre.openingHours
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    .map((hour) => {
      const jour = daysOfWeek[hour.dayOfWeek];
      let horaires = '';
      let closed = false;
      let highlight = false;

      if (!hour.isOpen) {
        horaires = 'Fermé';
        closed = true;
      } else {
        const parts = [];
        if (hour.morningOpen && hour.morningClose) {
          parts.push(`${hour.morningOpen}-${hour.morningClose}`);
        }
        if (hour.afternoonOpen && hour.afternoonClose) {
          parts.push(`${hour.afternoonOpen}-${hour.afternoonClose}`);
        }

        if (parts.length === 0) {
          horaires = 'Sur rendez-vous';
          highlight = hour.dayOfWeek === 6; // Samedi
        } else {
          horaires = parts.join(', ');
        }
      }

      return { jour, horaires, closed, highlight };
    });

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="divide-y divide-border">
        {formattedHours.map((item) => (
          <div
            key={item.jour}
            className={`flex justify-between items-center px-8 py-4 ${
              item.closed ? 'bg-gray-50' : item.highlight ? 'bg-secondary' : 'hover:bg-bg'
            } transition-colors`}
          >
            <span className="font-semibold">{item.jour}</span>
            <span className={item.closed ? 'text-text-muted' : 'text-primary font-medium'}>
              {item.horaires}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
