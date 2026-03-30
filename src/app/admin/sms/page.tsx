'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/AdminHeader';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type SMSConfig = {
  gatewayUrl: string;
  username: string;
  password: string;
  isConfigured: boolean;
};

type SMSLog = {
  id: number;
  recipient: string;
  message: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt: string;
  error?: string;
};

export default function SMSAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [config, setConfig] = useState<SMSConfig>({
    gatewayUrl: '',
    username: '',
    password: '',
    isConfigured: false,
  });

  const [editingConfig, setEditingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchConfig();
      fetchSMSLogs();
    }
  }, [status, router]);

  async function fetchConfig() {
    try {
      const res = await fetch('/api/admin/sms/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching SMS config:', error);
    }
  }

  async function fetchSMSLogs() {
    try {
      setLoadingLogs(true);
      const res = await fetch('/api/admin/sms/logs');
      if (res.ok) {
        const data = await res.json();
        setSmsLogs(data);
      }
    } catch (error) {
      console.error('Error fetching SMS logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  }

  async function saveConfig() {
    try {
      setSavingConfig(true);
      const res = await fetch('/api/admin/sms/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        alert('Configuration SMS enregistrée avec succès');
        setEditingConfig(false);
        fetchConfig();
      } else {
        alert('Erreur lors de l\'enregistrement de la configuration');
      }
    } catch (error) {
      console.error('Error saving SMS config:', error);
      alert('Erreur lors de l\'enregistrement de la configuration');
    } finally {
      setSavingConfig(false);
    }
  }

  async function testConnection() {
    try {
      const res = await fetch('/api/admin/sms/test', {
        method: 'POST',
      });

      if (res.ok) {
        alert('Connexion au serveur SMS Gateway réussie!');
      } else {
        const data = await res.json();
        alert(`Erreur de connexion: ${data.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Error testing SMS connection:', error);
      alert('Erreur lors du test de connexion');
    }
  }

  async function sendSMS() {
    if (!recipient || !message) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    // Validation du numéro de téléphone
    const phoneRegex = /^(?:(?:\+|00)32|0)[1-9](?:[\s.-]?\d{2}){4}$/;
    if (!phoneRegex.test(recipient)) {
      alert('Veuillez entrer un numéro de téléphone belge valide');
      return;
    }

    try {
      setSending(true);
      const res = await fetch('/api/admin/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, message }),
      });

      if (res.ok) {
        alert('SMS envoyé avec succès!');
        setRecipient('');
        setMessage('');
        fetchSMSLogs();
      } else {
        const data = await res.json();
        alert(`Erreur lors de l'envoi du SMS: ${data.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      alert('Erreur lors de l\'envoi du SMS');
    } finally {
      setSending(false);
    }
  }

  function getCharacterCount(): number {
    return message.length;
  }

  function getSMSCount(): number {
    const length = message.length;
    if (length === 0) return 0;
    if (length <= 160) return 1;
    return Math.ceil(length / 153);
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader currentPage="sms" />
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader currentPage="sms" />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestion SMS</h1>
          {config.isConfigured && (
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
              <span className="text-xl">✓</span>
              <span className="font-semibold">SMS Gateway configuré</span>
            </div>
          )}
        </div>

        {/* Configuration Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Configuration SMS Gateway</h2>
            {!editingConfig && (
              <button
                onClick={() => setEditingConfig(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Modifier
              </button>
            )}
          </div>

          {editingConfig ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  URL du serveur SMS Gateway
                </label>
                <input
                  type="text"
                  value={config.gatewayUrl}
                  onChange={(e) => setConfig({ ...config, gatewayUrl: e.target.value })}
                  placeholder="https://votre-serveur-sms-gateway.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <p className="mt-1 text-sm text-gray-500">
                  URL de votre serveur SMS Gateway (depuis sms-gate.app)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Nom d'utilisateur (optionnel)
                </label>
                <input
                  type="text"
                  value={config.username}
                  onChange={(e) => setConfig({ ...config, username: e.target.value })}
                  placeholder="Nom d'utilisateur"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Mot de passe (optionnel)
                </label>
                <input
                  type="password"
                  value={config.password}
                  onChange={(e) => setConfig({ ...config, password: e.target.value })}
                  placeholder="Mot de passe"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={saveConfig}
                  disabled={savingConfig || !config.gatewayUrl}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {savingConfig ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  onClick={() => {
                    setEditingConfig(false);
                    fetchConfig();
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-1">
                  URL du serveur
                </div>
                <div className="text-lg">
                  {config.gatewayUrl || 'Non configuré'}
                </div>
              </div>

              {config.isConfigured && (
                <div className="pt-4">
                  <button
                    onClick={testConnection}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Tester la connexion
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Send SMS Section */}
        {config.isConfigured && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Envoyer un SMS</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0470 12 34 56"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Votre message ici..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>{getCharacterCount()} caractères</span>
                  <span>{getSMSCount()} SMS</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 text-xl">ℹ️</div>
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Rappel sur les SMS</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>1 SMS = 160 caractères maximum</li>
                      <li>Les SMS longs sont divisés en plusieurs parties (153 caractères/partie)</li>
                      <li>Évitez les caractères spéciaux qui comptent double</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={sendSMS}
                disabled={sending || !recipient || !message}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
              >
                {sending ? 'Envoi en cours...' : 'Envoyer le SMS'}
              </button>
            </div>
          </div>
        )}

        {/* SMS Logs Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Historique des SMS</h2>

          {loadingLogs ? (
            <div className="text-center py-8 text-gray-500">Chargement...</div>
          ) : smsLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Aucun SMS envoyé pour le moment</div>
          ) : (
            <div className="space-y-3">
              {smsLogs.map((log) => (
                <div
                  key={log.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold">{log.recipient}</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            log.status === 'sent'
                              ? 'bg-green-100 text-green-800'
                              : log.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {log.status === 'sent'
                            ? 'Envoyé'
                            : log.status === 'failed'
                            ? 'Échec'
                            : 'En attente'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{log.message}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.sentAt).toLocaleString('fr-FR')}
                      </div>
                      {log.error && (
                        <div className="mt-2 text-sm text-red-600">Erreur: {log.error}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">À propos de SMS Gateway</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              SMS Gateway permet d'envoyer des SMS directement depuis votre téléphone professionnel
              via l'application installée.
            </p>
            <p>
              <strong>Utilisations futures :</strong> Cette fonctionnalité servira à envoyer
              automatiquement des SMS de rappel aux clients pour leurs rendez-vous.
            </p>
            <p>
              Pour configurer SMS Gateway, installez l'application depuis{' '}
              <a
                href="https://sms-gate.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline"
              >
                sms-gate.app
              </a>{' '}
              sur votre téléphone professionnel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
