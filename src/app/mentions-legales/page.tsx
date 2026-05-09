'use client';

import { useState, useEffect } from 'react';
import DynamicBlockSlot from '@/components/DynamicBlockSlot';
import InsertZone from '@/components/admin/InsertZone';

interface PageTexts {
  [key: string]: string;
}

export default function MentionsLegales() {
  const [texts, setTexts] = useState<PageTexts>({});

  useEffect(() => {
    async function loadTexts() {
      try {
        const res = await fetch('/api/page-texts?pageKey=mentions-legales');
        if (res.ok) setTexts(await res.json());
      } catch (e) {
        console.error('Error loading page texts:', e);
      }
    }
    loadTexts();
  }, []);

  return (
    <>
      <main className="min-h-screen bg-white">
        <InsertZone pageKey="mentions-legales" slot="page-top" afterOrder={0} />
        <DynamicBlockSlot pageKey="mentions-legales" slot="page-top" />

        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <h1
              data-edit-block="mentions-legales.page-title"
              className="text-5xl font-bold mb-8"
            >
              {texts['page-title'] || 'Mentions légales'}
            </h1>

            <div className="prose prose-lg max-w-none space-y-8">
              <section data-section="editeur">
                <h2 data-edit-block="mentions-legales.editeur-title" className="text-3xl font-bold mb-4">
                  {texts['editeur-title'] || 'Éditeur du site'}
                </h2>
                <div
                  data-edit-block="mentions-legales.editeur-body"
                  className="text-text-light leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html:
                      texts['editeur-body'] ||
                      `<p><strong>Audire SPRL</strong><br/>Centre auditif indépendant<br/>Rue de l'Yser 106-108<br/>4101 Jemeppe-sur-Meuse<br/>Belgique</p>
                       <p class="mt-4"><strong>Téléphone :</strong> <a href="tel:+3242750666" class="text-primary hover:underline">042 75 06 66</a><br/><strong>Email :</strong> <a href="mailto:centre.audire@gmail.com" class="text-primary hover:underline">centre.audire@gmail.com</a></p>
                       <p class="mt-4"><strong>Numéro d'entreprise :</strong> BE 0XXX.XXX.XXX<br/><strong>Numéro INAMI :</strong> X-XXXXX-XX-XXX</p>`,
                  }}
                />
              </section>

              <InsertZone pageKey="mentions-legales" slot="after-editeur" afterOrder={100} />
              <DynamicBlockSlot pageKey="mentions-legales" slot="after-editeur" />

              <section data-section="hebergement">
                <h2 data-edit-block="mentions-legales.hebergement-title" className="text-3xl font-bold mb-4">
                  {texts['hebergement-title'] || 'Hébergement'}
                </h2>
                <div
                  data-edit-block="mentions-legales.hebergement-body"
                  className="text-text-light leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html:
                      texts['hebergement-body'] ||
                      `<p>Ce site est hébergé par :<br/><strong>Vercel Inc.</strong><br/>340 S Lemon Ave #4133<br/>Walnut, CA 91789<br/>États-Unis<br/><a href="https://vercel.com" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">vercel.com</a></p>`,
                  }}
                />
              </section>

              <section data-section="propriete">
                <h2 data-edit-block="mentions-legales.propriete-title" className="text-3xl font-bold mb-4">
                  {texts['propriete-title'] || 'Propriété intellectuelle'}
                </h2>
                <div
                  data-edit-block="mentions-legales.propriete-body"
                  className="text-text-light leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html:
                      texts['propriete-body'] ||
                      `<p>L'ensemble de ce site relève de la législation belge et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.</p>
                       <p class="mt-4">La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.</p>`,
                  }}
                />
              </section>

              <section data-section="liens">
                <h2 data-edit-block="mentions-legales.liens-title" className="text-3xl font-bold mb-4">
                  {texts['liens-title'] || 'Liens hypertextes'}
                </h2>
                <div
                  data-edit-block="mentions-legales.liens-body"
                  className="text-text-light leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html:
                      texts['liens-body'] ||
                      `<p>Les liens hypertextes mis en place dans le cadre du présent site internet en direction d'autres ressources présentes sur le réseau Internet ne sauraient engager la responsabilité d'Audire.</p>`,
                  }}
                />
              </section>

              <InsertZone pageKey="mentions-legales" slot="middle" afterOrder={300} />
              <DynamicBlockSlot pageKey="mentions-legales" slot="middle" />

              <section data-section="responsabilite">
                <h2 data-edit-block="mentions-legales.responsabilite-title" className="text-3xl font-bold mb-4">
                  {texts['responsabilite-title'] || 'Responsabilité'}
                </h2>
                <div
                  data-edit-block="mentions-legales.responsabilite-body"
                  className="text-text-light leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html:
                      texts['responsabilite-body'] ||
                      `<p>Les informations fournies sur ce site le sont à titre informatif. Audire ne saurait être tenu responsable de l'exactitude, de la précision ou de l'exhaustivité des informations mises à disposition sur ce site.</p>
                       <p class="mt-4">En conséquence, l'utilisateur reconnaît utiliser ces informations sous sa responsabilité exclusive.</p>`,
                  }}
                />
              </section>

              <section data-section="donnees">
                <h2 data-edit-block="mentions-legales.donnees-title" className="text-3xl font-bold mb-4">
                  {texts['donnees-title'] || 'Données personnelles'}
                </h2>
                <div
                  data-edit-block="mentions-legales.donnees-body"
                  className="text-text-light leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html:
                      texts['donnees-body'] ||
                      `<p>Pour toute information concernant le traitement de vos données personnelles, veuillez consulter notre <a href="/confidentialite" class="text-primary hover:underline font-semibold">Politique de confidentialité</a>.</p>`,
                  }}
                />
              </section>

              <section data-section="contact">
                <h2 data-edit-block="mentions-legales.contact-title" className="text-3xl font-bold mb-4">
                  {texts['contact-title'] || 'Contact'}
                </h2>
                <div
                  data-edit-block="mentions-legales.contact-body"
                  className="text-text-light leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html:
                      texts['contact-body'] ||
                      `<p>Pour toute question concernant les mentions légales, vous pouvez nous contacter :</p>
                       <ul class="list-disc list-inside mt-4 space-y-2">
                         <li>Par téléphone : <a href="tel:+3242750666" class="text-primary hover:underline">042 75 06 66</a></li>
                         <li>Par email : <a href="mailto:centre.audire@gmail.com" class="text-primary hover:underline">centre.audire@gmail.com</a></li>
                         <li>Par courrier : Rue de l'Yser 106-108, 4101 Jemeppe-sur-Meuse</li>
                       </ul>`,
                  }}
                />
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-border">
              <p data-edit-block="mentions-legales.last-update" className="text-sm text-text-muted text-center">
                {texts['last-update'] || 'Dernière mise à jour : Mars 2026'}
              </p>
            </div>
          </div>
        </div>

        <InsertZone pageKey="mentions-legales" slot="page-bottom" afterOrder={900} />
        <DynamicBlockSlot pageKey="mentions-legales" slot="page-bottom" />
      </main>
    </>
  );
}
