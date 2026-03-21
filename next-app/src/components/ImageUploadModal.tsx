'use client';

import { useState, useEffect } from 'react';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelected: (imageUrl: string) => void;
}

export default function ImageUploadModal({ isOpen, onClose, onImageSelected }: ImageUploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // Charger les images existantes quand on ouvre le modal
  useEffect(() => {
    if (isOpen && images.length === 0) {
      loadImages();
    }
  }, [isOpen]);

  async function loadImages() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/upload');
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Créer une preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleUpload() {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onImageSelected(data.url);
        setSelectedFile(null);
        setPreviewUrl('');
        await loadImages(); // Recharger la liste
      } else {
        alert('Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">📸 Sélectionner ou uploader une image</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Upload Section */}
        <div className="mb-8 p-6 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300">
          <h3 className="font-bold text-lg mb-4">📤 Uploader une nouvelle image</h3>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="mb-4 w-full"
          />

          {previewUrl && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold">Prévisualisation :</p>
                <button
                  onClick={() => setFullscreenImage(previewUrl)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  👁️ Voir en grand
                </button>
              </div>
              <div className="w-full h-64 bg-gray-100 rounded border-2 border-gray-300 flex items-center justify-center overflow-hidden relative group cursor-pointer"
                   onClick={() => setFullscreenImage(previewUrl)}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">👁️ Voir en grand</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50"
          >
            {uploading ? '⏳ Upload en cours...' : '☁️ Uploader'}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Formats acceptés: JPEG, PNG, GIF, WebP, SVG • Max 5MB
          </p>
        </div>

        {/* Images existantes */}
        <div>
          <h3 className="font-bold text-lg mb-4">🖼️ Images existantes</h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin text-4xl mb-2">⏳</div>
              <p className="text-gray-500">Chargement...</p>
            </div>
          ) : images.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune image uploadée</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {images.map((img) => (
                <div
                  key={img.url}
                  className="group relative bg-gray-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                >
                  <button
                    onClick={() => {
                      onImageSelected(img.url);
                      onClose();
                    }}
                    className="w-full h-48 flex items-center justify-center p-2"
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </button>

                  {/* Bouton pour voir en grand */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullscreenImage(img.url);
                    }}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                    title="Voir en grand"
                  >
                    👁️
                  </button>

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="text-white font-semibold">✓ Sélectionner</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate pointer-events-none">
                    {img.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Modal de prévisualisation plein écran */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[70] p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 bg-white text-gray-800 rounded-full p-3 hover:bg-gray-100 transition-colors shadow-lg z-10 text-2xl leading-none"
          >
            ✕
          </button>
          <div className="max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={fullscreenImage}
              alt="Prévisualisation complète"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full text-sm text-gray-700 shadow-lg">
            🖱️ Cliquez n'importe où pour fermer
          </div>
        </div>
      )}
    </div>
  );
}
