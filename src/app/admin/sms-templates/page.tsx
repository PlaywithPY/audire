'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/AdminHeader';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type SMSTemplate = {
  id: number;
  templateKey: string;
  name: string;
  content: string;
  variables: string | null;
  description: string | null;
  isActive: boolean;
};

const DEFAULT_TEMPLATES = [
  {
    templateKey: 'confirmation_demande',
    name: 'Confirmation de la demande',
    description: 'Envoyé dès qu\'un client demande un rendez-vous',
    content: 'Bonjour {firstName}, nous avons bien reçu votre demande de rendez-vous chez {centre}. Nous vous confirmons votre rendez-vous le {date} à {time}. À bientôt ! Audire',
    variables: ['firstName', 'lastName', 'centre', 'date', 'time'],
  },
  {
    templateKey: 'confirmation_rdv',
    name: 'Confirmation du rendez-vous',
    description: 'Envoyé après validation par l\'administrateur',
    content: 'Bonjour {firstName} {lastName}, votre rendez-vous chez {centre} est confirmé pour le {date} à {time}. Merci de vous présenter 5 minutes avant. Audire',
    variables: ['firstName', 'lastName', 'centre', 'date', 'time', 'address'],
  },
  {
    templateKey: 'rappel_rdv',
    name: 'Rappel de rendez-vous',
    description: 'Envoyé automatiquement 1 à 3 jours avant le rendez-vous',
    content: 'Bonjour {firstName}, nous vous rappelons votre rendez-vous chez {centre} le {date} à {time}. Adresse : {address}. À très bientôt ! Audire',
    variables: ['firstName', 'lastName', 'centre', 'date', 'time', 'address', 'daysBefore'],
  },
  {
    templateKey: 'annulation_rdv',
    name: 'Annulation du rendez-vous',
    description: 'Envoyé en cas d\'annulation du rendez-vous',
    content: 'Bonjour {firstName}, votre rendez-vous du {date} à {time} chez {centre} a été annulé. Pour reprendre un nouveau rendez-vous, contactez-nous. Audire',
    variables: ['firstName', 'lastName', 'centre', 'date', 'time'],
  },
];

export default function SMSTemplatesAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<SMSTemplate>>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchTemplates();
    }
  }, [status, router]);

  async function fetchTemplates() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/sms-templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching SMS templates:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createDefaultTemplates() {
    try {
      const promises = DEFAULT_TEMPLATES.map((template) =>
        fetch('/api/admin/sms-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(template),
        })
      );

      await Promise.all(promises);
      alert('Modèles par défaut créés avec succès !');
      fetchTemplates();
    } catch (error) {
      console.error('Error creating default templates:', error);
      alert('Erreur lors de la création des modèles par défaut');
    }
  }

  async function saveTemplate() {
    try {
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/sms-templates', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Modèle enregistré avec succès !');
        setEditing(null);
        setFormData({});
        fetchTemplates();
      } else {
        alert('Erreur lors de l\'enregistrement du modèle');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Erreur lors de l\'enregistrement du modèle');
    }
  }

  async function deleteTemplate(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/sms-templates?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Modèle supprimé avec succès !');
        fetchTemplates();
      } else {
        alert('Erreur lors de la suppression du modèle');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Erreur lors de la suppression du modèle');
    }
  }

  function startEdit(template: SMSTemplate) {
    setEditing(template.id);
    setFormData({
      ...template,
      variables: template.variables ? JSON.parse(template.variables) : [],
    });
  }

  function cancelEdit() {
    setEditing(null);
    setFormData({});
  }

  function getCharacterCount(content: string): number {
    return content.length;
  }

  function getSMSCount(content: string): number {
    const length = content.length;
    if (length === 0) return 0;
    if (length <= 160) return 1;
    return Math.ceil(length / 153);
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader currentPage="sms-templates" />
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader currentPage="sms-templates" />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Modèles SMS</h1>
          {templates.length === 0 && (
            <button
              onClick={createDefaultTemplates}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold"
            >
              Créer les modèles par défaut
            </button>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 text-xl">ℹ️</div>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Variables disponibles</p>
              <p className="mb-2">
                Vous pouvez utiliser les variables suivantes dans vos messages (elles seront
                automatiquement remplacées) :
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>{'{{firstName}}'}</strong> - Prénom du client
                </li>
                <li>
                  <strong>{'{{lastName}}'}</strong> - Nom du client
                </li>
                <li>
                  <strong>{'{{centre}}'}</strong> - Nom du centre
                </li>
                <li>
                  <strong>{'{{date}}'}</strong> - Date du rendez-vous (format: 15 janvier 2024)
                </li>
                <li>
                  <strong>{'{{time}}'}</strong> - Heure du rendez-vous (format: 14h30)
                </li>
                <li>
                  <strong>{'{{address}}'}</strong> ou <strong>{'{{adresse}}'}</strong> - Adresse complète du centre
                </li>
                <li>
                  <strong>{'{{daysBefore}}'}</strong> - Nombre de jours avant le RDV (pour les
                  rappels)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Liste des modèles */}
        <div className="space-y-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              {editing === template.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Nom du modèle
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Clé du modèle (unique)
                    </label>
                    <input
                      type="text"
                      value={formData.templateKey || ''}
                      onChange={(e) => setFormData({ ...formData, templateKey: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      disabled={!!editing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Contenu du message
                    </label>
                    <textarea
                      value={formData.content || ''}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                      <span>{getCharacterCount(formData.content || '')} caractères</span>
                      <span>{getSMSCount(formData.content || '')} SMS</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`active-${template.id}`}
                      checked={formData.isActive !== false}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor={`active-${template.id}`} className="text-sm font-medium">
                      Modèle actif
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={saveTemplate}
                      className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{template.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            template.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {template.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      {template.description && (
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      )}
                      <div className="bg-gray-50 rounded-lg p-4 mb-3">
                        <p className="text-sm whitespace-pre-wrap">{template.content}</p>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Clé: {template.templateKey}</span>
                        <span>
                          {getCharacterCount(template.content)} caractères •{' '}
                          {getSMSCount(template.content)} SMS
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => startEdit(template)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-4">Aucun modèle SMS configuré</p>
            <p className="text-sm">
              Cliquez sur le bouton ci-dessus pour créer les modèles par défaut
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
