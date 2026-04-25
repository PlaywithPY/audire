'use client';

import ContactInfo from "@/components/ContactInfo";
import ContactHours from "@/components/ContactHours";
import AllPageImageEffects from "@/components/AllPageImageEffects";
import DynamicBlockRenderer from "@/components/DynamicBlockRenderer";
import { useState, useEffect } from "react";

interface PageTexts {
  [key: string]: string;
}

/**
 * Normalise un numéro de téléphone belge au format international +32xxxxxxxxx
 * Accepte différents formats d'entrée et les convertit automatiquement
 */
function normalizePhoneNumber(phone: string): string {
  if (!phone) return phone;

  // Retirer tous les espaces, points, tirets et parenthèses
  let normalized = phone.replace(/[\s.\-()]/g, '');

  // Si le numéro commence par 0032, le remplacer par +32
  if (normalized.startsWith('0032')) {
    normalized = '+32' + normalized.substring(4);
  }
  // Si le numéro commence par 0 (format national belge)
  else if (normalized.startsWith('0') && !normalized.startsWith('00')) {
    // Retirer le 0 initial et ajouter +32
    normalized = '+32' + normalized.substring(1);
  }
  // Si le numéro commence par 32 (sans le +)
  else if (normalized.startsWith('32') && !normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }

  return normalized;
}

export default function Contact() {
  const [texts, setTexts] = useState<PageTexts>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string>('');

  useEffect(() => {
    async function loadTexts() {
      try {
        const res = await fetch('/api/page-texts?pageKey=contact');
        if (res.ok) {
          const data = await res.json();
          setTexts(data);
        }
      } catch (error) {
        console.error('Error loading page texts:', error);
      }
    }
    loadTexts();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    const formData = new FormData(e.currentTarget);

    // Normaliser le numéro de téléphone avant l'envoi
    const rawPhone = formData.get('telephone') as string;
    const normalizedPhone = rawPhone ? normalizePhoneNumber(rawPhone) : '';

    const data = {
      civilite: formData.get('civilite') as string,
      firstName: formData.get('prenom') as string,
      lastName: formData.get('nom') as string,
      phone: normalizedPhone, // Toujours au format +32xxxxxxxxx si fourni
      email: formData.get('email') as string,
      message: formData.get('message') as string,
      appointmentType: 'premier-contact',
    };

    try {
      const res = await fetch('/api/contact-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSubmitMessage('✅ Votre message a bien été envoyé ! Nous vous répondrons dans les plus brefs délais.');
        e.currentTarget.reset();
      } else {
        const error = await res.json();
        setSubmitMessage(`❌ Erreur : ${error.error || 'Une erreur est survenue'}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitMessage('❌ Erreur lors de l\'envoi du formulaire. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <>
      <main className="min-h-screen">
        {/* Hero Section */}
        <section data-section="hero" className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                {texts['hero-kicker'] || 'Nous contacter'}
              </span>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                {texts['hero-title'] || 'Contact'}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                {texts['hero-description'] || 'Une question ? Envie de prendre rendez-vous ? Nous sommes là pour vous accompagner.'}
              </p>
            </div>
          </div>
        </section>

        {/* Informations de contact */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <ContactInfo />
          </div>
        </section>

        {/* Horaires */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">{texts['section-hours-title'] || 'Horaires d\'ouverture'}</h2>
              <p className="text-xl text-text-light">
                {texts['section-hours-description'] || 'Nous sommes ouverts du lundi au vendredi. Le samedi sur rendez-vous uniquement.'}
              </p>
            </div>

            <ContactHours />
          </div>
        </section>

        {/* Formulaire de contact */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">{texts['section-form-title'] || 'Envoyez-nous un message'}</h2>
              <p className="text-xl text-text-light">
                {texts['section-form-description'] || 'Vous avez une question ? Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-bg p-8 rounded-2xl">
              <div className="mb-6">
                <label htmlFor="civilite" className="block text-sm font-semibold mb-2">
                  Civilité *
                </label>
                <select
                  id="civilite"
                  name="civilite"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option value="">Sélectionnez...</option>
                  <option value="monsieur">Monsieur</option>
                  <option value="madame">Madame</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="nom" className="block text-sm font-semibold mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label htmlFor="prenom" className="block text-sm font-semibold mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Votre prénom"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="votre@email.be"
                  />
                </div>
                <div>
                  <label htmlFor="telephone" className="block text-sm font-semibold mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="042 75 06 66"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-semibold mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  placeholder="Votre message..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-dark transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>

              {submitMessage && (
                <div className={`mt-4 p-4 rounded-lg text-center ${submitMessage.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {submitMessage}
                </div>
              )}

              <p className="text-sm text-text-muted mt-4 text-center">
                * Champs obligatoires
              </p>
            </form>
          </div>
        </section>

        {/* Carte (placeholder) */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🗺️</div>
                    <p className="text-xl font-semibold text-text-light">Plan d'accès</p>
                    <p className="text-text-muted">Carte interactive à venir</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <DynamicBlockRenderer pageKey="contact" />
        {/* Image Effects */}
        <AllPageImageEffects pageKey="contact" />
      </main>
    </>
  );
}
