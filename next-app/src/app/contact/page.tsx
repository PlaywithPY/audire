'use client';

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactInfo from "@/components/ContactInfo";
import ContactHours from "@/components/ContactHours";
import AllPageImageEffects from "@/components/AllPageImageEffects";
import { useState, useEffect } from "react";

interface PageTexts {
  [key: string]: string;
}

export default function Contact() {
  const [texts, setTexts] = useState<PageTexts>({});

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
  return (
    <>
      <Header />
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

            <form className="max-w-2xl mx-auto bg-bg p-8 rounded-2xl">
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
                className="w-full bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-dark transition-all shadow-lg"
              >
                Envoyer le message
              </button>

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

        {/* Image Effects */}
        <AllPageImageEffects pageKey="contact" />
      </main>
      <Footer />
    </>
  );
}
