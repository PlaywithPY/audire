'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';

type OpeningHour = {
  id: number;
  centreId: number;
  dayOfWeek: number;
  isOpen: boolean;
  morningOpen: string | null;
  morningClose: string | null;
  afternoonOpen: string | null;
  afternoonClose: string | null;
};

type Centre = {
  id: number;
  name: string;
  slug: string;
  phoneFixe: string;
  phoneMobile: string | null;
  email: string;
  address: string;
  postalCode: string;
  city: string;
  isActive: boolean;
  isDefault: boolean;
  latitude: number | null;
  longitude: number | null;
};

const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// Fonction pour générer un slug à partir du nom
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
    .trim()
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/-+/g, '-'); // Éviter les tirets multiples
}

export default function CentresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [centres, setCentres] = useState<Centre[]>([]);
  const [selectedCentreId, setSelectedCentreId] = useState<number | null>(null);
  const [hours, setHours] = useState<OpeningHour[]>([]);

  const [showNewCentreForm, setShowNewCentreForm] = useState(false);
  const [newCentre, setNewCentre] = useState({
    name: '',
    phoneFixe: '',
    phoneMobile: '',
    email: '',
    address: '',
    postalCode: '',
    city: '',
    isDefault: false,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchCentres();
    }
  }, [status, router]);

  async function fetchCentres() {
    try {
      const res = await fetch('/api/admin/centres');
      const data = await res.json();
      setCentres(data);

      // Sélectionner le premier centre par défaut
      if (data.length > 0 && !selectedCentreId) {
        const defaultCentre = data.find((c: Centre) => c.isDefault) || data[0];
        setSelectedCentreId(defaultCentre.id);
      }
    } catch (error) {
      console.error('Error fetching centres:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedCentreId) {
      loadCentreHours(selectedCentreId);
    }
  }, [selectedCentreId]);

  async function loadCentreHours(centreId: number) {
    try {
      const res = await fetch(`/api/admin/hours?centreId=${centreId}`);
      const data = await res.json();
      setHours(data);
    } catch (error) {
      console.error('Error loading hours:', error);
    }
  }

  async function createCentre() {
    if (!newCentre.name || !newCentre.phoneFixe || !newCentre.email || !newCentre.address || !newCentre.postalCode || !newCentre.city) {
      alert('⚠️ Tous les champs obligatoires doivent être remplis !');
      return;
    }

    setSaving(true);
    try {
      const slug = generateSlug(newCentre.name);

      const res = await fetch('/api/admin/centres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newCentre, slug }),
      });

      const createdCentre = await res.json();
      alert('✅ Centre créé !');
      setShowNewCentreForm(false);
      setNewCentre({
        name: '',
        phoneFixe: '',
        phoneMobile: '',
        email: '',
        address: '',
        postalCode: '',
        city: '',
        isDefault: false,
      });
      fetchCentres();
      setSelectedCentreId(createdCentre.id);
    } catch (error) {
      console.error('Error creating centre:', error);
      alert('❌ Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  }

  async function updateCentre(centre: Centre) {
    setSaving(true);
    try {
      await fetch('/api/admin/centres', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(centre),
      });
      alert('✅ Centre sauvegardé !');
      fetchCentres();
    } catch (error) {
      console.error('Error updating centre:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  async function deleteCentre(id: number, isDefault: boolean) {
    if (isDefault) {
      alert('❌ Impossible de supprimer le centre par défaut !');
      return;
    }

    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer ce centre ? Cette action est irréversible.')) return;

    try {
      await fetch(`/api/admin/centres?id=${id}`, {
        method: 'DELETE',
      });
      alert('✅ Centre supprimé !');
      if (selectedCentreId === id) {
        setSelectedCentreId(null);
      }
      fetchCentres();
    } catch (error) {
      console.error('Error deleting centre:', error);
      alert('❌ Erreur lors de la suppression');
    }
  }

  function updateHour(dayOfWeek: number, field: keyof OpeningHour, value: any) {
    setHours((prev) =>
      prev.map((h) =>
        h.dayOfWeek === dayOfWeek
          ? { ...h, [field]: value }
          : h
      )
    );
  }

  async function saveAllHours() {
    if (!selectedCentreId) return;

    setSaving(true);
    try {
      await Promise.all(
        hours.map((hour) =>
          fetch('/api/admin/hours', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hour),
          })
        )
      );
      alert('✅ Tous les horaires ont été sauvegardés !');
    } catch (error) {
      console.error('Error saving hours:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  const selectedCentre = centres.find((c) => c.id === selectedCentreId);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader currentPage="centres" title="📍 Gestion des centres" />

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Section: Liste des centres */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">📍 Centres Audire</h2>
            <button
              onClick={() => setShowNewCentreForm(!showNewCentreForm)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              + Nouveau centre
            </button>
          </div>

          {/* Formulaire nouveau centre */}
          {showNewCentreForm && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-bold mb-3">Créer un nouveau centre</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nom du centre *</label>
                  <input
                    type="text"
                    value={newCentre.name}
                    onChange={(e) => setNewCentre({ ...newCentre, name: e.target.value })}
                    placeholder="ex: Centre Audire Liège"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                  {newCentre.name && (
                    <p className="text-xs text-gray-500 mt-1">
                      Slug auto: <span className="font-mono">{generateSlug(newCentre.name)}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Téléphone fixe *</label>
                  <input
                    type="tel"
                    value={newCentre.phoneFixe}
                    onChange={(e) => setNewCentre({ ...newCentre, phoneFixe: e.target.value })}
                    placeholder="+32 4 123 45 67"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Téléphone mobile</label>
                  <input
                    type="tel"
                    value={newCentre.phoneMobile}
                    onChange={(e) => setNewCentre({ ...newCentre, phoneMobile: e.target.value })}
                    placeholder="+32 476 12 34 56"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email *</label>
                  <input
                    type="email"
                    value={newCentre.email}
                    onChange={(e) => setNewCentre({ ...newCentre, email: e.target.value })}
                    placeholder="centre@audire.be"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Adresse *</label>
                  <textarea
                    value={newCentre.address}
                    onChange={(e) => setNewCentre({ ...newCentre, address: e.target.value })}
                    placeholder="Rue de la Station, 4"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Code postal *</label>
                  <input
                    type="text"
                    value={newCentre.postalCode}
                    onChange={(e) => setNewCentre({ ...newCentre, postalCode: e.target.value })}
                    placeholder="4101"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Ville *</label>
                  <input
                    type="text"
                    value={newCentre.city}
                    onChange={(e) => setNewCentre({ ...newCentre, city: e.target.value })}
                    placeholder="Jemeppe-sur-Meuse"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newCentre.isDefault}
                      onChange={(e) => setNewCentre({ ...newCentre, isDefault: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span>⭐ Définir comme centre par défaut</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={createCentre}
                  disabled={saving}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                >
                  ✅ Créer
                </button>
                <button
                  onClick={() => setShowNewCentreForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Liste des centres */}
          {centres.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun centre pour le moment. Créez-en un !
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {centres.map((centre) => (
                <div
                  key={centre.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                    selectedCentreId === centre.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedCentreId(centre.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">
                        {centre.name} {centre.isDefault && '⭐'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {centre.slug}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCentre(centre.id, centre.isDefault);
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                      disabled={centre.isDefault}
                      title={centre.isDefault ? 'Impossible de supprimer le centre par défaut' : 'Supprimer'}
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📞 {centre.phoneFixe}</p>
                    <p>📧 {centre.email}</p>
                    <p>📍 {centre.city}</p>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${centre.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {centre.isActive ? '✅ Actif' : '❌ Inactif'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section: Détails du centre sélectionné */}
        {selectedCentre && (
          <>
            {/* Coordonnées */}
            <section className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">📝 Coordonnées - {selectedCentre.name}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nom du centre</label>
                  <input
                    type="text"
                    value={selectedCentre.name}
                    onChange={(e) => {
                      const updatedCentre = { ...selectedCentre, name: e.target.value };
                      setCentres(centres.map((c) => (c.id === selectedCentre.id ? updatedCentre : c)));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Téléphone fixe</label>
                  <input
                    type="tel"
                    value={selectedCentre.phoneFixe}
                    onChange={(e) => {
                      const updatedCentre = { ...selectedCentre, phoneFixe: e.target.value };
                      setCentres(centres.map((c) => (c.id === selectedCentre.id ? updatedCentre : c)));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Téléphone mobile</label>
                  <input
                    type="tel"
                    value={selectedCentre.phoneMobile || ''}
                    onChange={(e) => {
                      const updatedCentre = { ...selectedCentre, phoneMobile: e.target.value };
                      setCentres(centres.map((c) => (c.id === selectedCentre.id ? updatedCentre : c)));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={selectedCentre.email}
                    onChange={(e) => {
                      const updatedCentre = { ...selectedCentre, email: e.target.value };
                      setCentres(centres.map((c) => (c.id === selectedCentre.id ? updatedCentre : c)));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Adresse</label>
                  <textarea
                    value={selectedCentre.address}
                    onChange={(e) => {
                      const updatedCentre = { ...selectedCentre, address: e.target.value };
                      setCentres(centres.map((c) => (c.id === selectedCentre.id ? updatedCentre : c)));
                    }}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Code postal</label>
                  <input
                    type="text"
                    value={selectedCentre.postalCode}
                    onChange={(e) => {
                      const updatedCentre = { ...selectedCentre, postalCode: e.target.value };
                      setCentres(centres.map((c) => (c.id === selectedCentre.id ? updatedCentre : c)));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Ville</label>
                  <input
                    type="text"
                    value={selectedCentre.city}
                    onChange={(e) => {
                      const updatedCentre = { ...selectedCentre, city: e.target.value };
                      setCentres(centres.map((c) => (c.id === selectedCentre.id ? updatedCentre : c)));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCentre.isActive}
                      onChange={(e) => {
                        const updatedCentre = { ...selectedCentre, isActive: e.target.checked };
                        setCentres(centres.map((c) => (c.id === selectedCentre.id ? updatedCentre : c)));
                      }}
                      className="w-5 h-5"
                    />
                    <span>Actif</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCentre.isDefault}
                      onChange={(e) => {
                        const updatedCentre = { ...selectedCentre, isDefault: e.target.checked };
                        setCentres(centres.map((c) => (c.id === selectedCentre.id ? updatedCentre : c)));
                      }}
                      className="w-5 h-5"
                    />
                    <span>⭐ Centre par défaut</span>
                  </label>
                </div>
              </div>
              <button
                onClick={() => updateCentre(selectedCentre)}
                disabled={saving}
                className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
              >
                {saving ? 'Sauvegarde...' : '💾 Sauvegarder les coordonnées'}
              </button>
            </section>

            {/* Horaires d'ouverture */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">🕐 Horaires d'ouverture - {selectedCentre.name}</h2>

              {hours.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aucun horaire configuré pour ce centre.
                </p>
              ) : (
                <div className="space-y-4">
                  {daysOfWeek.map((day, index) => {
                    const hour = hours.find((h) => h.dayOfWeek === index);
                    if (!hour) return null;

                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-lg">{day}</h3>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hour.isOpen}
                              onChange={(e) => updateHour(index, 'isOpen', e.target.checked)}
                              className="w-5 h-5"
                            />
                            <span className="text-sm">Ouvert</span>
                          </label>
                        </div>

                        {hour.isOpen && (
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold mb-2">Matin</label>
                              <div className="flex gap-2">
                                <input
                                  type="time"
                                  value={hour.morningOpen || ''}
                                  onChange={(e) => updateHour(index, 'morningOpen', e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded"
                                />
                                <span className="self-center">-</span>
                                <input
                                  type="time"
                                  value={hour.morningClose || ''}
                                  onChange={(e) => updateHour(index, 'morningClose', e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-2">Après-midi</label>
                              <div className="flex gap-2">
                                <input
                                  type="time"
                                  value={hour.afternoonOpen || ''}
                                  onChange={(e) => updateHour(index, 'afternoonOpen', e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded"
                                />
                                <span className="self-center">-</span>
                                <input
                                  type="time"
                                  value={hour.afternoonClose || ''}
                                  onChange={(e) => updateHour(index, 'afternoonClose', e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {hours.length > 0 && (
                <button
                  onClick={saveAllHours}
                  disabled={saving}
                  className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {saving ? 'Sauvegarde...' : '💾 Sauvegarder tous les horaires'}
                </button>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
