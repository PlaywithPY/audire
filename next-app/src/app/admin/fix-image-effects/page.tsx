'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type EffectIssue = {
  id: number;
  pageKey: string;
  sectionKey: string;
  imageUrl: string;
  hasIssue: boolean;
  suggestedPageKey: string | null;
  message: string;
};

export default function FixImageEffects() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    total: number;
    effects: EffectIssue[];
    issuesCount: number;
  } | null>(null);
  const [fixing, setFixing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  async function fetchData() {
    try {
      const res = await fetch('/api/admin/image-effects/fix-page-keys');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fixIssues() {
    if (!confirm('Corriger automatiquement tous les pageKeys incorrects ?')) {
      return;
    }

    setFixing(true);
    try {
      const res = await fetch('/api/admin/image-effects/fix-page-keys', {
        method: 'POST',
      });
      if (res.ok) {
        const result = await res.json();
        alert(`✅ ${result.corrected} effet(s) corrigé(s) !`);
        await fetchData();
      }
    } catch (error) {
      console.error('Error fixing issues:', error);
      alert('❌ Erreur lors de la correction');
    } finally {
      setFixing(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const hasIssues = data.issuesCount > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">🔧 Diagnostic des effets d'image</h1>
          <p className="text-gray-600">
            Détection et correction des incohérences entre pageKey et sectionKey
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl font-bold text-blue-600">{data.total}</div>
            <div className="text-sm text-gray-600 mt-1">Effets totaux</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl font-bold text-red-600">{data.issuesCount}</div>
            <div className="text-sm text-gray-600 mt-1">Problèmes détectés</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl font-bold text-green-600">
              {data.total - data.issuesCount}
            </div>
            <div className="text-sm text-gray-600 mt-1">Effets OK</div>
          </div>
        </div>

        {/* Bouton de correction */}
        {hasIssues && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-3">⚠️ Actions requises</h2>
            <p className="text-gray-700 mb-4">
              Des incohérences ont été détectées. Cliquez ci-dessous pour corriger
              automatiquement les pageKeys.
            </p>
            <button
              onClick={fixIssues}
              disabled={fixing}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50"
            >
              {fixing ? '🔄 Correction en cours...' : '🔧 Corriger automatiquement'}
            </button>
          </div>
        )}

        {/* Liste des effets */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">📋 Détails des effets</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {data.effects.map((effect) => (
              <div
                key={effect.id}
                className={`p-6 ${effect.hasIssue ? 'bg-red-50' : 'bg-white'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{effect.hasIssue ? '❌' : '✅'}</span>
                      <div>
                        <h3 className="font-bold text-lg">ID: {effect.id}</h3>
                        <p className="text-sm text-gray-600">{effect.message}</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">
                          PageKey actuel
                        </p>
                        <code
                          className={`block px-3 py-2 rounded font-mono text-sm ${
                            effect.hasIssue
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {effect.pageKey}
                        </code>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">
                          SectionKey
                        </p>
                        <code className="block px-3 py-2 rounded font-mono text-sm bg-blue-100 text-blue-800">
                          {effect.sectionKey}
                        </code>
                      </div>
                      {effect.suggestedPageKey && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1">
                            PageKey suggéré ✨
                          </p>
                          <code className="block px-3 py-2 rounded font-mono text-sm bg-green-100 text-green-800 border border-green-300">
                            {effect.suggestedPageKey}
                          </code>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Image</p>
                        <p className="text-xs text-gray-600 truncate">{effect.imageUrl}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bouton retour */}
        <div className="mt-8">
          <button
            onClick={() => router.push('/admin/image-effects')}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
          >
            ← Retour à la gestion des effets
          </button>
        </div>
      </div>
    </div>
  );
}
