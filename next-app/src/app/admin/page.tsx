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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [colorsRes, hoursRes] = await Promise.all([
        fetch('/api/admin/colors'),
        fetch('/api/admin/hours'),
      ]);

      const colorsData = await colorsRes.json();
      const hoursData = await hoursRes.json();

      setColors(colorsData);
      setHours(hoursData);
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
                      <p className="text-sm font-semibold mb-2">Matin</p>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={hour.morningOpen || '09:00'}
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
                    </div>

                    <div>
                      <p className="text-sm font-semibold mb-2">Après-midi</p>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={hour.afternoonOpen || '13:00'}
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
