'use client';

// Sprint 1B — section "Icônes de contact" dans la page Réglages.
// Trois modes par icône : image uploadée (Vercel Blob) / nom Lucide / emoji.

import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { upload } from '@vercel/blob/client';

type IconKey = 'contact_icon_phone' | 'contact_icon_email' | 'contact_icon_address' | 'contact_icon_mobile';

const ROWS: { key: IconKey; label: string; defaultEmoji: string; suggestions: string[] }[] = [
  { key: 'contact_icon_phone',   label: 'Téléphone fixe',   defaultEmoji: '📞', suggestions: ['phone', 'phone-call', 'phone-incoming'] },
  { key: 'contact_icon_mobile',  label: 'Téléphone mobile', defaultEmoji: '📱', suggestions: ['smartphone', 'phone'] },
  { key: 'contact_icon_email',   label: 'Email',            defaultEmoji: '✉️', suggestions: ['mail', 'mail-open', 'send', 'at-sign'] },
  { key: 'contact_icon_address', label: 'Adresse',          defaultEmoji: '📍', suggestions: ['map-pin', 'map', 'navigation'] },
];

function toLucideName(name: string): string {
  return name.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}

function isImageValue(value: string): boolean {
  if (!value) return false;
  if (/^(https?:\/\/|\/|data:image\/|blob:)/i.test(value)) return true;
  if (/\.(png|jpe?g|svg|gif|webp|avif)(\?.*)?$/i.test(value)) return true;
  return false;
}

function IconPreview({ value, size = 24 }: { value: string; size?: number }) {
  if (isImageValue(value)) {
    return (
      <img
        src={value}
        alt=""
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
    );
  }
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
  const [uploading, setUploading] = useState<IconKey | null>(null);

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

  async function uploadImage(key: IconKey, file: File) {
    setUploading(key);
    try {
      // Upload direct au Blob via @vercel/blob/client : le navigateur appelle
      // /api/admin/upload juste pour récupérer un token signé, puis envoie
      // directement au blob (bypass de la limite 4,5 Mo des routes serverless).
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/admin/upload',
      });
      setValues((v) => ({ ...v, [key]: blob.url }));
      await save(key, blob.url);
    } catch (e: any) {
      console.error('Upload icon failed:', e);
      alert(`Échec de l'upload : ${e?.message || 'erreur inconnue'}`);
    } finally {
      setUploading(null);
    }
  }

  function resetToEmoji(key: IconKey) {
    const row = ROWS.find((r) => r.key === key)!;
    setValues((v) => ({ ...v, [key]: row.defaultEmoji }));
  }

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-2xl font-bold mb-2">🎯 Icônes de contact</h2>
      <p className="text-gray-600 mb-6">
        Trois manières de définir une icône :
        <br />
        <strong>1.</strong> Uploadez votre propre image (PNG, SVG, JPG…) avec le bouton 📁.
        <br />
        <strong>2.</strong> Tapez un nom d'icône Lucide (ex : <code>phone</code>, <code>map-pin</code>) — voir{' '}
        <a href="https://lucide.dev/icons/" target="_blank" rel="noopener" className="text-primary underline">
          lucide.dev/icons
        </a>.
        <br />
        <strong>3.</strong> Tapez un emoji (ex : <code>📞</code>).
      </p>

      <div className="space-y-5">
        {ROWS.map(({ key, label, suggestions }) => {
          const isImage = isImageValue(values[key]);
          return (
            <div
              key={key}
              className="grid md:grid-cols-[140px_60px_1fr_auto] items-start gap-4 border-b border-gray-100 pb-5"
            >
              <div className="font-semibold pt-3">{label}</div>

              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mt-1">
                <IconPreview value={values[key]} />
              </div>

              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={values[key]}
                    onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm"
                    placeholder="Emoji, nom Lucide, ou URL d'image"
                  />
                  <label
                    className={`cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm whitespace-nowrap flex items-center gap-1.5 ${
                      uploading === key ? 'opacity-50 pointer-events-none' : ''
                    }`}
                    title="Uploader une image"
                  >
                    {uploading === key ? '⏳' : '📁'}
                    <span className="hidden sm:inline">Image</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadImage(key, f);
                        e.currentTarget.value = '';
                      }}
                    />
                  </label>
                </div>

                {isImage ? (
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <span>🖼️ Image uploadée</span>
                    <button
                      type="button"
                      onClick={() => resetToEmoji(key)}
                      className="text-red-600 hover:underline"
                    >
                      Retirer l'image
                    </button>
                  </div>
                ) : (
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
                )}
              </div>

              <button
                onClick={() => save(key, values[key])}
                disabled={saving === key || uploading === key}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 whitespace-nowrap mt-1"
              >
                {saving === key ? '…' : '💾 Enregistrer'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
