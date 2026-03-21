'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';

type PopulateResult = {
  success: boolean;
  created: number;
  skipped: number;
  total: number;
  logs: string[];
};

export default function DatabaseAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PopulateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  async function handlePopulateTexts() {
    if (!confirm('Voulez-vous vraiment peupler la base de données avec les textes des pages ?\n\nCeci créera les textes manquants mais ne modifiera pas les textes existants.')) {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/admin/populate-texts', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du peuplement');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-text-light">Chargement...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminHeader currentPage="database" title="🗄️ Gestion de la Base de Données" />

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold mb-2">ℹ️ À propos</h2>
          <p className="text-sm text-gray-700">
            Cette page vous permet de gérer la base de données sans avoir besoin d'accéder à Vercel CLI ou au serveur directement.
          </p>
        </div>

        {/* Section Populate Texts */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">📝 Peupler les Textes des Pages</h2>
          <p className="text-gray-600 mb-6">
            Cette action va créer tous les textes définis dans <code className="bg-gray-100 px-2 py-1 rounded text-sm">PAGE_DEFINITIONS.ts</code> dans la base de données.
            <br />
            <strong>Note :</strong> Les textes existants ne seront pas modifiés, seuls les textes manquants seront créés.
          </p>

          <button
            onClick={handlePopulateTexts}
            disabled={loading}
            className="w-full bg-primary text-white px-6 py-4 rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Peuplement en cours...
              </span>
            ) : (
              '▶️ Exécuter le peuplement (npx tsx scripts/populate-page-texts.ts)'
            )}
          </button>
        </div>

        {/* Résultats */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-red-800 mb-2">❌ Erreur</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-green-800 mb-4">✅ Peuplement réussi !</h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{result.created}</div>
                <div className="text-sm text-gray-600">Créés</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-gray-600">{result.skipped}</div>
                <div className="text-sm text-gray-600">Ignorés</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{result.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-bold mb-2">📋 Logs détaillés :</h4>
              <pre className="text-xs bg-gray-50 p-4 rounded overflow-x-auto max-h-96 overflow-y-auto">
                {result.logs.join('\n')}
              </pre>
            </div>
          </div>
        )}

        {/* Avertissement */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-yellow-800 mb-2">⚠️ Important</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Cette action nécessite une connexion à la base de données</li>
            <li>• En production, assurez-vous d'avoir configuré DATABASE_URL dans les variables d'environnement Vercel</li>
            <li>• Les textes existants ne seront jamais écrasés</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
