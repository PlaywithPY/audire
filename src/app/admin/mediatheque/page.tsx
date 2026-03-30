'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/AdminHeader';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type MediaFile = {
  id: string;
  url: string;
  filename: string;
  uploadedAt: string;
  size: number;
  type: string;
  usedIn: string[];
};

export default function MediathequeAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchMediaFiles();
    }
  }, [status, router]);

  async function fetchMediaFiles() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/mediatheque');
      if (res.ok) {
        const data = await res.json();
        setMediaFiles(data);
      }
    } catch (error) {
      console.error('Error fetching media files:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/admin/mediatheque', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setSelectedFile(null);
        fetchMediaFiles();
      } else {
        alert('Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) return;

    try {
      const res = await fetch(`/api/admin/mediatheque?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchMediaFiles();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Erreur lors de la suppression');
    }
  }

  function copyUrlToClipboard(url: string) {
    navigator.clipboard.writeText(url);
    alert('URL copiée dans le presse-papier');
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  const filteredFiles = mediaFiles.filter((file) =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader currentPage="mediatheque" />
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader currentPage="mediatheque" />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Médiathèque</h1>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Grille
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Liste
              </button>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Ajouter un nouveau fichier</h2>
          <div className="flex gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {uploading ? 'Upload en cours...' : 'Uploader'}
            </button>
          </div>
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600">
              Fichier sélectionné : {selectedFile.name} ({formatFileSize(selectedFile.size)})
            </p>
          )}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un fichier..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>

        {/* Media Files Display */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">
            Fichiers ({filteredFiles.length})
          </h2>

          {filteredFiles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Aucun fichier trouvé
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={file.url}
                      alt={file.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-semibold truncate mb-2">
                      {file.filename}
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      {formatFileSize(file.size)}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyUrlToClipboard(file.url)}
                        className="flex-1 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Copier URL
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={file.url}
                      alt={file.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{file.filename}</div>
                    <div className="text-sm text-gray-500">
                      {formatFileSize(file.size)} • Uploadé le{' '}
                      {new Date(file.uploadedAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => copyUrlToClipboard(file.url)}
                      className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Copier URL
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Supprimer
                    </button>
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
