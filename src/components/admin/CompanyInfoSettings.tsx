'use client';

// src/components/admin/CompanyInfoSettings.tsx
// Sprint 4 — section "Données entreprise" intégrée à la page settings.
// Sauvegarde par champ via /api/admin/settings (clé `company.<field>`).

import { useEffect, useState } from 'react';
import { Building2, Save, Check } from 'lucide-react';
import { COMPANY_DEFAULT, COMPANY_KEYS, COMPANY_LABELS, type CompanyInfo, fetchCompanyInfo } from '@/lib/company-info';

const TEXTAREA_FIELDS = new Set<keyof CompanyInfo>(['hostingAddress']);
const HALF_WIDTH = new Set<keyof CompanyInfo>(['postalCode', 'city', 'country', 'phone', 'email', 'bce', 'inami']);

export default function CompanyInfoSettings() {
  const [info, setInfo] = useState<CompanyInfo>(COMPANY_DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    fetchCompanyInfo().then((d) => { setInfo(d); setLoading(false); });
  }, []);

  function set<K extends keyof CompanyInfo>(k: K, v: string) {
    setInfo((prev) => ({ ...prev, [k]: v }));
  }

  async function saveAll() {
    setSaving(true);
    try {
      await Promise.all(COMPANY_KEYS.map((k) =>
        fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: `company.${k}`, value: info[k] || '' }),
        })
      ));
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2200);
    } catch (e) {
      console.error(e); alert('❌ Erreur lors de la sauvegarde');
    } finally { setSaving(false); }
  }

  if (loading) {
    return (
      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Building2 className="w-6 h-6" /> Données entreprise</h2>
        <p className="text-sm text-gray-400">Chargement…</p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-1"><Building2 className="w-6 h-6" /> Données entreprise</h2>
          <p className="text-gray-600 text-sm">
            Ces informations sont automatiquement utilisées dans les pages <em>Mentions légales</em> et <em>Politique de confidentialité</em>.
            Pas besoin de retaper l'adresse à chaque endroit du site.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COMPANY_KEYS.map((k) => {
          const isLong = TEXTAREA_FIELDS.has(k);
          const colSpan = (isLong || k === 'address' || k === 'legalName' || k === 'tradeName' || k === 'manager' || k === 'hostingProvider')
            && !HALF_WIDTH.has(k) ? 'md:col-span-2' : '';
          return (
            <div key={k} className={colSpan}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{COMPANY_LABELS[k]}</label>
              {isLong ? (
                <textarea value={info[k]} onChange={(e) => set(k, e.target.value)} rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm resize-y" />
              ) : (
                <input type="text" value={info[k]} onChange={(e) => set(k, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button onClick={saveAll} disabled={saving}
          className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-dark transition disabled:opacity-50 flex items-center gap-2 font-medium">
          {saving ? 'Sauvegarde…' : <><Save className="w-4 h-4" /> Sauvegarder</>}
        </button>
        {savedFlash && (
          <span className="text-green-600 text-sm flex items-center gap-1.5"><Check className="w-4 h-4" /> Enregistré</span>
        )}
      </div>
    </section>
  );
}
