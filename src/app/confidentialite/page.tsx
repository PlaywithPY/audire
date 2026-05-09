'use client';

import { useState, useEffect } from 'react';
import DynamicBlockSlot from '@/components/DynamicBlockSlot';
import InsertZone from '@/components/admin/InsertZone';
import { useCompanyInfo, formatAddressHtml, formatPhoneHref } from '@/lib/hooks/useCompanyInfo';
import type { CompanyInfo } from '@/lib/company-info';

interface PageTexts { [key: string]: string; }

// Sprint Lot 2 — Defaults générés depuis companyInfo. Sections statiques sinon.
function buildSections(c: CompanyInfo): Array<{ key: string; defaultTitle: string; defaultBody: string }> {
  const name = c.legalName || c.tradeName || 'Audire';
  const addr = formatAddressHtml(c);
  const phone = c.phone || '';
  const phoneHref = formatPhoneHref(phone);
  const email = c.email || '';
  const addrLine = c.address ? `${c.address}${c.postalCode || c.city ? ', ' + `${c.postalCode || ''} ${c.city || ''}`.trim() : ''}` : '';

  return [
    {
      key: 'intro', defaultTitle: '',
      defaultBody: `<p>Chez ${name}, nous accordons une grande importance à la protection de vos données personnelles. Cette politique de confidentialité vous informe sur la manière dont nous collectons, utilisons et protégeons vos informations personnelles conformément au Règlement Général sur la Protection des Données (RGPD).</p>`,
    },
    {
      key: 'responsable', defaultTitle: '1. Responsable du traitement',
      defaultBody: `<p><strong>${name}</strong><br/>${addr}<br/>
        ${email ? `Email : <a href="mailto:${email}" class="text-primary hover:underline">${email}</a><br/>` : ''}
        ${phone ? `Téléphone : <a href="${phoneHref}" class="text-primary hover:underline">${phone}</a>` : ''}</p>`,
    },
    {
      key: 'donnees', defaultTitle: '2. Données collectées',
      defaultBody: `<p class="mb-4">Nous collectons les données personnelles suivantes :</p>
        <ul class="list-disc list-inside space-y-2">
          <li><strong>Données d'identité :</strong> nom, prénom, date de naissance</li>
          <li><strong>Données de contact :</strong> adresse postale, email, téléphone</li>
          <li><strong>Données de santé :</strong> résultats de tests auditifs, historique médical auditif</li>
          <li><strong>Données administratives :</strong> numéro de mutuelle, numéro INAMI</li>
          <li><strong>Données de navigation :</strong> cookies, adresse IP, données de connexion</li>
        </ul>`,
    },
    {
      key: 'finalites', defaultTitle: '3. Finalités du traitement',
      defaultBody: `<p class="mb-4">Vos données personnelles sont collectées pour :</p>
        <ul class="list-disc list-inside space-y-2">
          <li>Assurer votre prise en charge et votre suivi auditif</li>
          <li>Gérer les rendez-vous et les communications</li>
          <li>Établir des devis et facturer les prestations</li>
          <li>Gérer les remboursements avec les mutuelles et l'INAMI</li>
          <li>Améliorer nos services et notre site internet</li>
          <li>Respecter nos obligations légales et réglementaires</li>
        </ul>`,
    },
    {
      key: 'base-legale', defaultTitle: '4. Base légale du traitement',
      defaultBody: `<p class="mb-4">Le traitement de vos données repose sur :</p>
        <ul class="list-disc list-inside space-y-2">
          <li><strong>Votre consentement</strong> pour les données de santé et certaines communications</li>
          <li><strong>L'exécution du contrat</strong> pour la fourniture de nos services</li>
          <li><strong>Nos obligations légales</strong> (comptabilité, facturation, conservation des dossiers médicaux)</li>
          <li><strong>Notre intérêt légitime</strong> pour l'amélioration de nos services</li>
        </ul>`,
    },
    {
      key: 'destinataires', defaultTitle: '5. Destinataires des données',
      defaultBody: `<p class="mb-4">Vos données personnelles peuvent être communiquées à :</p>
        <ul class="list-disc list-inside space-y-2">
          <li>Notre personnel autorisé (audioprothésistes, personnel administratif)</li>
          <li>Les mutuelles et l'INAMI pour les remboursements</li>
          <li>Les médecins ORL (avec votre accord)</li>
          <li>Nos sous-traitants techniques (hébergement, maintenance)</li>
          <li>Les autorités compétentes sur demande légale</li>
        </ul>`,
    },
    {
      key: 'duree', defaultTitle: '6. Durée de conservation',
      defaultBody: `<p>Vos données sont conservées :</p>
        <ul class="list-disc list-inside mt-4 space-y-2">
          <li><strong>Dossiers médicaux :</strong> 30 ans après le dernier contact (obligation légale)</li>
          <li><strong>Données comptables :</strong> 7 ans (obligation fiscale)</li>
          <li><strong>Données marketing :</strong> 3 ans après le dernier contact ou jusqu'au retrait du consentement</li>
        </ul>`,
    },
    {
      key: 'droits', defaultTitle: '7. Vos droits',
      defaultBody: `<p class="mb-4">Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul class="list-disc list-inside space-y-2">
          <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
          <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
          <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données (sous conditions)</li>
          <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
          <li><strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré</li>
          <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
          <li><strong>Droit de retirer votre consentement</strong> à tout moment</li>
        </ul>
        ${email ? `<p class="mt-4">Pour exercer ces droits, contactez-nous par email à <a href="mailto:${email}" class="text-primary hover:underline font-semibold">${email}</a> ou par courrier à notre adresse.</p>` : ''}`,
    },
    {
      key: 'securite', defaultTitle: '8. Sécurité des données',
      defaultBody: `<p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre la perte, l'utilisation abusive, l'accès non autorisé, la divulgation, l'altération ou la destruction :</p>
        <ul class="list-disc list-inside mt-4 space-y-2">
          <li>Chiffrement des données sensibles</li>
          <li>Accès restreint aux données personnelles</li>
          <li>Serveurs sécurisés et sauvegardés régulièrement</li>
          <li>Formation du personnel à la protection des données</li>
        </ul>`,
    },
    {
      key: 'cookies', defaultTitle: '9. Cookies',
      defaultBody: `<p>Notre site utilise des cookies pour améliorer votre expérience de navigation et analyser le trafic. Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela peut affecter certaines fonctionnalités du site.</p>`,
    },
    {
      key: 'reclamation', defaultTitle: '10. Réclamation',
      defaultBody: `<p>Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de l'Autorité de Protection des Données (APD) :</p>
        <p class="mt-4"><strong>Autorité de Protection des Données</strong><br/>Rue de la Presse 35<br/>1000 Bruxelles<br/>Belgique<br/><a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">www.autoriteprotectiondonnees.be</a></p>`,
    },
    {
      key: 'modifications', defaultTitle: '11. Modifications',
      defaultBody: `<p>Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications seront publiées sur cette page avec une date de mise à jour.</p>`,
    },
    {
      key: 'contact', defaultTitle: '12. Contact',
      defaultBody: `<p>Pour toute question concernant cette politique de confidentialité ou le traitement de vos données personnelles, contactez-nous :</p>
        <ul class="list-disc list-inside mt-4 space-y-2">
          ${email ? `<li>Email : <a href="mailto:${email}" class="text-primary hover:underline">${email}</a></li>` : ''}
          ${phone ? `<li>Téléphone : <a href="${phoneHref}" class="text-primary hover:underline">${phone}</a></li>` : ''}
          ${addrLine ? `<li>Courrier : ${addrLine}</li>` : ''}
        </ul>`,
    },
  ];
}

