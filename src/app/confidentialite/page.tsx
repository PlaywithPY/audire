import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Audire",
  description: "Politique de confidentialité et protection des données personnelles chez Audire.",
};

export default function Confidentialite() {
  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-8">Politique de confidentialité</h1>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <p className="text-text-light leading-relaxed">
                  Chez Audire, nous accordons une grande importance à la protection de vos données personnelles.
                  Cette politique de confidentialité vous informe sur la manière dont nous collectons, utilisons
                  et protégeons vos informations personnelles conformément au Règlement Général sur la Protection
                  des Données (RGPD).
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">1. Responsable du traitement</h2>
                <p className="text-text-light leading-relaxed">
                  <strong>Audire SPRL</strong><br />
                  Rue de l'Yser 106-108<br />
                  4101 Jemeppe-sur-Meuse<br />
                  Belgique<br />
                  Email : <a href="mailto:centre.audire@gmail.com" className="text-primary hover:underline">centre.audire@gmail.com</a><br />
                  Téléphone : <a href="tel:+3242750666" className="text-primary hover:underline">042 75 06 66</a>
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">2. Données collectées</h2>
                <p className="text-text-light leading-relaxed mb-4">
                  Nous collectons les données personnelles suivantes :
                </p>
                <ul className="list-disc list-inside text-text-light leading-relaxed space-y-2">
                  <li><strong>Données d'identité :</strong> nom, prénom, date de naissance</li>
                  <li><strong>Données de contact :</strong> adresse postale, email, téléphone</li>
                  <li><strong>Données de santé :</strong> résultats de tests auditifs, historique médical auditif</li>
                  <li><strong>Données administratives :</strong> numéro de mutuelle, numéro INAMI</li>
                  <li><strong>Données de navigation :</strong> cookies, adresse IP, données de connexion</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">3. Finalités du traitement</h2>
                <p className="text-text-light leading-relaxed mb-4">
                  Vos données personnelles sont collectées pour :
                </p>
                <ul className="list-disc list-inside text-text-light leading-relaxed space-y-2">
                  <li>Assurer votre prise en charge et votre suivi auditif</li>
                  <li>Gérer les rendez-vous et les communications</li>
                  <li>Établir des devis et facturer les prestations</li>
                  <li>Gérer les remboursements avec les mutuelles et l'INAMI</li>
                  <li>Améliorer nos services et notre site internet</li>
                  <li>Respecter nos obligations légales et réglementaires</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">4. Base légale du traitement</h2>
                <p className="text-text-light leading-relaxed mb-4">
                  Le traitement de vos données repose sur :
                </p>
                <ul className="list-disc list-inside text-text-light leading-relaxed space-y-2">
                  <li><strong>Votre consentement</strong> pour les données de santé et certaines communications</li>
                  <li><strong>L'exécution du contrat</strong> pour la fourniture de nos services</li>
                  <li><strong>Nos obligations légales</strong> (comptabilité, facturation, conservation des dossiers médicaux)</li>
                  <li><strong>Notre intérêt légitime</strong> pour l'amélioration de nos services</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">5. Destinataires des données</h2>
                <p className="text-text-light leading-relaxed mb-4">
                  Vos données personnelles peuvent être communiquées à :
                </p>
                <ul className="list-disc list-inside text-text-light leading-relaxed space-y-2">
                  <li>Notre personnel autorisé (audioprothésistes, personnel administratif)</li>
                  <li>Les mutuelles et l'INAMI pour les remboursements</li>
                  <li>Les médecins ORL (avec votre accord)</li>
                  <li>Nos sous-traitants techniques (hébergement, maintenance)</li>
                  <li>Les autorités compétentes sur demande légale</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">6. Durée de conservation</h2>
                <p className="text-text-light leading-relaxed">
                  Vos données sont conservées :
                </p>
                <ul className="list-disc list-inside text-text-light leading-relaxed mt-4 space-y-2">
                  <li><strong>Dossiers médicaux :</strong> 30 ans après le dernier contact (obligation légale)</li>
                  <li><strong>Données comptables :</strong> 7 ans (obligation fiscale)</li>
                  <li><strong>Données marketing :</strong> 3 ans après le dernier contact ou jusqu'au retrait du consentement</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">7. Vos droits</h2>
                <p className="text-text-light leading-relaxed mb-4">
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <ul className="list-disc list-inside text-text-light leading-relaxed space-y-2">
                  <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
                  <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
                  <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données (sous conditions)</li>
                  <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
                  <li><strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré</li>
                  <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
                  <li><strong>Droit de retirer votre consentement</strong> à tout moment</li>
                </ul>
                <p className="text-text-light leading-relaxed mt-4">
                  Pour exercer ces droits, contactez-nous par email à{' '}
                  <a href="mailto:centre.audire@gmail.com" className="text-primary hover:underline font-semibold">
                    centre.audire@gmail.com
                  </a>{' '}
                  ou par courrier à notre adresse.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">8. Sécurité des données</h2>
                <p className="text-text-light leading-relaxed">
                  Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger
                  vos données contre la perte, l'utilisation abusive, l'accès non autorisé, la divulgation,
                  l'altération ou la destruction :
                </p>
                <ul className="list-disc list-inside text-text-light leading-relaxed mt-4 space-y-2">
                  <li>Chiffrement des données sensibles</li>
                  <li>Accès restreint aux données personnelles</li>
                  <li>Serveurs sécurisés et sauvegardés régulièrement</li>
                  <li>Formation du personnel à la protection des données</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">9. Cookies</h2>
                <p className="text-text-light leading-relaxed">
                  Notre site utilise des cookies pour améliorer votre expérience de navigation et analyser
                  le trafic. Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela
                  peut affecter certaines fonctionnalités du site.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">10. Réclamation</h2>
                <p className="text-text-light leading-relaxed">
                  Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation
                  auprès de l'Autorité de Protection des Données (APD) :
                </p>
                <p className="text-text-light leading-relaxed mt-4">
                  <strong>Autorité de Protection des Données</strong><br />
                  Rue de la Presse 35<br />
                  1000 Bruxelles<br />
                  Belgique<br />
                  <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    www.autoriteprotectiondonnees.be
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">11. Modifications</h2>
                <p className="text-text-light leading-relaxed">
                  Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment.
                  Les modifications seront publiées sur cette page avec une date de mise à jour.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">12. Contact</h2>
                <p className="text-text-light leading-relaxed">
                  Pour toute question concernant cette politique de confidentialité ou le traitement de vos
                  données personnelles, contactez-nous :
                </p>
                <ul className="list-disc list-inside text-text-light leading-relaxed mt-4 space-y-2">
                  <li>Email : <a href="mailto:centre.audire@gmail.com" className="text-primary hover:underline">centre.audire@gmail.com</a></li>
                  <li>Téléphone : <a href="tel:+3242750666" className="text-primary hover:underline">042 75 06 66</a></li>
                  <li>Courrier : Rue de l'Yser 106-108, 4101 Jemeppe-sur-Meuse</li>
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
