'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Eye } from 'lucide-react';

type ImagePickerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  currentImage?: string;
};

type UploadedImage = {
  name: string;
  url: string;
  size?: number;
  uploadedAt?: string;
};

export default function ImagePicker({ isOpen, onClose, onSelect, currentImage }: ImagePickerProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>(currentImage || '');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchImages();
      setSelectedImage(currentImage || '');
    }
  }, [isOpen, currentImage]);

  async function fetchImages() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/upload');
      const data = await res.json();
      setImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        await fetchImages();
        setSelectedImage(data.url);
      } else {
        alert('❌ Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold">🖼️ Médiathèque</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Upload zone */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <label className="block">
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer bg-white">
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-12 h-12 text-blue-600" />
                <div className="text-center">
                  <p className="font-semibold text-gray-700">
                    Glissez une image ici ou cliquez pour sélectionner
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    JPEG, PNG, GIF, WebP, SVG - Max 5MB
                  </p>
                </div>
                {uploading && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-sm font-medium">Upload en cours...</span>
                  </div>
                )}
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
          </label>
        </div>

        {/* Images grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune image dans la médiathèque</p>
              <p className="text-sm text-gray-400 mt-2">Uploadez votre première image ci-dessus</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image.url}
                  className={`relative group rounded-lg overflow-hidden border-4 transition-all ${
                    selectedImage === image.url
                      ? 'border-blue-600 shadow-lg scale-105'
                      : 'border-transparent hover:border-blue-300'
                  }`}
                >
                  <div
                    onClick={() => setSelectedImage(image.url)}
                    className="aspect-square bg-gray-100 flex items-center justify-center p-2 cursor-pointer"
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  {/* Bouton pour voir en grand */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewImage(image.url);
                    }}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                    title="Voir en grand"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {selectedImage === image.url && (
                    <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center pointer-events-none">
                      <div className="bg-blue-600 text-white rounded-full p-2">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <p className="text-white text-xs truncate">{image.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedImage ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Image sélectionnée
              </span>
            ) : (
              'Sélectionnez une image'
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                if (selectedImage) {
                  onSelect(selectedImage);
                  onClose();
                }
              }}
              disabled={!selectedImage}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Utiliser cette image
            </button>
          </div>
        </div>
      </div>

      {/* Modal de prévisualisation agrandie */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 bg-white text-gray-800 rounded-full p-3 hover:bg-gray-100 transition-colors shadow-lg z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewImage}
              alt="Prévisualisation"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-700 shadow-lg">
            Cliquez n'importe où pour fermer
          </div>
        </div>
      )}
    </div>
  );
}
