'use client';

import TextsSection from './TextsSection';
import ImageEffectsSection from './ImageEffectsSection';
import FeatureCardsSection from './FeatureCardsSection';

export default function HomeSection() {
  return (
    <div className="space-y-12">
      {/* Section Textes de la page d'accueil */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 border-2 border-blue-200">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📝</span>
          <h2 className="text-2xl font-bold text-gray-900">Textes de la page d&apos;accueil</h2>
        </div>
        <p className="text-gray-700 mb-6">
          Gérez tous les textes de la page d&apos;accueil : titre hero, descriptions, chips, et section CTA.
        </p>
        <TextsSection />
      </div>

      {/* Section Images & Effets de la page d'accueil */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-8 border-2 border-purple-200">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🖼️</span>
          <h2 className="text-2xl font-bold text-gray-900">Images & Effets de la page d&apos;accueil</h2>
        </div>
        <p className="text-gray-700 mb-6">
          Ajoutez et gérez les images avec effets qui apparaissent sur la page d&apos;accueil (after-hero, after-features).
        </p>
        <ImageEffectsSection />
      </div>

      {/* Section Feature Cards de la page d'accueil */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-8 border-2 border-green-200">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🎨</span>
          <h2 className="text-2xl font-bold text-gray-900">Feature Cards de la page d&apos;accueil</h2>
        </div>
        <p className="text-gray-700 mb-6">
          Modifiez les 3 cartes principales qui apparaissent dans la section &quot;Pourquoi choisir Audire ?&quot;
        </p>
        <FeatureCardsSection />
      </div>
    </div>
  );
}
