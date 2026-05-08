'use client';

// Sprint 1B — section "Icônes de contact" dans la page Réglages.
// Drop-in : ce composant se monte SOUS les sections existantes.
// Il NE remplace PAS la page settings actuelle ; importez-le et ajoutez <ContactIconsSettings /> à la fin.

import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';

type IconKey = 'contact_icon_phone' | 'contact_icon_email' | 'contact_icon_address' | 'contact_icon_mobile';

const ROWS: { key: IconKey; label: string; defaultEmoji: string; suggestions: string[] }[] = [
  { key: 'contact_icon_phone',   label: 'Téléphone fixe',  defaultEmoji: '📞', suggestions: ['phone', 'phone-call', 'phone-incoming'] },
  { key: 'contact_icon_mobile',  label: 'Téléphone mobile', defaultEmoji: '📱', suggestions: ['smartphone', 'phone'] },
  { key: 'contact_icon_email',   label: 'Email',           defaultEmoji: '✉️', suggestions: ['mail', 'mail-open', 'send', 'at-sign'] },
  { key: 'contact_icon_address', label: 'Adresse',         defaultEmoji: '📍', suggestions: ['map-pin', 'map', 'navigation'] },
];

function toLucideName(name: string): string {
  return name.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}

function IconPreview({ value, size = 24 }: { value: string; size?: number }) {
  const isLucide = /^[a-zA-Z][a-zA-Z0-9-]*$/.test(value);
  if (isLucide) {
    const Comp = (Icons as any)[toLucideName(value)] as React.ComponentType<{ size?: number }> | undefined;
    if (Comp) return <Comp size={size} />;
  }
  return <span style={{ fontSize: size }}>{value || '—'}</span>;
}

export default function ContactIconsSettings() {
  const [values, setValues] = useState<Record<IconKey, string>>({
    contact_icon_phone: '📞',
    contact_icon_email: '✉️',
    contact_icon_address: '📍',
    contact_icon_mobile: '📱',
  });
  const [saving, setSaving] = useState<IconKey | null>(null);

  useEffect(() => {
    Promise.all(
      ROWS.map((r) =>
        fetch(`/api/admin/settings?key=${r.key}`)
          .then((res) => (res.ok ? res.json() : { value: null }))
          .then((d) => ({ key: r.key, value: d.value || r.defaultEmoji }))
      )
    ).then((results) => {
      const next: any = {};
      for (const r of results) next[r.key] = r.value;
      setValues((v) => ({ ...v, ...next }));
    });
  }, []);

  async function save(key: IconKey, value: string) {
    setSaving(key);
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
    } finally {
      setSaving(null);
    }
  }

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-2xl font-bold mb-2">🎯 Icônes de contact</h2>
      <p className="text-gray-600 mb-6">
        Ces icônes s'affichent sur la page Contact, dans le footer et partout où elles apparaissent. Vous pouvez taper un emoji
        (ex : <code>📞</code>) ou un nom d'icône Lucide (ex : <code>phone</code>, <code>map-pin</code>).
        Voir tous les noms : <a href="https://lucide.dev/icons/" target="_blank" rel="noopener" className="text-primary underline">lucide.dev/icons</a>
      </p>

      <div className="space-y-5">
        {ROWS.map(({ key, label, suggestions }) => (
          <div key={key} className="grid md:grid-cols-[140px_60px_1fr_auto] items-center gap-4 border-b border-gray-100 pb-5">
            <div className="font-semibold">{label}</div>
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center">
              <IconPreview value={values[key]} />
            </div>
            <div>
              <input
                type="text"
                value={values[key]}
                onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Emoji ou nom Lucide"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setValues({ ...values, [key]: s })}
                    className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full flex items-center gap-1.5"
                  >
                    <IconPreview value={s} size={14} />
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => save(key, values[key])}
              disabled={saving === key}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 whitespace-nowrap"
            >
              {saving === key ? '…' : '💾 Enregistrer'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
