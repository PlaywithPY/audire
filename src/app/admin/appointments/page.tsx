'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/AdminHeader';

interface TimeSlot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
}

interface Centre {
  id: number;
  name: string;
  city: string;
}

interface Appointment {
  id: number;
  civilite: string | null;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  email: string | null;
  appointmentType: string;
  message: string | null;
  status: string;
  createdAt: string;
  centre: Centre;
  timeSlot: TimeSlot;
}

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCentre, setFilterCentre] = useState<string>('all');

  useEffect(() => {
    loadCentres();
    loadAppointments();
  }, []);

  async function loadCentres() {
    try {
      const res = await fetch('/api/centres');
      if (res.ok) {
        const data = await res.json();
        setCentres(data);
      }
    } catch (error) {
      console.error('Error loading centres:', error);
    }
  }

  async function loadAppointments() {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/appointments');
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      } else {
        alert('Erreur lors du chargement des rendez-vous');
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      alert('Erreur lors du chargement des rendez-vous');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(appointmentId: number, newStatus: string) {
    if (!confirm(`Changer le statut à "${newStatus}" ?`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appointmentId, status: newStatus }),
      });

      if (res.ok) {
        alert('Statut mis à jour avec succès');
        loadAppointments();
      } else {
        alert('Erreur lors de la mise à jour du statut');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  }

  async function handleDelete(appointmentId: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/appointments?id=${appointmentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Rendez-vous supprimé avec succès');
        loadAppointments();
      } else {
        alert('Erreur lors de la suppression du rendez-vous');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Erreur lors de la suppression du rendez-vous');
    }
  }

  async function handleCancelAndDelete(appointmentId: number) {
    if (!confirm('Êtes-vous sûr de vouloir annuler et supprimer ce rendez-vous ? Le créneau sera libéré et l\'événement sera retiré du calendrier Google.')) {
      return;
    }

    try {
      // D'abord annuler pour libérer le créneau et supprimer du calendrier Google
      const cancelRes = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appointmentId, status: 'cancelled' }),
      });

      if (!cancelRes.ok) {
        alert('Erreur lors de l\'annulation du rendez-vous');
        return;
      }

      // Ensuite supprimer de la base de données
      const deleteRes = await fetch(`/api/admin/appointments?id=${appointmentId}`, {
        method: 'DELETE',
      });

      if (deleteRes.ok) {
        alert('Rendez-vous annulé et supprimé avec succès');
        loadAppointments();
      } else {
        alert('Le rendez-vous a été annulé mais n\'a pas pu être supprimé');
        loadAppointments();
      }
    } catch (error) {
      console.error('Error cancelling and deleting appointment:', error);
      alert('Erreur lors de l\'annulation et suppression du rendez-vous');
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-BE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('fr-BE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getCiviliteDisplay(civilite: string | null): string {
    if (!civilite) return '';
    if (civilite === 'monsieur') return 'Monsieur';
    if (civilite === 'madame') return 'Madame';
    if (civilite === 'autre') return '';
    return '';
  }

  function getAppointmentTypeDisplay(type: string): string {
    switch (type) {
      case 'premier-contact':
        return 'Premier contact';
      case 'premier-rdv':
        return 'Premier RDV';
      case 'reglage':
        return 'Réglage';
      default:
        return type;
    }
  }

  function getStatusBadge(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusDisplay(status: string): string {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'confirmed':
        return 'Confirmé';
      case 'cancelled':
        return 'Annulé';
      case 'completed':
        return 'Terminé';
      default:
        return status;
    }
  }

  const filteredAppointments = appointments.filter((apt) => {
    if (filterStatus !== 'all' && apt.status !== filterStatus) return false;
    if (filterCentre !== 'all' && apt.centre.id !== parseInt(filterCentre)) return false;
    return true;
  });

  // Calculer les statistiques pour les rendez-vous filtrés
  const stats = {
    total: filteredAppointments.length,
    pending: filteredAppointments.filter(apt => apt.status === 'pending').length,
    confirmed: filteredAppointments.filter(apt => apt.status === 'confirmed').length,
    cancelled: filteredAppointments.filter(apt => apt.status === 'cancelled').length,
    completed: filteredAppointments.filter(apt => apt.status === 'completed').length,
  };

  return (
    <>
      <AdminHeader />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Gestion des rendez-vous</h1>
            <p className="text-gray-600">Consultez et gérez les rendez-vous pris par les patients</p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600 mb-1">Total</div>
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow">
              <div className="text-sm text-yellow-700 mb-1">En attente</div>
              <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow">
              <div className="text-sm text-green-700 mb-1">Confirmés</div>
              <div className="text-2xl font-bold text-green-800">{stats.confirmed}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg shadow">
              <div className="text-sm text-red-700 mb-1">Annulés</div>
              <div className="text-2xl font-bold text-red-800">{stats.cancelled}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg shadow">
              <div className="text-sm text-blue-700 mb-1">Terminés</div>
              <div className="text-2xl font-bold text-blue-800">{stats.completed}</div>
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="font-semibold">Centre:</label>
                <select
                  value={filterCentre}
                  onChange={(e) => setFilterCentre(e.target.value)}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="all">Tous les centres</option>
                  {centres.map((centre) => (
                    <option key={centre.id} value={centre.id.toString()}>
                      {centre.name} - {centre.city}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="font-semibold">Statut:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="all">Tous</option>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmés</option>
                  <option value="cancelled">Annulés</option>
                  <option value="completed">Terminés</option>
                </select>
              </div>
            </div>
          </div>

          {/* Liste des rendez-vous */}
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Chargement...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-500">Aucun rendez-vous trouvé</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">
                          {getCiviliteDisplay(appointment.civilite)} {appointment.lastName} {appointment.firstName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(appointment.status)}`}>
                          {getStatusDisplay(appointment.status)}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">
                            <strong>📅 Date:</strong> {formatDate(appointment.timeSlot.date)}
                          </p>
                          <p className="text-gray-600">
                            <strong>🕐 Heure:</strong> {appointment.timeSlot.startTime} - {appointment.timeSlot.endTime}
                          </p>
                          <p className="text-gray-600">
                            <strong>📍 Centre:</strong> {appointment.centre.name} ({appointment.centre.city})
                          </p>
                          <p className="text-gray-600">
                            <strong>📋 Type:</strong> {getAppointmentTypeDisplay(appointment.appointmentType)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">
                            <strong>📞 Téléphone:</strong> <a href={`tel:${appointment.phone}`} className="text-blue-600 hover:underline">{appointment.phone}</a>
                          </p>
                          {appointment.email && (
                            <p className="text-gray-600">
                              <strong>✉️ Email:</strong> <a href={`mailto:${appointment.email}`} className="text-blue-600 hover:underline">{appointment.email}</a>
                            </p>
                          )}
                          <p className="text-gray-600">
                            <strong>🏠 Adresse:</strong> {appointment.address}
                          </p>
                          <p className="text-gray-600 text-xs">
                            <strong>Créé le:</strong> {formatDateTime(appointment.createdAt)}
                          </p>
                        </div>
                      </div>
                      {appointment.message && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm"><strong>💬 Message:</strong></p>
                          <p className="text-sm text-gray-700 mt-1">{appointment.message}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t flex-wrap">
                    {appointment.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                      >
                        ✓ Confirmer et envoyer l'email
                      </button>
                    )}
                    {appointment.status !== 'completed' && appointment.status !== 'pending' && (
                      <button
                        onClick={() => handleStatusChange(appointment.id, 'completed')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Marquer comme terminé
                      </button>
                    )}
                    {appointment.status !== 'cancelled' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => handleCancelAndDelete(appointment.id)}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                        >
                          🗑️ Annuler et supprimer
                        </button>
                      </>
                    )}
                    {appointment.status === 'cancelled' && (
                      <button
                        onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Restaurer (confirmer)
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(appointment.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm ml-auto"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
