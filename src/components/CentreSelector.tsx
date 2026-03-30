'use client';

import { useState } from 'react';
import { useCentre } from '@/contexts/CentreContext';
import { getUserLocation } from '@/lib/geolocation';

export default function CentreSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFindingNearest, setIsFindingNearest] = useState(false);
  const [showPostalCodeInput, setShowPostalCodeInput] = useState(false);
  const [postalCode, setPostalCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { currentCentre, allCentres, setCentre } = useCentre();

  if (!currentCentre) return null;

  const handleFindNearest = async () => {
    setIsFindingNearest(true);
    setError(null);

    try {
      // Essayer d'obtenir la géolocalisation
      const location = await getUserLocation();

      // Rechercher le centre le plus proche
      const response = await fetch(
        `/api/centres/nearest?lat=${location.latitude}&lon=${location.longitude}`
      );

      if (!response.ok) {
        throw new Error('Impossible de trouver le centre le plus proche');
      }

      const nearestCentre = await response.json();
      setCentre(nearestCentre.slug);
      setIsOpen(false);
    } catch (err) {
      // Si la géolocalisation échoue, afficher le champ code postal
      console.error('Erreur géolocalisation:', err);
      setShowPostalCodeInput(true);
      setError('Géolocalisation refusée. Veuillez entrer votre code postal.');
    } finally {
      setIsFindingNearest(false);
    }
  };

  const handleFindByPostalCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!postalCode || postalCode.length < 4) {
      setError('Veuillez entrer un code postal valide');
      return;
    }

    setIsFindingNearest(true);
    setError(null);

    try {
      const response = await fetch(`/api/centres/nearest?postalCode=${postalCode}`);

      if (!response.ok) {
        throw new Error('Impossible de trouver le centre le plus proche');
      }

      const nearestCentre = await response.json();
      setCentre(nearestCentre.slug);
      setIsOpen(false);
      setShowPostalCodeInput(false);
      setPostalCode('');
    } catch (err) {
      setError('Erreur lors de la recherche du centre le plus proche');
    } finally {
      setIsFindingNearest(false);
    }
  };

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
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Choisir un centre Audire</h2>
                <p className="text-gray-600">Trouvez le centre le plus proche de chez vous</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Bouton trouver le centre le plus proche */}
            <div className="mb-6">
              <button
                onClick={handleFindNearest}
                disabled={isFindingNearest}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isFindingNearest ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Recherche en cours...</span>
                  </>
                ) : (
                  <>
                    <span>📍</span>
                    <span>Trouver le centre le plus proche</span>
                  </>
                )}
              </button>

              {/* Afficher le message d'erreur et le champ code postal si nécessaire */}
              {showPostalCodeInput && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700 mb-3">
                    Pour trouver le centre le plus proche, veuillez entrer votre code postal :
                  </p>
                  <form onSubmit={handleFindByPostalCode} className="flex gap-2">
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="Ex: 4101"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      maxLength={4}
                      pattern="[0-9]{4}"
                    />
                    <button
                      type="submit"
                      disabled={isFindingNearest}
                      className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded-lg transition disabled:opacity-50"
                    >
                      Rechercher
                    </button>
                  </form>
                </div>
              )}

              {error && !showPostalCodeInput && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            {/* Séparateur */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">ou choisissez manuellement</span>
              </div>
            </div>

            {/* Liste des centres */}
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
