'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';

type OpeningHour = {
  id: number;
  dayOfWeek: number;
  isOpen: boolean;
  morningOpen: string | null;
  morningClose: string | null;
  afternoonOpen: string | null;
  afternoonClose: string | null;
};

type Centre = {
  id: number;
  name: string;
  slug: string;
  phoneFixe: string;
  phoneMobile: string | null;
  email: string;
  address: string;
  postalCode: string;
  city: string;
  isActive: boolean;
  isDefault: boolean;
  latitude: number | null;
  longitude: number | null;
};

const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function CentresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [hours, setHours] = useState<OpeningHour[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [selectedCentreId, setSelectedCentreId] = useState<number | null>(null);
  const [centre, setCentre] = useState({
    phoneFixe: '+32 4 123 45 67',
    phoneMobile: '+32 476 12 34 56',
    email: 'centre.audire@gmail.com',
    address: 'Rue de la Station, 4\n4101 Jemeppe-sur-Meuse',
    postalCode: '4101',
    city: 'Jemeppe-sur-Meuse',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  async function fetchData() {
    try {
      const centresRes = await fetch('/api/admin/centres');
      const centresData = await centresRes.json();

      setCentres(centresData);

      // Sélectionner le centre par défaut au démarrage
      const defaultCentre = centresData.find((c: Centre) => c.isDefault);
      if (defaultCentre) {
        setSelectedCentreId(defaultCentre.id);
        await loadCentreData(defaultCentre.id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCentreData(centreId: number) {
    try {
      const centreRes = await fetch(`/api/admin/centres?id=${centreId}`);
      const centreData = await centreRes.json();

      setCentre({
        phoneFixe: centreData.phoneFixe || '+32 4 123 45 67',
        phoneMobile: centreData.phoneMobile || '+32 476 12 34 56',
        email: centreData.email || 'centre.audire@gmail.com',
        address: centreData.address || 'Rue de la Station, 4\n4101 Jemeppe-sur-Meuse',
        postalCode: centreData.postalCode || '4101',
        city: centreData.city || 'Jemeppe-sur-Meuse',
      });

      // Charger les horaires du centre sélectionné
      const hoursRes = await fetch('/api/admin/hours');
      const hoursData = await hoursRes.json();
      setHours(hoursData);
    } catch (error) {
      console.error('Error loading centre data:', error);
    }
  }

  useEffect(() => {
    if (selectedCentreId) {
      loadCentreData(selectedCentreId);
    }
  }, [selectedCentreId]);

  async function saveHours(dayOfWeek: number) {
    const hour = hours.find((h) => h.dayOfWeek === dayOfWeek);
    if (!hour) return;

    try {
      await fetch('/api/admin/hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hour),
      });
      alert('✅ Horaires sauvegardés !');
    } catch (error) {
      console.error('Error saving hours:', error);
      alert('❌ Erreur lors de la sauvegarde');
    }
  }

  async function saveAllHours() {
    setSaving(true);
    try {
      // Sauvegarder tous les jours en parallèle
      await Promise.all(
        hours.map((hour) =>
          fetch('/api/admin/hours', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hour),
          })
        )
      );
      alert('✅ Tous les horaires ont été sauvegardés !');
    } catch (error) {
      console.error('Error saving all hours:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  function updateHour(dayOfWeek: number, field: keyof OpeningHour, value: any) {
    setHours((prev) =>
      prev.map((h) =>
        h.dayOfWeek === dayOfWeek
          ? { ...h, [field]: value }
          : h
      )
    );
  }

  async function saveCentre() {
    if (!selectedCentreId) {
      alert('⚠️ Aucun centre sélectionné');
      return;
    }

    setSaving(true);
    try {
      await fetch('/api/admin/centres', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedCentreId, ...centre }),
      });
      alert('✅ Coordonnées sauvegardées !');
    } catch (error) {
      console.error('Error saving centre:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader currentPage="centres" title="🏢 Gestion des centres" />

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Sélecteur de centre */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-4">
            <label className="text-lg font-bold">Centre sélectionné :</label>
            <select
              value={selectedCentreId || ''}
              onChange={(e) => setSelectedCentreId(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded bg-white text-lg font-semibold"
            >
              {centres.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.isDefault && '⭐'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Coordonnées */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">📍 Coordonnées du centre</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Téléphone fixe</label>
              <input
                type="tel"
                value={centre.phoneFixe}
                onChange={(e) => setCentre({ ...centre, phoneFixe: e.target.value })}
                placeholder="+32 4 123 45 67"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Téléphone mobile (GSM)</label>
              <input
                type="tel"
                value={centre.phoneMobile}
                onChange={(e) => setCentre({ ...centre, phoneMobile: e.target.value })}
                placeholder="+32 476 12 34 56"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                value={centre.email}
                onChange={(e) => setCentre({ ...centre, email: e.target.value })}
                placeholder="centre.audire@gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Adresse</label>
              <textarea
                value={centre.address}
                onChange={(e) => setCentre({ ...centre, address: e.target.value })}
                placeholder="Rue de la Station, 4"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Code postal</label>
              <input
                type="text"
                value={centre.postalCode}
                onChange={(e) => setCentre({ ...centre, postalCode: e.target.value })}
                placeholder="4101"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Ville</label>
              <input
                type="text"
                value={centre.city}
                onChange={(e) => setCentre({ ...centre, city: e.target.value })}
                placeholder="Jemeppe-sur-Meuse"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <button
            onClick={saveCentre}
            disabled={saving}
            className="mt-6 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition disabled:opacity-50"
          >
            {saving ? 'Sauvegarde...' : '💾 Sauvegarder les coordonnées'}
          </button>
        </section>

        {/* Horaires d'ouverture */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">🕐 Horaires d'ouverture</h2>
            <button
              onClick={saveAllHours}
              disabled={saving}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition disabled:opacity-50"
            >
              {saving ? 'Sauvegarde...' : '💾 Sauvegarder tous les horaires'}
            </button>
          </div>
          <div className="space-y-4">
            {hours.map((hour) => (
              <div key={hour.dayOfWeek} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{daysOfWeek[hour.dayOfWeek]}</h3>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hour.isOpen}
                      onChange={(e) => updateHour(hour.dayOfWeek, 'isOpen', e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span>{hour.isOpen ? 'Ouvert' : 'Fermé'}</span>
                  </label>
                </div>

                {hour.isOpen && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold">Matin</p>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={!hour.morningOpen}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateHour(hour.dayOfWeek, 'morningOpen', null);
                                updateHour(hour.dayOfWeek, 'morningClose', null);
                              } else {
                                updateHour(hour.dayOfWeek, 'morningOpen', '09:00');
                                updateHour(hour.dayOfWeek, 'morningClose', '12:00');
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-600">Fermé</span>
                        </label>
                      </div>
                      {hour.morningOpen && (
                        <div className="flex gap-2">
                          <input
                            type="time"
                            value={hour.morningOpen}
                            onChange={(e) => updateHour(hour.dayOfWeek, 'morningOpen', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded"
                          />
                          <span className="self-center">-</span>
                          <input
                            type="time"
                            value={hour.morningClose || '12:00'}
                            onChange={(e) => updateHour(hour.dayOfWeek, 'morningClose', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded"
                          />
                        </div>
                      )}
                      {!hour.morningOpen && (
                        <p className="text-sm text-gray-500 italic">Fermé le matin</p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold">Après-midi</p>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={!hour.afternoonOpen}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateHour(hour.dayOfWeek, 'afternoonOpen', null);
                                updateHour(hour.dayOfWeek, 'afternoonClose', null);
                              } else {
                                updateHour(hour.dayOfWeek, 'afternoonOpen', '13:00');
                                updateHour(hour.dayOfWeek, 'afternoonClose', '17:00');
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-600">Fermé</span>
                        </label>
                      </div>
                      {hour.afternoonOpen && (
                        <div className="flex gap-2">
                          <input
                            type="time"
                            value={hour.afternoonOpen}
                            onChange={(e) => updateHour(hour.dayOfWeek, 'afternoonOpen', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded"
                          />
                          <span className="self-center">-</span>
                          <input
                            type="time"
                            value={hour.afternoonClose || '17:00'}
                            onChange={(e) => updateHour(hour.dayOfWeek, 'afternoonClose', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded"
                          />
                        </div>
                      )}
                      {!hour.afternoonOpen && (
                        <p className="text-sm text-gray-500 italic">Fermé l'après-midi</p>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => saveHours(hour.dayOfWeek)}
                  className="mt-3 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition text-sm"
                >
                  💾 Sauvegarder
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
