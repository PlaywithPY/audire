'use client';

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageFeatureCard from "@/components/ImageFeatureCard";
import AllPageImageEffects from "@/components/AllPageImageEffects";
import { useState, useEffect } from "react";
import { CardData } from "@/lib/card-helpers";

interface PageTexts {
  [key: string]: string;
}

export default function TestAuditifGratuit() {
  const [whyTestCards, setWhyTestCards] = useState<CardData[]>([]);
  const [stepCards, setStepCards] = useState<CardData[]>([]);
  const [texts, setTexts] = useState<PageTexts>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      try {
        // Charger les cards
        const cardsRes = await fetch('/api/card-images?pageKey=test-auditif-gratuit');
        if (cardsRes.ok) {
          const allCards: CardData[] = await cardsRes.json();
          setWhyTestCards(allCards.filter(card => ['test-signs', 'test-benefits'].includes(card.cardKey)));
          setStepCards(allCards.filter(card => card.cardKey.startsWith('test-step-')));
        }

        // Charger les textes
        const textsRes = await fetch('/api/page-texts?pageKey=test-auditif-gratuit');
        if (textsRes.ok) {
          const textsData = await textsRes.json();
          setTexts(textsData);
        }
      } catch (error) {
        console.error('Error loading page data:', error);
      }
    }
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    const formData = new FormData(e.currentTarget);
    const data = {
      civilite: formData.get('civilite') as string,
      firstName: formData.get('prenom') as string,
      lastName: formData.get('nom') as string,
      phone: formData.get('telephone') as string,
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
        setSubmitMessage('✅ Votre demande a bien été envoyée ! Nous vous recontacterons rapidement.');
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
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                {texts['hero-kicker'] || 'Sans engagement'}
              </span>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                {texts['hero-title'] || 'Test auditif gratuit'}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                {texts['hero-description'] || 'Un test complet de 30 minutes pour comprendre votre audition. Gratuit, sans engagement, et expliqué avec des mots simples.'}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {['100% gratuit', 'Sans engagement', '30 minutes', 'Résultats immédiats'].map((chip) => (
                  <span key={chip} className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                    ✓ {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Image Effects */}
        <AllPageImageEffects pageKey="test-auditif-gratuit" />

        {/* Pourquoi faire un test */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block bg-secondary text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
                {texts['section-1-kicker'] || 'Prévention'}
              </span>
              <h2 className="text-4xl font-bold mb-4">{texts['section-1-title'] || 'Pourquoi faire un test auditif ?'}</h2>
              <p className="text-xl text-text-light max-w-3xl mx-auto">
                {texts['section-1-description'] || 'La perte auditive est progressive et souvent difficile à détecter soi-même.'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {whyTestCards.map((card) => (
                <ImageFeatureCard
                  key={card.cardKey}
                  imageSrc={card.imageSrc}
                  title={card.title}
                  description={card.description}
                  imageAlt={card.imageAlt}
                  href={card.href}
                  imagePosition={card.imagePosition}
                  fallbackEmoji={card.fallbackEmoji}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Comment se déroule le test */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">{texts['section-2-title'] || 'Comment se déroule le test ?'}</h2>
              <p className="text-xl text-text-light max-w-3xl mx-auto">
                {texts['section-2-description'] || 'Un test simple, indolore et complet en 30 minutes.'}
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {stepCards.map((card, index) => (
                <div key={card.cardKey} className="flex gap-6 items-start bg-white p-8 rounded-2xl hover:shadow-lg transition-all">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">{card.fallbackEmoji}</span>
                      <h3 className="text-2xl font-bold">{card.title}</h3>
                    </div>
                    <p className="text-text-light text-lg leading-relaxed">{card.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Formulaire de prise de RDV */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">{texts['section-form-title'] || 'Réservez votre test gratuit'}</h2>
              <p className="text-xl text-text-light">
                {texts['section-form-description'] || 'Remplissez le formulaire ci-dessous et nous vous recontactons rapidement pour fixer un rendez-vous.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-bg p-8 rounded-2xl shadow-lg">
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
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="042 75 06 66"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-semibold mb-2">
                  Message (optionnel)
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  placeholder="Informations complémentaires, disponibilités..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-dark transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Envoi en cours...' : '📅 Réserver mon test gratuit'}
              </button>

              {submitMessage && (
                <div className={`mt-4 p-4 rounded-lg text-center ${submitMessage.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {submitMessage}
                </div>
              )}

              <p className="text-sm text-text-muted mt-4 text-center">
                * Champs obligatoires • Nous vous recontactons sous 24h
              </p>
            </form>
          </div>
        </section>

        {/* Contact direct */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">{texts['cta-title'] || 'Ou contactez-nous directement'}</h2>
            <p className="text-xl text-text-light mb-8">
              {texts['cta-description'] || 'Vous préférez nous appeler ? Nous sommes là pour vous.'}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="tel:+3242750666"
                className="bg-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
              >
                📞 042 75 06 66
              </a>
              <a
                href="mailto:centre.audire@gmail.com"
                className="bg-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
              >
                ✉️ centre.audire@gmail.com
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
