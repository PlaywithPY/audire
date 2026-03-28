'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';

type Centre = {
  id: number;
  name: string;
  slug: string;
  city: string;
};

type TimeSlot = {
  id: number;
  centreId: number;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  centre?: Centre;
  appointments?: Appointment[];
};

type Appointment = {
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
};

const appointmentTypeLabels: Record<string, string> = {
  'premier-contact': 'Premier contact / Prise d\'informations',
  'premier-rdv': 'Premier RDV (avec prescription ORL)',
  'reglage': 'Réglage',
};

export default function RendezVousPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [centres, setCentres] = useState<Centre[]>([]);
  const [selectedCentreId, setSelectedCentreId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'slots' | 'appointments'>('slots');

  // Gestion des créneaux
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [showAddSlotForm, setShowAddSlotForm] = useState(false);
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
  });

  // Gestion des créneaux multiples
  const [showBulkAddForm, setShowBulkAddForm] = useState(false);
  const [bulkSlotData, setBulkSlotData] = useState({
    startDate: '',
    endDate: '',
    daysOfWeek: [] as number[],
    slots: [{ startTime: '09:00', endTime: '10:00' }],
  });

  // Gestion des rendez-vous
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchCentres();
    }
  }, [status, router]);

  useEffect(() => {
    if (selectedCentreId) {
      fetchTimeSlots();
    }
  }, [selectedCentreId]);

  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    }
  }, [activeTab]);

  async function fetchCentres() {
    try {
      const res = await fetch('/api/centres');
      const data = await res.json();
      setCentres(data);

      if (data.length > 0 && !selectedCentreId) {
        setSelectedCentreId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching centres:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTimeSlots() {
    if (!selectedCentreId) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/time-slots?centreId=${selectedCentreId}`);
      const data = await res.json();
      setTimeSlots(data);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAppointments() {
    try {
      setLoading(true);
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
      setLoading(false);
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
        fetchAppointments();
      } else {
        alert('Erreur lors de la mise à jour du statut');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  }

  async function handleDeleteAppointment(appointmentId: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/appointments?id=${appointmentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Rendez-vous supprimé avec succès');
        fetchAppointments();
      } else {
        alert('Erreur lors de la suppression du rendez-vous');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Erreur lors de la suppression du rendez-vous');
    }
  }

  async function handleAddSlot() {
    if (!selectedCentreId || !newSlot.date || !newSlot.startTime || !newSlot.endTime) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      setSaving(true);

      // Découper le créneau en sous-créneaux de 30 minutes
      const halfHourSlots = splitIntoHalfHourSlots(newSlot.startTime, newSlot.endTime);

      // Créer tous les sous-créneaux
      const slots = halfHourSlots.map(slot => ({
        date: newSlot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
      }));

      const res = await fetch('/api/admin/time-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          centreId: selectedCentreId,
          multiple: true,
          slots,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create time slots');
      }

      setNewSlot({ date: '', startTime: '', endTime: '' });
      setShowAddSlotForm(false);
      fetchTimeSlots();
    } catch (error) {
      console.error('Error creating time slots:', error);
      alert('Erreur lors de la création des créneaux');
    } finally {
      setSaving(false);
    }
  }

  async function handleBulkAddSlots() {
    if (!selectedCentreId || !bulkSlotData.startDate || !bulkSlotData.endDate || bulkSlotData.daysOfWeek.length === 0) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      setSaving(true);

      // Générer tous les créneaux
      const slots: any[] = [];
      const startDate = new Date(bulkSlotData.startDate);
      const endDate = new Date(bulkSlotData.endDate);

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        if (bulkSlotData.daysOfWeek.includes(dayOfWeek)) {
          bulkSlotData.slots.forEach(slot => {
            // Découper chaque créneau en sous-créneaux de 30 minutes
            const halfHourSlots = splitIntoHalfHourSlots(slot.startTime, slot.endTime);

            halfHourSlots.forEach(halfSlot => {
              slots.push({
                date: d.toISOString().split('T')[0],
                startTime: halfSlot.startTime,
                endTime: halfSlot.endTime,
              });
            });
          });
        }
      }

      const res = await fetch('/api/admin/time-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          centreId: selectedCentreId,
          multiple: true,
          slots,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create time slots');
      }

      setBulkSlotData({
        startDate: '',
        endDate: '',
        daysOfWeek: [],
        slots: [{ startTime: '09:00', endTime: '10:00' }],
      });
      setShowBulkAddForm(false);
      fetchTimeSlots();
    } catch (error) {
      console.error('Error creating time slots:', error);
      alert('Erreur lors de la création des créneaux');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSlot(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) {
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/time-slots?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete time slot');
      }

      fetchTimeSlots();
    } catch (error: any) {
      console.error('Error deleting time slot:', error);
      alert(error.message || 'Erreur lors de la suppression du créneau');
    } finally {
      setSaving(false);
    }
  }

  function toggleDayOfWeek(day: number) {
    setBulkSlotData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day],
    }));
  }

  function addBulkSlotTime() {
    setBulkSlotData(prev => ({
      ...prev,
      slots: [...prev.slots, { startTime: '09:00', endTime: '10:00' }],
    }));
  }

  function removeBulkSlotTime(index: number) {
    setBulkSlotData(prev => ({
      ...prev,
      slots: prev.slots.filter((_, i) => i !== index),
    }));
  }

  function updateBulkSlotTime(index: number, field: 'startTime' | 'endTime', value: string) {
    setBulkSlotData(prev => ({
      ...prev,
      slots: prev.slots.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot)),
    }));
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Chargement...</div>
        </div>
      </div>
    );
  }

  const daysOfWeekLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

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
    if (filterStatus === 'all') return true;
    return apt.status === filterStatus;
  });

  /**
   * Découpe un créneau en sous-créneaux de 30 minutes
   * @param startTime Heure de début (format "HH:MM")
   * @param endTime Heure de fin (format "HH:MM")
   * @returns Array de sous-créneaux { startTime, endTime }
   */
  function splitIntoHalfHourSlots(startTime: string, endTime: string): { startTime: string; endTime: string }[] {
    const slots: { startTime: string; endTime: string }[] = [];

    // Parse start and end times
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Convert to minutes since midnight
    let currentMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // Generate 30-minute slots
    while (currentMinutes < endMinutes) {
      const slotStartHour = Math.floor(currentMinutes / 60);
      const slotStartMinute = currentMinutes % 60;

      // Add 30 minutes
      const nextMinutes = Math.min(currentMinutes + 30, endMinutes);
      const slotEndHour = Math.floor(nextMinutes / 60);
      const slotEndMinute = nextMinutes % 60;

      slots.push({
        startTime: `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMinute).padStart(2, '0')}`,
        endTime: `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMinute).padStart(2, '0')}`,
      });

      currentMinutes = nextMinutes;
    }

    return slots;
  }

  /**
   * Ouvre le picker natif pour un input de type date ou time
   */
  function openPicker(event: React.MouseEvent<HTMLInputElement>) {
    const input = event.target as HTMLInputElement;
    if (input && typeof input.showPicker === 'function') {
      try {
        input.showPicker();
      } catch (error) {
        // Fallback: certains navigateurs ne supportent pas showPicker
        console.log('showPicker not supported');
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestion des Rendez-vous</h1>

          {/* Sélecteur de centre */}
          <select
            value={selectedCentreId || ''}
            onChange={(e) => setSelectedCentreId(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            {centres.map((centre) => (
              <option key={centre.id} value={centre.id}>
                {centre.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('slots')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'slots'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Créneaux horaires
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'appointments'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Rendez-vous
          </button>
        </div>

        {/* Créneaux horaires */}
        {activeTab === 'slots' && (
          <div className="space-y-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setShowAddSlotForm(!showAddSlotForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {showAddSlotForm ? 'Annuler' : 'Ajouter un créneau'}
              </button>
              <button
                onClick={() => setShowBulkAddForm(!showBulkAddForm)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {showBulkAddForm ? 'Annuler' : 'Ajouter plusieurs créneaux'}
              </button>
            </div>

            {/* Formulaire d'ajout simple */}
            {showAddSlotForm && (
              <div className="bg-white p-6 rounded-lg shadow space-y-4">
                <h3 className="text-xl font-semibold">Nouveau créneau</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <input
                      type="date"
                      value={newSlot.date}
                      onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                      onClick={openPicker}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Heure de début</label>
                    <input
                      type="time"
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                      onClick={openPicker}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Heure de fin</label>
                    <input
                      type="time"
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                      onClick={openPicker}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddSlot}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            )}

            {/* Formulaire d'ajout multiple */}
            {showBulkAddForm && (
              <div className="bg-white p-6 rounded-lg shadow space-y-4">
                <h3 className="text-xl font-semibold">Ajouter plusieurs créneaux</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date de début</label>
                    <input
                      type="date"
                      value={bulkSlotData.startDate}
                      onChange={(e) => setBulkSlotData({ ...bulkSlotData, startDate: e.target.value })}
                      onClick={openPicker}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date de fin</label>
                    <input
                      type="date"
                      value={bulkSlotData.endDate}
                      onChange={(e) => setBulkSlotData({ ...bulkSlotData, endDate: e.target.value })}
                      onClick={openPicker}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Jours de la semaine</label>
                  <div className="flex space-x-2">
                    {daysOfWeekLabels.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => toggleDayOfWeek(index)}
                        className={`px-4 py-2 rounded-lg ${
                          bulkSlotData.daysOfWeek.includes(index)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Créneaux horaires</label>
                  {bulkSlotData.slots.map((slot, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateBulkSlotTime(index, 'startTime', e.target.value)}
                        onClick={openPicker}
                        className="px-3 py-2 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <span className="self-center">-</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateBulkSlotTime(index, 'endTime', e.target.value)}
                        onClick={openPicker}
                        className="px-3 py-2 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      {bulkSlotData.slots.length > 1 && (
                        <button
                          onClick={() => removeBulkSlotTime(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addBulkSlotTime}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    + Ajouter un créneau
                  </button>
                </div>

                <button
                  onClick={handleBulkAddSlots}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {saving ? 'Enregistrement...' : 'Créer tous les créneaux'}
                </button>
              </div>
            )}

            {/* Liste des créneaux */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Heure</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {timeSlots.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        Aucun créneau disponible
                      </td>
                    </tr>
                  ) : (
                    timeSlots.map((slot) => (
                      <tr key={slot.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(slot.date).toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {slot.startTime} - {slot.endTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              slot.isBooked
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {slot.isBooked ? 'Réservé' : 'Disponible'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {!slot.isBooked && (
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              disabled={saving}
                              className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                            >
                              Supprimer
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rendez-vous */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            {/* Filtres */}
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex gap-4 items-center">
                <label className="font-semibold">Filtrer par statut:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="all">Tous</option>
                  <option value="confirmed">Confirmés</option>
                  <option value="cancelled">Annulés</option>
                  <option value="completed">Terminés</option>
                </select>
              </div>
            </div>

            {/* Liste des rendez-vous */}
            {loading ? (
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
                    <div className="flex gap-2 pt-4 border-t">
                      {appointment.status !== 'completed' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Marquer comme terminé
                        </button>
                      )}
                      {appointment.status !== 'cancelled' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                        >
                          Annuler
                        </button>
                      )}
                      {appointment.status !== 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Restaurer (confirmer)
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAppointment(appointment.id)}
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
        )}
      </div>
    </div>
  );
}
