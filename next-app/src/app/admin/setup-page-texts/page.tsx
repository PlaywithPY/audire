'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';

export default function SetupPageTextsAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  if (status === 'unauthenticated') {
    router.push('/admin/login');
    return null;
  }

  async function runSetup() {
    setLoading(true);
    setLogs([]);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/setup-page-texts', {
        method: 'POST',
      });

      const data = await res.json();
      setLogs(data.logs || []);
      setSuccess(data.success);

      if (data.success) {
        setTimeout(() => {
          router.push('/admin/text-editor');
        }, 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      setLogs(['❌ Erreur lors de la configuration']);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminHeader currentPage="setup-page-texts" title="🔧 Configuration PageText" />

      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Configuration de la table PageText</h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-700">
              Cette page va créer la table <code className="bg-white px-2 py-1 rounded">PageText</code> dans votre base de données.
              <br /><br />
              Cette table est nécessaire pour l'éditeur de textes du site.
            </p>
          </div>

          {!success && (
            <button
              onClick={runSetup}
              disabled={loading}
              className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {loading ? '⏳ Configuration en cours...' : '🚀 Créer la table PageText'}
            </button>
          )}

          {logs.length > 0 && (
            <div className="bg-gray-900 text-white p-6 rounded-lg font-mono text-sm overflow-auto max-h-96">
              {logs.map((log, i) => (
                <div key={i} className="mb-1 whitespace-pre-wrap">
                  {log}
                </div>
              ))}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
              <p className="text-green-800 font-semibold">
                ✅ Configuration réussie !
              </p>
              <p className="text-sm text-green-700 mt-2">
                Redirection vers l'éditeur de textes...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
