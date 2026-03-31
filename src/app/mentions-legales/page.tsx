import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — Audire",
  description: "Mentions légales du site Audire.",
};

export default function MentionsLegales() {
  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-8">Mentions légales</h1>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-3xl font-bold mb-4">Éditeur du site</h2>
                <p className="text-text-light leading-relaxed">
                  <strong>Audire SPRL</strong><br />
                  Centre auditif indépendant<br />
                  Rue de l'Yser 106-108<br />
                  4101 Jemeppe-sur-Meuse<br />
                  Belgique
                </p>
                <p className="text-text-light leading-relaxed mt-4">
                  <strong>Téléphone :</strong> <a href="tel:+3242750666" className="text-primary hover:underline">042 75 06 66</a><br />
                  <strong>Email :</strong> <a href="mailto:centre.audire@gmail.com" className="text-primary hover:underline">centre.audire@gmail.com</a>
                </p>
                <p className="text-text-light leading-relaxed mt-4">
                  <strong>Numéro d'entreprise :</strong> BE 0XXX.XXX.XXX<br />
                  <strong>Numéro INAMI :</strong> X-XXXXX-XX-XXX
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">Hébergement</h2>
                <p className="text-text-light leading-relaxed">
                  Ce site est hébergé par :<br />
                  <strong>Vercel Inc.</strong><br />
                  340 S Lemon Ave #4133<br />
                  Walnut, CA 91789<br />
                  États-Unis<br />
                  <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    vercel.com
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">Propriété intellectuelle</h2>
                <p className="text-text-light leading-relaxed">
                  L'ensemble de ce site relève de la législation belge et internationale sur le droit d'auteur
                  et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour
                  les documents téléchargeables et les représentations iconographiques et photographiques.
                </p>
                <p className="text-text-light leading-relaxed mt-4">
                  La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est
                  formellement interdite sauf autorisation expresse du directeur de la publication.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">Liens hypertextes</h2>
                <p className="text-text-light leading-relaxed">
                  Les liens hypertextes mis en place dans le cadre du présent site internet en direction d'autres
                  ressources présentes sur le réseau Internet ne sauraient engager la responsabilité d'Audire.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">Responsabilité</h2>
                <p className="text-text-light leading-relaxed">
                  Les informations fournies sur ce site le sont à titre informatif. Audire ne saurait être tenu
                  responsable de l'exactitude, de la précision ou de l'exhaustivité des informations mises à
                  disposition sur ce site.
                </p>
                <p className="text-text-light leading-relaxed mt-4">
                  En conséquence, l'utilisateur reconnaît utiliser ces informations sous sa responsabilité exclusive.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">Données personnelles</h2>
                <p className="text-text-light leading-relaxed">
                  Pour toute information concernant le traitement de vos données personnelles,
                  veuillez consulter notre{' '}
                  <a href="/confidentialite" className="text-primary hover:underline font-semibold">
                    Politique de confidentialité
                  </a>.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">Contact</h2>
                <p className="text-text-light leading-relaxed">
                  Pour toute question concernant les mentions légales, vous pouvez nous contacter :
                </p>
                <ul className="list-disc list-inside text-text-light leading-relaxed mt-4 space-y-2">
                  <li>Par téléphone : <a href="tel:+3242750666" className="text-primary hover:underline">042 75 06 66</a></li>
                  <li>Par email : <a href="mailto:centre.audire@gmail.com" className="text-primary hover:underline">centre.audire@gmail.com</a></li>
                  <li>Par courrier : Rue de l'Yser 106-108, 4101 Jemeppe-sur-Meuse</li>
                </ul>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-text-muted text-center">
                Dernière mise à jour : Mars 2026
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
