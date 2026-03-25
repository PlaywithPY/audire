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

type TestDbResult = {
  success: boolean;
  error: string | null;
  logs: string[];
  databaseUrl: string;
};

type DbSetupResult = {
  success: boolean;
  error?: string;
  logs: string[];
};

export default function DatabaseAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PopulateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testDbLoading, setTestDbLoading] = useState(false);
  const [testDbResult, setTestDbResult] = useState<TestDbResult | null>(null);
  const [dbSetupLoading, setDbSetupLoading] = useState(false);
  const [dbSetupResult, setDbSetupResult] = useState<DbSetupResult | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  async function handleDbSetup() {
    if (!confirm('⚠️ ATTENTION ⚠️\n\nCette action va:\n1. Appliquer toutes les migrations Prisma (prisma migrate deploy)\n2. Peupler la base de données (prisma/seed.ts)\n\nVoulez-vous continuer ?')) {
      return;
    }

    setDbSetupLoading(true);
    setDbSetupResult(null);

    try {
      const res = await fetch('/api/admin/db-setup', {
        method: 'POST',
      });

      const data = await res.json();
      setDbSetupResult(data);
    } catch (err) {
      setDbSetupResult({
        success: false,
        error: err instanceof Error ? err.message : 'Erreur inconnue',
        logs: [`❌ Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`],
      });
    } finally {
      setDbSetupLoading(false);
    }
  }

  async function handleTestDbConnection() {
    setTestDbLoading(true);
    setTestDbResult(null);

    try {
      const res = await fetch('/api/admin/test-db');
      const data = await res.json();

      setTestDbResult(data);
    } catch (err) {
      setTestDbResult({
        success: false,
        error: err instanceof Error ? err.message : 'Erreur inconnue',
        logs: [`❌ Erreur de connexion: ${err instanceof Error ? err.message : 'Erreur inconnue'}`],
        databaseUrl: 'Non disponible',
      });
    } finally {
      setTestDbLoading(false);
    }
  }

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

        {/* Section Configuration Complète DB */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 border-2 border-purple-200">
          <h2 className="text-2xl font-bold mb-4">🚀 Configuration Complète de la Base de Données</h2>
          <p className="text-gray-600 mb-6">
            Cette action exécute automatiquement toutes les étapes nécessaires pour configurer votre base de données :
            <br />
            <strong className="block mt-2">1.</strong> Application des migrations Prisma (<code className="bg-gray-100 px-2 py-1 rounded text-sm">prisma migrate deploy</code>)
            <br />
            <strong className="block mt-2">2.</strong> Peuplement initial de la base (<code className="bg-gray-100 px-2 py-1 rounded text-sm">npx tsx prisma/seed.ts</code>)
            <br />
            <br />
            <span className="text-purple-700 font-semibold">💡 Utilisez ceci pour initialiser une nouvelle base de données PostgreSQL (Neon, Vercel, etc.)</span>
          </p>

          <button
            onClick={handleDbSetup}
            disabled={dbSetupLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-4 shadow-lg"
          >
            {dbSetupLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Configuration en cours... (cela peut prendre jusqu'à 2 minutes)
              </span>
            ) : (
              '🔧 Exécuter la Configuration Complète (Migrations + Seed)'
            )}
          </button>

          {/* Résultats du setup */}
          {dbSetupResult && (
            <div className={`border rounded-lg p-6 ${dbSetupResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className={`text-lg font-bold mb-4 ${dbSetupResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {dbSetupResult.success ? '✅ Configuration réussie !' : '❌ Erreur lors de la configuration'}
              </h3>

              {dbSetupResult.error && (
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="font-bold text-red-700">Erreur :</p>
                  <p className="text-red-600">{dbSetupResult.error}</p>
                </div>
              )}

              <div className="bg-white rounded-lg p-4">
                <h4 className="font-bold mb-2">📋 Logs détaillés :</h4>
                <pre className="text-xs bg-gray-50 p-4 rounded overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap">
                  {dbSetupResult.logs.join('\n')}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Section Test de connexion */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">🔌 Test de Connexion à la Base de Données</h2>
          <p className="text-gray-600 mb-6">
            Testez la connexion à la base de données et vérifiez que les tables existent.
            Utilisez ce test avant de peupler la base pour diagnostiquer les problèmes potentiels.
          </p>

          <button
            onClick={handleTestDbConnection}
            disabled={testDbLoading}
            className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-4"
          >
            {testDbLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Test en cours...
              </span>
            ) : (
              '🔍 Tester la connexion à la DB'
            )}
          </button>

          {/* Résultats du test de connexion */}
          {testDbResult && (
            <div className={`border rounded-lg p-6 ${testDbResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className={`text-lg font-bold mb-4 ${testDbResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {testDbResult.success ? '✅ Connexion réussie' : '❌ Problème de connexion'}
              </h3>

              {testDbResult.error && (
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="font-bold text-red-700">Erreur principale :</p>
                  <p className="text-red-600">{testDbResult.error}</p>
                </div>
              )}

              <div className="bg-white rounded-lg p-4">
                <h4 className="font-bold mb-2">📋 Diagnostic détaillé :</h4>
                <pre className="text-xs bg-gray-50 p-4 rounded overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap">
                  {testDbResult.logs.join('\n')}
                </pre>
              </div>

              {!testDbResult.success && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-bold text-yellow-800 mb-2">💡 Suggestions :</p>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Vérifiez que DATABASE_URL est correctement configurée dans .env ou .env.local</li>
                    <li>• Si vous utilisez PostgreSQL, vérifiez que le serveur est accessible</li>
                    <li>• Exécutez les migrations Prisma : <code className="bg-yellow-100 px-1 rounded">npx prisma migrate deploy</code></li>
                    <li>• Si la table PageText n'existe pas, vous devez d'abord créer le schéma de base</li>
                  </ul>
                </div>
              )}
            </div>
          )}
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