export default function Confidentialite() {
  const [texts, setTexts] = useState<PageTexts>({});
  const company = useCompanyInfo();
  const sections = buildSections(company);

  useEffect(() => {
    fetch('/api/page-texts?pageKey=confidentialite')
      .then((r) => r.ok ? r.json() : {})
      .then(setTexts)
      .catch((e) => console.error('Error loading page texts:', e));
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <InsertZone pageKey="confidentialite" slot="page-top" afterOrder={0} />
      <DynamicBlockSlot pageKey="confidentialite" slot="page-top" />

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 data-edit-block="confidentialite.page-title" className="text-5xl font-bold mb-8">
            {texts['page-title'] || 'Politique de confidentialité'}
          </h1>

          <div className="prose prose-lg max-w-none space-y-8">
            {sections.map((section, idx) => (
              <div key={section.key}>
                <section data-section={section.key}>
                  {section.defaultTitle && (
                    <h2 data-edit-block={`confidentialite.${section.key}-title`} className="text-3xl font-bold mb-4">
                      {texts[`${section.key}-title`] || section.defaultTitle}
                    </h2>
                  )}
                  <div data-edit-block={`confidentialite.${section.key}-body`} className="text-text-light leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: texts[`${section.key}-body`] || section.defaultBody }} />
                </section>
                {idx > 0 && idx % 4 === 0 && (
                  <>
                    <InsertZone pageKey="confidentialite" slot={`after-${section.key}`} afterOrder={(idx + 1) * 100} />
                    <DynamicBlockSlot pageKey="confidentialite" slot={`after-${section.key}`} />
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p data-edit-block="confidentialite.last-update" className="text-sm text-text-muted text-center">
              {texts['last-update'] || 'Dernière mise à jour : Mars 2026'}
            </p>
          </div>
        </div>
      </div>

      <InsertZone pageKey="confidentialite" slot="page-bottom" afterOrder={9000} />
      <DynamicBlockSlot pageKey="confidentialite" slot="page-bottom" />
    </main>
  );
}
