'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminHeader from '@/components/AdminHeader';

type AppointmentStats = {
  pending: number;
  confirmed: number;
  completed: number;
  totalHistorical: number;
};

type Appointment = {
  id: number;
  civilite: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  appointmentType: string;
  status: string;
  createdAt: string;
  timeSlot: {
    date: string;
    startTime: string;
    endTime: string;
  };
  centre: {
    name: string;
    city: string;
  };
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AppointmentStats>({
    pending: 0,
    confirmed: 0,
    completed: 0,
    totalHistorical: 0,
  });
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [confirmedAppointments, setConfirmedAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, router]);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/appointments');
      if (res.ok) {
        const appointments = await res.json();

        // Calculer les stats
        const pending = appointments.filter((apt: Appointment) => apt.status === 'pending');
        const confirmed = appointments.filter((apt: Appointment) => apt.status === 'confirmed');
        const completed = appointments.filter((apt: Appointment) => apt.status === 'completed');

        setStats({
          pending: pending.length,
          confirmed: confirmed.length,
          completed: completed.length,
          totalHistorical: pending.length + confirmed.length + completed.length,
        });

        // Trier les RDV en attente par date de création (plus anciens en premier)
        setPendingAppointments(
          pending.sort((a: Appointment, b: Appointment) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        );

        // Trier les RDV confirmés par date du RDV (plus proches en premier)
        setConfirmedAppointments(
          confirmed.sort((a: Appointment, b: Appointment) =>
            new Date(a.timeSlot.date).getTime() - new Date(b.timeSlot.date).getTime()
          )
        );
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
    if (civilite === 'monsieur') return 'M.';
    if (civilite === 'madame') return 'Mme';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <Link
            href="/admin/rendez-vous"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Gérer les rendez-vous
          </Link>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* RDV en attente - PRIORITÉ */}
          <Link
            href="/admin/appointments"
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{stats.pending}</div>
                <div className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full mt-1">
                  À TRAITER
                </div>
              </div>
            </div>
            <div className="text-lg font-semibold">Rendez-vous en attente</div>
            <div className="text-sm text-white/80 mt-1">En attente de confirmation</div>
          </Link>

          {/* RDV confirmés */}
          <Link
            href="/admin/appointments"
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-green-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-gray-900">{stats.confirmed}</div>
              </div>
            </div>
            <div className="text-lg font-semibold text-gray-900">RDV confirmés</div>
            <div className="text-sm text-gray-600 mt-1">À venir prochainement</div>
          </Link>

          {/* RDV à marquer comme terminés */}
          <Link
            href="/admin/appointments"
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-blue-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-gray-900">{stats.completed}</div>
              </div>
            </div>
            <div className="text-lg font-semibold text-gray-900">RDV terminés</div>
            <div className="text-sm text-gray-600 mt-1">En attente de clôture</div>
          </Link>

          {/* Total historique */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{stats.totalHistorical}</div>
              </div>
            </div>
            <div className="text-lg font-semibold">Total RDV</div>
            <div className="text-sm text-white/80 mt-1">Historique complet</div>
          </div>
        </div>

        {/* Section RDV en attente - PRIORITÉ */}
        {stats.pending > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-300 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 animate-pulse">
                  ⚠️
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Rendez-vous en attente de confirmation</h2>
                  <p className="text-white/90">Ces rendez-vous nécessitent votre attention immédiate</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {pendingAppointments.slice(0, 5).map((apt) => (
                <div key={apt.id} className="border border-orange-200 rounded-lg p-4 hover:bg-orange-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold">
                          {getCiviliteDisplay(apt.civilite)} {apt.lastName} {apt.firstName}
                        </h3>
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                          EN ATTENTE
                        </span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">📅 </span>
                          <span className="font-medium">{formatDate(apt.timeSlot.date)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">🕐 </span>
                          <span className="font-medium">{apt.timeSlot.startTime} - {apt.timeSlot.endTime}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">📋 </span>
                          <span className="font-medium">{getAppointmentTypeDisplay(apt.appointmentType)}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Demandé le {formatDateTime(apt.createdAt)}
                      </div>
                    </div>
                    <div>
                      <Link
                        href="/admin/appointments"
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-semibold"
                      >
                        Traiter →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {pendingAppointments.length > 5 && (
                <div className="text-center pt-4">
                  <Link
                    href="/admin/appointments"
                    className="text-orange-600 hover:text-orange-700 font-semibold"
                  >
                    Voir les {pendingAppointments.length - 5} autres RDV en attente →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section RDV confirmés à venir */}
        {stats.confirmed > 0 && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  ✓
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Prochains rendez-vous confirmés</h2>
                  <p className="text-white/90">Les rendez-vous validés et à venir</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {confirmedAppointments.slice(0, 3).map((apt) => (
                <div key={apt.id} className="border border-green-200 rounded-lg p-4 hover:bg-green-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold">
                          {getCiviliteDisplay(apt.civilite)} {apt.lastName} {apt.firstName}
                        </h3>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          CONFIRMÉ
                        </span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">📅 </span>
                          <span className="font-medium">{formatDate(apt.timeSlot.date)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">🕐 </span>
                          <span className="font-medium">{apt.timeSlot.startTime} - {apt.timeSlot.endTime}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">📍 </span>
                          <span className="font-medium">{apt.centre.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {confirmedAppointments.length > 3 && (
                <div className="text-center pt-4">
                  <Link
                    href="/admin/appointments"
                    className="text-green-600 hover:text-green-700 font-semibold"
                  >
                    Voir les {confirmedAppointments.length - 3} autres RDV confirmés →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Accès rapides */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Accès rapides</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/rendez-vous"
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="text-4xl mb-2">📅</div>
              <div className="text-sm font-semibold text-center group-hover:text-blue-600">Gérer les créneaux</div>
            </Link>
            <Link
              href="/admin/appointments"
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="text-4xl mb-2">📋</div>
              <div className="text-sm font-semibold text-center group-hover:text-blue-600">Tous les RDV</div>
            </Link>
            <Link
              href="/admin/centres"
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="text-4xl mb-2">🏢</div>
              <div className="text-sm font-semibold text-center group-hover:text-blue-600">Gérer les centres</div>
            </Link>
            <Link
              href="/admin/testimonials"
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="text-4xl mb-2">⭐</div>
              <div className="text-sm font-semibold text-center group-hover:text-blue-600">Témoignages</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
