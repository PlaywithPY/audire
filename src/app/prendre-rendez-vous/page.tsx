'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type Centre = {
  id: number;
  name: string;
  address: string;
  city: string;
  postalCode: string;
};

type TimeSlot = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  centre: Centre;
};

type FormData = {
  centreId: number | null;
  timeSlotId: number | null;
  civilite: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  email: string;
  emailConsent: boolean;
  appointmentType: string;
  message: string;
  prescription: File | null;
};

const appointmentTypes = [
  {
    value: 'premier-contact',
    label: 'Premier contact',
    description: 'Prise d\'informations générales',
  },
  {
    value: 'premier-rdv',
    label: 'Premier rendez-vous',
    description: 'Avec prescription ORL obligatoire',
  },
  {
    value: 'reglage',
    label: 'Réglage',
    description: 'Ajustement de votre appareil auditif',
  },
];

export default function PrendreRendezVous() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [centres, setCentres] = useState<Centre[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [groupedSlots, setGroupedSlots] = useState<Record<string, TimeSlot[]>>({});

  const [formData, setFormData] = useState<FormData>({
    centreId: null,
    timeSlotId: null,
    civilite: '',
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
    email: '',
    emailConsent: false,
    appointmentType: '',
    message: '',
    prescription: null,
  });

  useEffect(() => {
    fetchCentres();
  }, []);

  useEffect(() => {
    if (formData.centreId) {
      fetchAvailableSlots();
    }
  }, [formData.centreId]);

  useEffect(() => {
    // Grouper les créneaux par date
    const grouped: Record<string, TimeSlot[]> = {};
    timeSlots.forEach((slot) => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    setGroupedSlots(grouped);
  }, [timeSlots]);

  async function fetchCentres() {
    try {
      setLoading(true);
      const res = await fetch('/api/centres');
      const data = await res.json();
      setCentres(data.filter((c: any) => c.isActive));

      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, centreId: data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching centres:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAvailableSlots() {
    if (!formData.centreId) return;

    try {
      setLoading(true);
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 60 jours

      const res = await fetch(
        `/api/appointments?centreId=${formData.centreId}&startDate=${startDate}&endDate=${endDate}`
      );
      const data = await res.json();
      setTimeSlots(data);
    } catch (error) {
      console.error('Error fetching available slots:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleNext() {
    if (step === 1 && !formData.timeSlotId) {
      alert('Veuillez sélectionner un créneau horaire');
      return;
    }

    if (step === 2) {
      if (!formData.civilite || !formData.firstName || !formData.lastName || !formData.address || !formData.phone || !formData.appointmentType) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Validation du téléphone (format français)
      const phoneRegex = /^(?:(?:\+|00)32|0)[1-9](?:[\s.-]?\d{2}){4}$/;
      if (!phoneRegex.test(formData.phone)) {
        alert('Veuillez entrer un numéro de téléphone valide');
        return;
      }

      // Validation de l'email si renseigné
      if (formData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          alert('Veuillez entrer une adresse email valide');
          return;
        }
      }
    }

    setStep(step + 1);
  }

  function handleBack() {
    setStep(step - 1);
  }

  async function handleSubmit() {
    try {
      setSubmitting(true);

      // Créer le rendez-vous
      const appointmentRes = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          centreId: formData.centreId,
          timeSlotId: formData.timeSlotId,
          civilite: formData.civilite,
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          phone: formData.phone,
          email: formData.email || null,
          emailConsent: formData.emailConsent,
          appointmentType: formData.appointmentType,
          message: formData.message || null,
        }),
      });

      if (!appointmentRes.ok) {
        throw new Error('Failed to create appointment');
      }

      const appointmentData = await appointmentRes.json();

      // Uploader la prescription si présente
      if (formData.prescription) {
        const prescriptionFormData = new FormData();
        prescriptionFormData.append('file', formData.prescription);
        prescriptionFormData.append('appointmentId', appointmentData.appointment.id.toString());

        await fetch('/api/appointments/prescription', {
          method: 'POST',
          body: prescriptionFormData,
        });
      }

      setSuccess(true);
    } catch (error) {
      console.error('Error submitting appointment:', error);
      alert('Une erreur est survenue lors de la prise de rendez-vous. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-primary/5 to-primary-light/5">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-4">Rendez-vous confirmé !</h1>
              <p className="text-xl text-gray-600 mb-8">
                Votre rendez-vous a été enregistré avec succès.
                {formData.emailConsent && formData.email ? (
                  <> Vous recevrez un email de confirmation et un SMS de rappel avant votre rendez-vous.</>
                ) : (
                  <> Vous recevrez un SMS de rappel avant votre rendez-vous.</>
                )}
              </p>
              <div className="bg-blue-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold mb-2">Détails de votre rendez-vous</h3>
                <p className="text-gray-600">
                  {timeSlots.find((s) => s.id === formData.timeSlotId)?.date &&
                    new Date(timeSlots.find((s) => s.id === formData.timeSlotId)!.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                </p>
                <p className="text-gray-600">
                  à {timeSlots.find((s) => s.id === formData.timeSlotId)?.startTime}
                </p>
              </div>
              <a
                href="/"
                className="inline-block px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Retour à l'accueil
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-primary/5 to-primary-light/5">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                Réservation en ligne
              </span>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">Prendre rendez-vous</h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                Réservez votre consultation en quelques clics
              </p>
            </div>
          </div>
        </section>

        {/* Stepper */}
        <section className="py-8 bg-white border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto flex items-center justify-center">
              <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="ml-2 font-semibold">Choisir un créneau</span>
              </div>

              <div className={`w-20 h-1 mx-4 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>

              <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="ml-2 font-semibold">Vos informations</span>
              </div>

              <div className={`w-20 h-1 mx-4 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>

              <div className={`flex items-center ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="ml-2 font-semibold">Confirmation</span>
              </div>
            </div>
          </div>
        </section>

        {/* Form Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
              {/* Étape 1: Choix du créneau */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Choisissez votre créneau</h2>

                  {/* Sélection du centre */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Centre Audire</label>
                    <select
                      value={formData.centreId || ''}
                      onChange={(e) => setFormData({ ...formData, centreId: parseInt(e.target.value), timeSlotId: null })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                      {centres.map((centre) => (
                        <option key={centre.id} value={centre.id}>
                          {centre.name} - {centre.city}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Créneaux disponibles */}
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                      <p className="mt-4 text-gray-600">Chargement des créneaux disponibles...</p>
                    </div>
                  ) : Object.keys(groupedSlots).length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                      Aucun créneau disponible pour le moment. Veuillez réessayer plus tard.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(groupedSlots).map(([date, slots]) => (
                        <div key={date} className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-semibold text-lg mb-4">
                            {new Date(date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {slots.map((slot) => (
                              <button
                                key={slot.id}
                                onClick={() => setFormData({ ...formData, timeSlotId: slot.id })}
                                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                                  formData.timeSlotId === slot.id
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-gray-300 hover:border-primary'
                                }`}
                              >
                                {slot.startTime} - {slot.endTime}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end pt-6">
                    <button
                      onClick={handleNext}
                      disabled={!formData.timeSlotId}
                      className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Continuer
                    </button>
                  </div>
                </div>
              )}

              {/* Étape 2: Informations personnelles */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Vos informations</h2>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Civilité *</label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, civilite: 'monsieur' })}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                          formData.civilite === 'monsieur'
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 hover:border-primary/50'
                        }`}
                      >
                        Monsieur
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, civilite: 'madame' })}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                          formData.civilite === 'madame'
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 hover:border-primary/50'
                        }`}
                      >
                        Madame
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, civilite: 'autre' })}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                          formData.civilite === 'autre'
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 hover:border-primary/50'
                        }`}
                      >
                        Autre
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Prénom *</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="Votre prénom"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Nom *</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Adresse complète *</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Rue, numéro, code postal, ville"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">N° de GSM * (pour les rappels)</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="0470 12 34 56"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Email (optionnel)</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  {/* Consentement email */}
                  {formData.email && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <label className="flex items-start cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.emailConsent}
                          onChange={(e) => setFormData({ ...formData, emailConsent: e.target.checked })}
                          className="mt-1 mr-3 w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary/20"
                        />
                        <span className="text-sm text-gray-700">
                          J'accepte de recevoir un email de confirmation pour ce rendez-vous.
                          <span className="block mt-1 text-xs text-gray-600">
                            En réservant ce rendez-vous, vous acceptez que nous utilisions votre numéro de téléphone pour vous envoyer des messages SMS concernant uniquement ce rendez-vous.
                          </span>
                        </span>
                      </label>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold mb-2">Type de rendez-vous *</label>
                    <div className="space-y-3">
                      {appointmentTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setFormData({ ...formData, appointmentType: type.value })}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            formData.appointmentType === type.value
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-300 hover:border-primary/50'
                          }`}
                        >
                          <div className="font-semibold">{type.label}</div>
                          <div className="text-sm text-gray-600">{type.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Message (optionnel)</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Laissez-nous un message si vous le souhaitez"
                    ></textarea>
                  </div>

                  <div className="flex justify-between pt-6">
                    <button
                      onClick={handleBack}
                      className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Retour
                    </button>
                    <button
                      onClick={handleNext}
                      className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Continuer
                    </button>
                  </div>
                </div>
              )}

              {/* Étape 3: Confirmation et prescription */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Confirmation</h2>

                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-4">Récapitulatif de votre rendez-vous</h3>

                    <div className="space-y-3">
                      <div>
                        <span className="font-semibold">Date :</span>{' '}
                        {timeSlots.find((s) => s.id === formData.timeSlotId)?.date &&
                          new Date(timeSlots.find((s) => s.id === formData.timeSlotId)!.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                      </div>
                      <div>
                        <span className="font-semibold">Heure :</span>{' '}
                        {timeSlots.find((s) => s.id === formData.timeSlotId)?.startTime} -{' '}
                        {timeSlots.find((s) => s.id === formData.timeSlotId)?.endTime}
                      </div>
                      <div>
                        <span className="font-semibold">Centre :</span>{' '}
                        {centres.find((c) => c.id === formData.centreId)?.name}
                      </div>
                      <div>
                        <span className="font-semibold">Type :</span>{' '}
                        {appointmentTypes.find((t) => t.value === formData.appointmentType)?.label}
                      </div>
                      <div>
                        <span className="font-semibold">Patient :</span> {formData.firstName} {formData.lastName}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Prescription ORL (optionnel)
                    </label>
                    <p className="text-sm text-gray-600 mb-3">
                      Si vous avez une prescription de votre ORL, vous pouvez l'uploader ici. Elle sera envoyée directement à notre centre et supprimée automatiquement après 1 mois.
                    </p>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setFormData({ ...formData, prescription: e.target.files?.[0] || null })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    {formData.prescription && (
                      <p className="mt-2 text-sm text-green-600">
                        ✓ Fichier sélectionné : {formData.prescription.name}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between pt-6">
                    <button
                      onClick={handleBack}
                      className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Retour
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Enregistrement...' : 'Confirmer le rendez-vous'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
