'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type ThemeColors = {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
};

type OpeningHour = {
  id: number;
  dayOfWeek: number;
  isOpen: boolean;
  morningOpen: string | null;
  morningClose: string | null;
  afternoonOpen: string | null;
  afternoonClose: string | null;
};

const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function AdminDashboard() {
  const [colors, setColors] = useState<ThemeColors>({
    primary: '#42a4ff',
    primaryLight: '#5ab3ff',
    primaryDark: '#2d87e6',
    secondary: '#EBF5FF',
  });
  const [hours, setHours] = useState<OpeningHour[]>([]);
  const [phones, setPhones] = useState({
    phone_fixe: '+32 4 123 45 67',
    phone_mobile: '+32 476 12 34 56',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [colorsRes, hoursRes, settingsRes] = await Promise.all([
        fetch('/api/admin/colors'),
        fetch('/api/admin/hours'),
        fetch('/api/admin/settings'),
      ]);

      const colorsData = await colorsRes.json();
      const hoursData = await hoursRes.json();
      const settingsData = await settingsRes.json();

      setColors(colorsData);
      setHours(hoursData);
      setPhones({
        phone_fixe: settingsData.phone_fixe || '+32 4 123 45 67',
        phone_mobile: settingsData.phone_mobile || '+32 476 12 34 56',
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveColors() {
    setSaving(true);
    try {
      await fetch('/api/admin/colors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(colors),
      });
      alert('✅ Couleurs sauvegardées !');
    } catch (error) {
      console.error('Error saving colors:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

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

  function updateHour(dayOfWeek: number, field: keyof OpeningHour, value: any) {
    setHours((prev) =>
      prev.map((h) =>
        h.dayOfWeek === dayOfWeek
          ? { ...h, [field]: value }
          : h
      )
    );
  }

  async function savePhone(key: 'phone_fixe' | 'phone_mobile') {
    setSaving(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: phones[key] }),
      });
      alert('✅ Numéro sauvegardé !');
    } catch (error) {
      console.error('Error saving phone:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🛠️ Dashboard Admin - Audire</h1>
          <Link
            href="/"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            ← Retour au site
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Navigation rapide */}
        <section className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 mb-8 text-white">
          <h2 className="text-xl font-bold mb-4">🚀 Actions rapides</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/admin/content"
              className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg p-4 transition text-center"
            >
              <div className="text-3xl mb-2">🖊️</div>
              <div className="font-semibold">Éditeur de contenu</div>
              <div className="text-sm text-white/80">Modifier textes et blocs</div>
            </Link>
            <div className="bg-white/10 rounded-lg p-4 text-center opacity-50">
              <div className="text-3xl mb-2">🎨</div>
              <div className="font-semibold">Builder visuel</div>
              <div className="text-sm text-white/80">Bientôt disponible</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center opacity-50">
              <div className="text-3xl mb-2">📊</div>
              <div className="font-semibold">Analytics</div>
              <div className="text-sm text-white/80">Bientôt disponible</div>
            </div>
          </div>
        </section>

        {/* Couleurs du thème */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">🎨 Couleurs du thème</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Couleur primaire</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={colors.primary}
                  onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                  className="h-10 w-20 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.primary}
                  onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Couleur primaire claire</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={colors.primaryLight}
                  onChange={(e) => setColors({ ...colors, primaryLight: e.target.value })}
                  className="h-10 w-20 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.primaryLight}
                  onChange={(e) => setColors({ ...colors, primaryLight: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Couleur primaire foncée</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={colors.primaryDark}
                  onChange={(e) => setColors({ ...colors, primaryDark: e.target.value })}
                  className="h-10 w-20 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.primaryDark}
                  onChange={(e) => setColors({ ...colors, primaryDark: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Couleur secondaire</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={colors.secondary}
                  onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                  className="h-10 w-20 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.secondary}
                  onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          <button
            onClick={saveColors}
            disabled={saving}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
          >
            {saving ? 'Sauvegarde...' : '💾 Sauvegarder les couleurs'}
          </button>
        </section>

        {/* Numéros de téléphone */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">📞 Numéros de téléphone</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Téléphone fixe</label>
              <input
                type="tel"
                value={phones.phone_fixe}
                onChange={(e) => setPhones({ ...phones, phone_fixe: e.target.value })}
                placeholder="+32 4 123 45 67"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <button
                onClick={() => savePhone('phone_fixe')}
                disabled={saving}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition disabled:opacity-50 text-sm"
              >
                💾 Sauvegarder
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Téléphone mobile (GSM)</label>
              <input
                type="tel"
                value={phones.phone_mobile}
                onChange={(e) => setPhones({ ...phones, phone_mobile: e.target.value })}
                placeholder="+32 476 12 34 56"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <button
                onClick={() => savePhone('phone_mobile')}
                disabled={saving}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition disabled:opacity-50 text-sm"
              >
                💾 Sauvegarder
              </button>
            </div>
          </div>
        </section>

        {/* Horaires d'ouverture */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">🕐 Horaires d'ouverture</h2>
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

        {/* Informations */}
        <section className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold mb-2">📌 Notes importantes</h3>
          <ul className="text-sm space-y-2 text-gray-700">
            <li>• Les couleurs seront appliquées sur tout le site après sauvegarde</li>
            <li>• Les horaires modifient le bandeau en haut et le badge ouvert/fermé</li>
            <li>• Le système d'images pour les cards sera disponible prochainement</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
