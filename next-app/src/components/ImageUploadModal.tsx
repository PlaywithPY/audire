'use client';

import { useState } from 'react';

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

  // Charger les images existantes quand on ouvre le modal
  useState(() => {
    if (isOpen && images.length === 0) {
      loadImages();
    }
  });

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
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
              <p className="text-sm font-semibold mb-2">Prévisualisation :</p>
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-48 rounded border border-gray-300"
              />
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
                <button
                  key={img.url}
                  onClick={() => {
                    onImageSelected(img.url);
                    onClose();
                  }}
                  className="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-semibold">✓ Sélectionner</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate">
                    {img.name}
                  </div>
                </button>
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
    </div>
  );
}
