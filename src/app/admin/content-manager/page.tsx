'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';

// Import the existing page components as sections
import FeatureCardsSection from './FeatureCardsSection';
import SolutionsSection from './SolutionsSection';
import FAQsSection from './FAQsSection';
import ImageEffectsSection from './ImageEffectsSection';
import TextsSection from './TextsSection';

type TabKey = 'feature-cards' | 'solutions' | 'faqs' | 'image-effects' | 'texts';

type Tab = {
  key: TabKey;
  label: string;
  icon: string;
};

const tabs: Tab[] = [
  { key: 'feature-cards', label: 'Feature Cards', icon: '🎨' },
  { key: 'solutions', label: 'Solutions', icon: '📋' },
  { key: 'faqs', label: 'FAQs', icon: '❓' },
  { key: 'image-effects', label: 'Images & Effets', icon: '🖼️' },
  { key: 'texts', label: 'Textes', icon: '📝' },
];

export default function ContentManager() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('feature-cards');

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/admin/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminHeader title="📦 Gestionnaire de Contenu" />

      <div className="container mx-auto px-6 py-8">
        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold mb-2 text-blue-900">
            📦 Gestionnaire de Contenu - Vue Consolidée
          </h2>
          <p className="text-sm text-blue-800">
            Cette page regroupe tous les outils de gestion de contenu en un seul endroit.
            Les pages individuelles restent accessibles via le menu "✏️ Edition" pour vérification.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? 'border-b-4 border-primary text-primary bg-blue-50'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`}
              >
                <span className="text-xl mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'feature-cards' && <FeatureCardsSection />}
            {activeTab === 'solutions' && <SolutionsSection />}
            {activeTab === 'faqs' && <FAQsSection />}
            {activeTab === 'image-effects' && <ImageEffectsSection />}
            {activeTab === 'texts' && <TextsSection />}
          </div>
        </div>
      </div>
    </div>
  );
}
