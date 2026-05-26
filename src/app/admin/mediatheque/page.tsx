'use client';

// src/app/admin/mediatheque/page.tsx
// Réécrit pour utiliser /api/admin/upload (la même API que les feature cards)
// + upload direct côté client via @vercel/blob/client (bypass de la limite 4,5 Mo).

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/AdminHeader';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { uploadFile } from '@/lib/upload-client';

type MediaFile = {
  name: string;
  url: string;
  size?: number;
  uploadedAt?: string;
  type?: 'image' | 'video';
};

export default function MediathequeAdmin() {
  const { status } = useSession();
  const router = useRouter();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
    else if (status === 'authenticated') fetchMedia();
  }, [status, router]);

  async function fetchMedia() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/upload');
      if (res.ok) setMediaFiles(await res.json());
    } catch (e) {
      console.error('Error fetching media:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(file: File) {
    try {
      setUploading(true);
      await uploadFile(file);
      await fetchMedia();
    } catch (e: any) {
      console.error('Upload error:', e);
      alert('Erreur lors de l\'upload : ' + (e?.message || 'inconnu'));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(name: string) {
    if (!confirm(`Supprimer ${name} ?`)) return;
    try {
      // /api/admin/upload DELETE attend ?url= (l'URL complète du blob)
      const file = mediaFiles.find((f) => f.name === name);
      if (!file) return;
      const res = await fetch(`/api/admin/upload?url=${encodeURIComponent(file.url)}`, { method: 'DELETE' });
      if (res.ok) fetchMedia();
      else alert('Erreur lors de la suppression');
    } catch (e) {
      console.error(e);
    }
  }

  function copyUrl(url: string) {
    // Sprint 5.8 — Fix : ne pas concaténer window.location.origin si l'URL
    // est déjà absolue (Vercel Blob → https://...vercel-storage.com/...)
    // sinon on obtient une URL malformée du genre :
    //   https://audire.behttps://blob.../file.jpg → 404 → icône image cassée.
    const fullUrl = /^https?:\/\//i.test(url) ? url : (window.location.origin + url);
    navigator.clipboard.writeText(fullUrl);
    alert('URL copiée');
  }

  function formatSize(bytes?: number) {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // Mode picker (popup)
  const isPicker = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('picker');

  function handlePick(url: string) {
    if (isPicker && window.opener) {
      // Sprint 5.8 — Fix : ne pas concaténer window.location.origin si l'URL
      // est déjà absolue (Vercel Blob → https://...vercel-storage.com/...)
      // sinon le picker renvoyait une URL malformée et l'image apparaissait
      // cassée (icône image déchirée + texte alt) dans l'éditeur d'appareils.
      const fullUrl = /^https?:\/\//i.test(url) ? url : (window.location.origin + url);
      window.opener.postMessage({ type: 'media:selected', url: fullUrl }, '*');
      window.close();
    }
  }

  const filtered = mediaFiles.filter((f) => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {!isPicker && <AdminHeader currentPage="mediatheque" />}
        <div className="flex items-center justify-center h-96 text-gray-500">Chargement…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!isPicker && <AdminHeader currentPage="mediatheque" />}

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {isPicker ? 'Choisir un média' : 'Médiathèque'}
          </h1>
          {!isPicker && (
            <div className="flex gap-2">
              <button onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                Grille
              </button>
              <button onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                Liste
              </button>
            </div>
          )}
        </div>

        {/* Upload */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Ajouter un fichier</h2>
          <label className="block">
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer text-center">
              {uploading
                ? <p className="text-blue-600">Upload en cours…</p>
                : <p className="text-gray-700">Cliquez ou glissez une image / vidéo ici</p>}
            </div>
            <input
              type="file" accept="image/*,video/*" className="hidden" disabled={uploading}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
            />
          </label>
        </div>

        {/* Recherche */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <input
            type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher…"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>

        {/* Fichiers */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Fichiers ({filtered.length})</h2>

          {filtered.length === 0 ? (
            <p className="text-center py-12 text-gray-500">Aucun fichier</p>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((file) => (
                <div key={file.url}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <button
                    type="button"
                    onClick={() => isPicker ? handlePick(file.url) : copyUrl(file.url)}
                    className="block w-full relative aspect-square bg-gray-100"
                  >
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  </button>
                  <div className="p-3">
                    <div className="text-sm font-semibold truncate mb-1">{file.name}</div>
                    <div className="text-xs text-gray-500 mb-3">{formatSize(file.size)}</div>
                    <div className="flex gap-2">
                      {isPicker ? (
                        <button onClick={() => handlePick(file.url)}
                          className="flex-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                          Choisir
                        </button>
                      ) : (
                        <>
                          <button onClick={() => copyUrl(file.url)}
                            className="flex-1 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
                            Copier URL
                          </button>
                          <button onClick={() => handleDelete(file.name)}
                            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">
                            Suppr.
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((file) => (
                <div key={file.url} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden shrink-0">
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{file.name}</div>
                    <div className="text-sm text-gray-500">{formatSize(file.size)}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {isPicker ? (
                      <button onClick={() => handlePick(file.url)}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                        Choisir
                      </button>
                    ) : (
                      <>
                        <button onClick={() => copyUrl(file.url)}
                          className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                          Copier URL
                        </button>
                        <button onClick={() => handleDelete(file.name)}
                          className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
