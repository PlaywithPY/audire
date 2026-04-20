'use client';

import { useState, useRef, useEffect } from 'react';

interface ImagePositionEditorProps {
  imageUrl: string;
  initialPosition?: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  alt?: string;
  height?: number;
}

/**
 * Composant permettant de positionner une image en la déplaçant
 * Les valeurs x et y sont des pourcentages (0-100)
 */
export default function ImagePositionEditor({
  imageUrl,
  initialPosition = { x: 50, y: 50 },
  onPositionChange,
  alt = 'Image',
  height = 160,
}: ImagePositionEditorProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Charger les dimensions de l'image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current || !imageRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const image = imageRef.current;
    const imageRect = image.getBoundingClientRect();

    // Position de la souris relative au conteneur
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculer le décalage nécessaire pour que l'image suive la souris
    const containerWidth = rect.width;
    const containerHeight = rect.height;
    const imageWidth = imageRect.width;
    const imageHeight = imageRect.height;

    // Si l'image est plus petite que le conteneur, on centre
    if (imageWidth <= containerWidth && imageHeight <= containerHeight) {
      return;
    }

    // Calculer la nouvelle position en pourcentage
    let newX = 50;
    let newY = 50;

    if (imageWidth > containerWidth) {
      const maxOffsetX = imageWidth - containerWidth;
      const offsetX = (mouseX / containerWidth) * maxOffsetX;
      newX = (offsetX / maxOffsetX) * 100;
      newX = Math.max(0, Math.min(100, newX));
    }

    if (imageHeight > containerHeight) {
      const maxOffsetY = imageHeight - containerHeight;
      const offsetY = (mouseY / containerHeight) * maxOffsetY;
      newY = (offsetY / maxOffsetY) * 100;
      newY = Math.max(0, Math.min(100, newY));
    }

    const newPosition = { x: newX, y: newY };
    setPosition(newPosition);
    onPositionChange(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);

  const resetPosition = () => {
    const defaultPos = { x: 50, y: 50 };
    setPosition(defaultPos);
    onPositionChange(defaultPos);
  };

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <p className="text-xs text-gray-600 font-semibold">
          Prévisualisation :
          <span className="ml-2 text-gray-500">
            {isDragging ? '🖱️ Glissez pour positionner' : '👆 Cliquez et glissez'}
          </span>
        </p>
        <button
          type="button"
          onClick={resetPosition}
          className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
          title="Recentrer l'image"
        >
          ↺ Recentrer
        </button>
      </div>

      <div
        ref={containerRef}
        className={`relative overflow-hidden rounded border-2 ${
          isDragging ? 'border-blue-500 cursor-grabbing' : 'border-gray-300 cursor-grab'
        }`}
        style={{ height: `${height}px` }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt={alt}
          className="absolute w-full h-full object-cover select-none"
          style={{
            objectPosition: `${position.x}% ${position.y}%`,
          }}
          draggable={false}
        />

        {/* Indicateur de position */}
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none">
          {Math.round(position.x)}% × {Math.round(position.y)}%
        </div>
      </div>

      {/* Contrôles rapides */}
      <div className="mt-2 flex flex-wrap gap-1">
        <p className="text-xs text-gray-500 w-full mb-1">Position rapide :</p>
        <button
          type="button"
          onClick={() => { const p = { x: 50, y: 0 }; setPosition(p); onPositionChange(p); }}
          className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
        >
          ⬆️ Haut
        </button>
        <button
          type="button"
          onClick={() => { const p = { x: 50, y: 50 }; setPosition(p); onPositionChange(p); }}
          className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
        >
          ⬤ Centre
        </button>
        <button
          type="button"
          onClick={() => { const p = { x: 50, y: 100 }; setPosition(p); onPositionChange(p); }}
          className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
        >
          ⬇️ Bas
        </button>
        <button
          type="button"
          onClick={() => { const p = { x: 0, y: 50 }; setPosition(p); onPositionChange(p); }}
          className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
        >
          ⬅️ Gauche
        </button>
        <button
          type="button"
          onClick={() => { const p = { x: 100, y: 50 }; setPosition(p); onPositionChange(p); }}
          className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
        >
          ➡️ Droite
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-2 italic">
        💡 Cette position sera utilisée pour l'affichage public de l'image
      </p>
    </div>
  );
}
