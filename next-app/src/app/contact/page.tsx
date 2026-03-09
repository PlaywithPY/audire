import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Audire",
  description: "Contactez Audire à Jemeppe-sur-Meuse. Téléphone, email, horaires et plan d'accès.",
};

export default function Contact() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                Nous contacter
              </span>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Contact
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                Une question ? Envie de prendre rendez-vous ? Nous sommes là pour vous accompagner.
              </p>
            </div>
          </div>
        </section>

        {/* Informations de contact */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Téléphone */}
              <div className="bg-bg p-8 rounded-2xl text-center hover:shadow-lg transition-all">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  📞
                </div>
                <h3 className="text-xl font-bold mb-2">Téléphone</h3>
                <a href="tel:+3242750666" className="text-primary text-lg font-semibold hover:underline">
                  042 75 06 66
                </a>
                <p className="text-text-muted text-sm mt-2">Lun - Ven : 9h-17h</p>
              </div>

              {/* Email */}
              <div className="bg-bg p-8 rounded-2xl text-center hover:shadow-lg transition-all">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  ✉️
                </div>
                <h3 className="text-xl font-bold mb-2">Email</h3>
                <a href="mailto:info@audire.be" className="text-primary text-lg font-semibold hover:underline break-all">
                  info@audire.be
                </a>
                <p className="text-text-muted text-sm mt-2">Réponse sous 24h</p>
              </div>

              {/* Adresse */}
              <div className="bg-bg p-8 rounded-2xl text-center hover:shadow-lg transition-all">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  📍
                </div>
                <h3 className="text-xl font-bold mb-2">Adresse</h3>
                <p className="text-text-light">
                  Rue de l'Yser 106-108<br />
                  4101 Jemeppe-sur-Meuse
                </p>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Rue+de+l'Yser+106-108+4101+Jemeppe-sur-Meuse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm hover:underline mt-2 inline-block"
                >
                  Voir sur Google Maps →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Horaires */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Horaires d'ouverture</h2>
              <p className="text-xl text-text-light">
                Nous sommes ouverts du lundi au vendredi. Le samedi sur rendez-vous uniquement.
              </p>
            </div>

            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="divide-y divide-border">
                {[
                  { jour: 'Lundi', horaires: '9h-12h, 13h-17h' },
                  { jour: 'Mardi', horaires: '9h-12h, 13h-17h' },
                  { jour: 'Mercredi', horaires: '9h-12h, 13h-17h' },
                  { jour: 'Jeudi', horaires: '9h-12h, 13h-17h' },
                  { jour: 'Vendredi', horaires: '9h-12h, 13h-17h' },
                  { jour: 'Samedi', horaires: 'Sur rendez-vous', highlight: true },
                  { jour: 'Dimanche', horaires: 'Fermé', closed: true },
                ].map((item) => (
                  <div
                    key={item.jour}
                    className={`flex justify-between items-center px-8 py-4 ${
                      item.closed ? 'bg-gray-50' : item.highlight ? 'bg-secondary' : 'hover:bg-bg'
                    } transition-colors`}
                  >
                    <span className="font-semibold">{item.jour}</span>
                    <span className={item.closed ? 'text-text-muted' : 'text-primary font-medium'}>
                      {item.horaires}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Formulaire de contact */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Envoyez-nous un message</h2>
              <p className="text-xl text-text-light">
                Vous avez une question ? Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
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
      </main>
      <Footer />
    </>
  );
}
