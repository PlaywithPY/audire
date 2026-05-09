'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';
import ContactIconsSettings from '@/components/admin/ContactIconsSettings';

type ThemeColors = {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
};


export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingReimbursement, setSavingReimbursement] = useState(false);
  const [savingDesign, setSavingDesign] = useState(false);

  const [colors, setColors] = useState<ThemeColors>({
    primary: '#42a4ff',
    primaryLight: '#5ab3ff',
    primaryDark: '#2d87e6',
    secondary: '#EBF5FF',
  });

  const [mutuelleReimbursement, setMutuelleReimbursement] = useState<number>(0);
  const [useModernDesign, setUseModernDesign] = useState<boolean>(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  async function fetchData() {
    try {
      const colorsRes = await fetch('/api/admin/colors');
      const colorsData = await colorsRes.json();
      setColors(colorsData);

      // Charger le remboursement mutuelle
      const settingsRes = await fetch('/api/admin/settings?key=mutuelle_reimbursement');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setMutuelleReimbursement(parseFloat(settingsData.value || '0'));
      }

      // Charger le setting pour le design moderne
      const designRes = await fetch('/api/admin/settings?key=use_modern_homepage_design');
      if (designRes.ok) {
        const designData = await designRes.json();
        setUseModernDesign(designData.value === 'true' || designData.value === '1');
      }
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

  async function saveReimbursement() {
    setSavingReimbursement(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'mutuelle_reimbursement',
          value: mutuelleReimbursement.toString(),
        }),
      });
      alert('✅ Remboursement mutuelle sauvegardé !');
    } catch (error) {
      console.error('Error saving reimbursement:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSavingReimbursement(false);
    }
  }

  async function saveDesignSetting() {
    setSavingDesign(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'use_modern_homepage_design',
          value: useModernDesign ? 'true' : 'false',
        }),
      });
      alert('✅ Préférence de design sauvegardée ! Rechargez la page d\'accueil pour voir les changements.');
    } catch (error) {
      console.error('Error saving design setting:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSavingDesign(false);
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
      <AdminHeader currentPage="settings" title="⚙️ Paramètres" />

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Design de la page d'accueil */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">🎨 Design de la page d&apos;accueil</h2>
          <p className="text-gray-600 mb-4">
            Choisissez entre le design moderne (avec animations et effets visuels) ou le design classique (plus sobre et simple).
          </p>
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="design"
                checked={useModernDesign}
                onChange={() => setUseModernDesign(true)}
                className="w-5 h-5 text-primary"
              />
              <span className="font-medium">Design Moderne (avec animations)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="design"
                checked={!useModernDesign}
                onChange={() => setUseModernDesign(false)}
                className="w-5 h-5 text-primary"
              />
              <span className="font-medium">Design Classique (simple)</span>
            </label>
          </div>
          <button
            onClick={saveDesignSetting}
            disabled={savingDesign}
            className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark transition disabled:opacity-50"
          >
            {savingDesign ? 'Sauvegarde...' : '💾 Sauvegarder la préférence'}
          </button>
        </section>

        {/* Remboursement Mutuelle */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">💰 Remboursement Mutuelle</h2>
          <p className="text-gray-600 mb-4">
            Définissez le montant du remboursement de la mutuelle pour 1 appareil auditif.
            Ce montant sera affiché sur les badges des produits mis en avant.
          </p>
          <div className="max-w-md">
            <label className="block text-sm font-semibold mb-2">Montant du remboursement (€)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={mutuelleReimbursement}
              onChange={(e) => setMutuelleReimbursement(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Ex: 500"
            />
          </div>
          <button
            onClick={saveReimbursement}
            disabled={savingReimbursement}
            className="mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition disabled:opacity-50"
          >
            {savingReimbursement ? 'Sauvegarde...' : '💾 Sauvegarder le remboursement'}
          </button>
        </section>

        {/* Couleurs du thème */}
        <section className="bg-white rounded-lg shadow-md p-6">
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
          <ContactIconsSettings />

          <button
            onClick={saveColors}
            disabled={saving}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
          >
            {saving ? 'Sauvegarde...' : '💾 Sauvegarder les couleurs'}
          </button>
        </section>
      </div>
    </div>
  );
}
