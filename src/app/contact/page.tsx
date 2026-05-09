'use client';

import ContactInfo from "@/components/ContactInfo";
import ContactHours from "@/components/ContactHours";
import AllPageImageEffects from "@/components/AllPageImageEffects";
import DynamicBlockSlot from "@/components/DynamicBlockSlot";
import InsertZone from "@/components/admin/InsertZone";
import { useState, useEffect } from "react";

interface PageTexts { [key: string]: string; }

function normalizePhoneNumber(phone: string): string {
  if (!phone) return phone;
  let n = phone.replace(/[\s.\-()]/g, '');
  if (n.startsWith('0032')) n = '+32' + n.substring(4);
  else if (n.startsWith('0') && !n.startsWith('00')) n = '+32' + n.substring(1);
  else if (n.startsWith('32') && !n.startsWith('+')) n = '+' + n;
  return n;
}

export default function Contact() {
  const [texts, setTexts] = useState<PageTexts>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string>('');

  useEffect(() => {
    fetch('/api/page-texts?pageKey=contact').then(r => r.ok ? r.json() : {}).then(setTexts).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    const formData = new FormData(e.currentTarget);
    const rawPhone = formData.get('telephone') as string;
    const data = {
      civilite: formData.get('civilite') as string,
      firstName: formData.get('prenom') as string,
      lastName: formData.get('nom') as string,
      phone: rawPhone ? normalizePhoneNumber(rawPhone) : '',
      email: formData.get('email') as string,
      message: formData.get('message') as string,
      appointmentType: 'premier-contact',
    };
    try {
      const res = await fetch('/api/contact-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (res.ok) { setSubmitMessage('✅ Votre message a bien été envoyé ! Nous vous répondrons dans les plus brefs délais.'); e.currentTarget.reset(); }
      else { const error = await res.json(); setSubmitMessage(`❌ Erreur : ${error.error || 'Une erreur est survenue'}`); }
    } catch { setSubmitMessage("❌ Erreur lors de l'envoi du formulaire. Veuillez réessayer."); }
    finally { setIsSubmitting(false); }
  }

  return (
    <main className="min-h-screen">
      <InsertZone pageKey="contact" slot="page-top" afterOrder={0} />
      <DynamicBlockSlot pageKey="contact" slot="page-top" />

      <section data-section="hero" className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span data-edit-block="contact.hero-kicker" className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">{texts['hero-kicker'] || 'Nous contacter'}</span>
            <h1 data-edit-block="contact.hero-title" className="text-5xl md:text-6xl font-bold mb-6">{texts['hero-title'] || 'Contact'}</h1>
            <p data-edit-block="contact.hero-description" className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">{texts['hero-description'] || 'Une question ? Envie de prendre rendez-vous ? Nous sommes là pour vous accompagner.'}</p>
          </div>
        </div>
      </section>

      <InsertZone pageKey="contact" slot="after-hero" afterOrder={100} />
      <DynamicBlockSlot pageKey="contact" slot="after-hero" />

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4"><ContactInfo /></div>
      </section>

      <InsertZone pageKey="contact" slot="after-contact-info" afterOrder={200} />
      <DynamicBlockSlot pageKey="contact" slot="after-contact-info" />

      <section className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 data-edit-block="contact.section-hours-title" className="text-4xl font-bold mb-4">{texts['section-hours-title'] || "Horaires d'ouverture"}</h2>
            <p data-edit-block="contact.section-hours-description" className="text-xl text-text-light">{texts['section-hours-description'] || 'Nous sommes ouverts du lundi au vendredi. Le samedi sur rendez-vous uniquement.'}</p>
          </div>
          <ContactHours />
        </div>
      </section>

      <InsertZone pageKey="contact" slot="before-form" afterOrder={300} />
      <DynamicBlockSlot pageKey="contact" slot="before-form" />

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 data-edit-block="contact.section-form-title" className="text-4xl font-bold mb-4">{texts['section-form-title'] || 'Envoyez-nous un message'}</h2>
            <p data-edit-block="contact.section-form-description" className="text-xl text-text-light">{texts['section-form-description'] || 'Vous avez une question ? Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.'}</p>
          </div>
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-bg p-8 rounded-2xl">
            <div className="mb-6">
              <label htmlFor="civilite" className="block text-sm font-semibold mb-2">Civilité *</label>
              <select id="civilite" name="civilite" required className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                <option value="">Sélectionnez...</option><option value="monsieur">Monsieur</option><option value="madame">Madame</option><option value="autre">Autre</option>
              </select>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div><label htmlFor="nom" className="block text-sm font-semibold mb-2">Nom *</label><input type="text" id="nom" name="nom" required className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Votre nom" /></div>
              <div><label htmlFor="prenom" className="block text-sm font-semibold mb-2">Prénom *</label><input type="text" id="prenom" name="prenom" required className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Votre prénom" /></div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div><label htmlFor="email" className="block text-sm font-semibold mb-2">Email *</label><input type="email" id="email" name="email" required className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="votre@email.be" /></div>
              <div><label htmlFor="telephone" className="block text-sm font-semibold mb-2">Téléphone</label><input type="tel" id="telephone" name="telephone" className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="042 75 06 66" /></div>
            </div>
            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-semibold mb-2">Message *</label>
              <textarea id="message" name="message" required rows={6} className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none" placeholder="Votre message..."></textarea>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-dark transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}</button>
            {submitMessage && (<div className={`mt-4 p-4 rounded-lg text-center ${submitMessage.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{submitMessage}</div>)}
            <p className="text-sm text-text-muted mt-4 text-center">* Champs obligatoires</p>
          </form>
        </div>
      </section>

      <InsertZone pageKey="contact" slot="before-map" afterOrder={400} />
      <DynamicBlockSlot pageKey="contact" slot="before-map" />

      <section className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🗺️</div>
                  <p data-edit-block="contact.map-title" className="text-xl font-semibold text-text-light">{texts['map-title'] || "Plan d'accès"}</p>
                  <p data-edit-block="contact.map-subtitle" className="text-text-muted">{texts['map-subtitle'] || 'Carte interactive à venir'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <InsertZone pageKey="contact" slot="page-bottom" afterOrder={900} />
      <DynamicBlockSlot pageKey="contact" slot="page-bottom" />

      <AllPageImageEffects pageKey="contact" />
    </main>
  );
}
