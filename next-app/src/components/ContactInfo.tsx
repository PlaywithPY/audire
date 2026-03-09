'use client';

import { useCentre } from '@/contexts/CentreContext';

export default function ContactInfo() {
  const { currentCentre, loading } = useCentre();

  if (loading || !currentCentre) {
    return (
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="bg-gray-100 animate-pulse p-8 rounded-2xl h-48"></div>
        <div className="bg-gray-100 animate-pulse p-8 rounded-2xl h-48"></div>
        <div className="bg-gray-100 animate-pulse p-8 rounded-2xl h-48"></div>
      </div>
    );
  }

  const addressLines = currentCentre.address.split('\n');
  const addressForMaps = currentCentre.address.replace(/\n/g, ' ');

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {/* Téléphone */}
      <div className="bg-bg p-8 rounded-2xl text-center hover:shadow-lg transition-all">
        <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          📞
        </div>
        <h3 className="text-xl font-bold mb-2">Téléphone</h3>
        <a
          href={`tel:${currentCentre.phoneFixe.replace(/\s/g, '')}`}
          className="text-primary text-lg font-semibold hover:underline block"
        >
          {currentCentre.phoneFixe}
        </a>
        {currentCentre.phoneMobile && (
          <a
            href={`tel:${currentCentre.phoneMobile.replace(/\s/g, '')}`}
            className="text-primary text-sm hover:underline block mt-1"
          >
            {currentCentre.phoneMobile}
          </a>
        )}
        <p className="text-text-muted text-sm mt-2">Voir nos horaires d'ouverture</p>
      </div>

      {/* Email */}
      <div className="bg-bg p-8 rounded-2xl text-center hover:shadow-lg transition-all">
        <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          ✉️
        </div>
        <h3 className="text-xl font-bold mb-2">Email</h3>
        <a
          href={`mailto:${currentCentre.email}`}
          className="text-primary text-lg font-semibold hover:underline break-all"
        >
          {currentCentre.email}
        </a>
        <p className="text-text-muted text-sm mt-2">Réponse sous 24h</p>
      </div>

      {/* Adresse */}
      <div className="bg-bg p-8 rounded-2xl text-center hover:shadow-lg transition-all">
        <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          📍
        </div>
        <h3 className="text-xl font-bold mb-2">Adresse</h3>
        <p className="text-text-light">
          {addressLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < addressLines.length - 1 && <br />}
            </span>
          ))}
        </p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressForMaps)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary text-sm hover:underline mt-2 inline-block"
        >
          Voir sur Google Maps →
        </a>
      </div>
    </div>
  );
}
