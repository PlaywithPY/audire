'use client';

import { useState } from 'react';
import { useCentre } from '@/contexts/CentreContext';

export default function CentreSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentCentre, allCentres, setCentre } = useCentre();

  if (!currentCentre) return null;

  return (
    <>
      {/* Bouton pour ouvrir le sélecteur */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition"
      >
        <span>📍</span>
        <span>{currentCentre.name}</span>
        {allCentres.length > 1 && <span className="text-xs opacity-75">▼</span>}
      </button>

      {/* Modal de sélection */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Choisir un centre Audire</h2>
                <p className="text-gray-600">Sélectionnez le centre le plus proche de chez vous</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {allCentres.map((centre) => (
                <button
                  key={centre.id}
                  onClick={() => {
                    setCentre(centre.slug);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition ${
                    currentCentre.id === centre.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">📍</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{centre.name}</h3>
                      <p className="text-sm text-gray-600 mb-2 whitespace-pre-line">{centre.address}</p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="text-gray-600">
                          📞 {centre.phoneFixe}
                        </span>
                        {centre.phoneMobile && (
                          <span className="text-gray-600">
                            📱 {centre.phoneMobile}
                          </span>
                        )}
                      </div>
                    </div>
                    {currentCentre.id === centre.id && (
                      <div className="text-primary font-semibold">✓</div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                💡 Astuce : Les horaires, numéros de téléphone et informations de contact
                s'adaptent automatiquement au centre sélectionné.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
