'use client';

import { useEffect, useState } from 'react';

export default function ContactInfo() {
  const [settings, setSettings] = useState({
    phone_fixe: '042 75 06 66',
    phone_mobile: '',
    email: 'centre.audire@gmail.com',
    address: 'Rue de la Station, 4\n4101 Jemeppe-sur-Meuse',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        setSettings({
          phone_fixe: data.phone_fixe || '042 75 06 66',
          phone_mobile: data.phone_mobile || '',
          email: data.email || 'centre.audire@gmail.com',
          address: data.address || 'Rue de la Station, 4\n4101 Jemeppe-sur-Meuse',
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading settings:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="bg-gray-100 animate-pulse p-8 rounded-2xl h-48"></div>
        <div className="bg-gray-100 animate-pulse p-8 rounded-2xl h-48"></div>
        <div className="bg-gray-100 animate-pulse p-8 rounded-2xl h-48"></div>
      </div>
    );
  }

  const addressLines = settings.address.split('\n');
  const addressForMaps = settings.address.replace(/\n/g, ' ');

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {/* Téléphone */}
      <div className="bg-bg p-8 rounded-2xl text-center hover:shadow-lg transition-all">
        <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          📞
        </div>
        <h3 className="text-xl font-bold mb-2">Téléphone</h3>
        {settings.phone_fixe && (
          <a
            href={`tel:${settings.phone_fixe.replace(/\s/g, '')}`}
            className="text-primary text-lg font-semibold hover:underline block"
          >
            {settings.phone_fixe}
          </a>
        )}
        {settings.phone_mobile && (
          <a
            href={`tel:${settings.phone_mobile.replace(/\s/g, '')}`}
            className="text-primary text-sm hover:underline block mt-1"
          >
            {settings.phone_mobile}
          </a>
        )}
        <p className="text-text-muted text-sm mt-2">Lun - Ven : 9h-17h</p>
      </div>

      {/* Email */}
      <div className="bg-bg p-8 rounded-2xl text-center hover:shadow-lg transition-all">
        <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          ✉️
        </div>
        <h3 className="text-xl font-bold mb-2">Email</h3>
        <a
          href={`mailto:${settings.email}`}
          className="text-primary text-lg font-semibold hover:underline break-all"
        >
          {settings.email}
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
