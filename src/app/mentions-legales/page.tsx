'use client';

import { useState, useEffect } from 'react';
import DynamicBlockSlot from '@/components/DynamicBlockSlot';
import InsertZone from '@/components/admin/InsertZone';
import { useCompanyInfo, formatAddressHtml, formatPhoneHref } from '@/lib/hooks/useCompanyInfo';
import type { CompanyInfo } from '@/lib/company-info';

interface PageTexts { [key: string]: string; }

// Sprint Lot 2 — Defaults générés dynamiquement depuis companyInfo.
// Les textes restent éditables via /api/page-texts (priorité aux drafts utilisateur).
function buildDefaults(c: CompanyInfo): PageTexts {
  const name = c.legalName || c.tradeName || 'Audire';
  const addr = formatAddressHtml(c);
  const phone = c.phone || '';
  const phoneHref = formatPhoneHref(phone);
  const email = c.email || '';
  const bce = c.bce || '—';
  const inami = c.inami || '—';
  const host = c.hostingProvider || 'Vercel Inc.';
  const hostAddr = c.hostingAddress || '';

  return {
    'editeur-body': `
      <p><strong>${name}</strong><br/>Centre auditif indépendant<br/>${addr}</p>
      <p class="mt-4"><strong>Téléphone :</strong> ${phone ? `<a href="${phoneHref}" class="text-primary hover:underline">${phone}</a>` : '—'}<br/>
      <strong>Email :</strong> ${email ? `<a href="mailto:${email}" class="text-primary hover:underline">${email}</a>` : '—'}</p>
      <p class="mt-4"><strong>BCE / TVA :</strong> ${bce}<br/><strong>Numéro INAMI :</strong> ${inami}</p>
    `.trim(),
    'hebergement-body': `
      <p>Ce site est hébergé par :<br/><strong>${host}</strong>${hostAddr ? `<br/>${hostAddr}` : ''}</p>
    `.trim(),
    'propriete-body': `
      <p>L'ensemble de ce site relève de la législation belge et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.</p>
      <p class="mt-4">La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.</p>
    `.trim(),
    'liens-body': `
      <p>Les liens hypertextes mis en place dans le cadre du présent site internet en direction d'autres ressources présentes sur le réseau Internet ne sauraient engager la responsabilité de ${name}.</p>
    `.trim(),
    'responsabilite-body': `
      <p>Les informations fournies sur ce site le sont à titre informatif. ${name} ne saurait être tenu responsable de l'exactitude, de la précision ou de l'exhaustivité des informations mises à disposition sur ce site.</p>
      <p class="mt-4">En conséquence, l'utilisateur reconnaît utiliser ces informations sous sa responsabilité exclusive.</p>
    `.trim(),
    'donnees-body': `
      <p>Pour toute information concernant le traitement de vos données personnelles, veuillez consulter notre <a href="/confidentialite" class="text-primary hover:underline font-semibold">Politique de confidentialité</a>.</p>
    `.trim(),
    'contact-body': `
      <p>Pour toute question concernant les mentions légales, vous pouvez nous contacter :</p>
      <ul class="list-disc list-inside mt-4 space-y-2">
        ${phone ? `<li>Par téléphone : <a href="${phoneHref}" class="text-primary hover:underline">${phone}</a></li>` : ''}
        ${email ? `<li>Par email : <a href="mailto:${email}" class="text-primary hover:underline">${email}</a></li>` : ''}
        ${c.address ? `<li>Par courrier : ${c.address}${c.postalCode || c.city ? ', ' + `${c.postalCode || ''} ${c.city || ''}`.trim() : ''}</li>` : ''}
      </ul>
    `.trim(),
  };
}

export default function MentionsLegales() {
  const [texts, setTexts] = useState<PageTexts>({});
  const company = useCompanyInfo();
  const defaults = buildDefaults(company);

  useEffect(() => {
    fetch('/api/page-texts?pageKey=mentions-legales')
      .then((r) => r.ok ? r.json() : {})
      .then(setTexts)
      .catch((e) => console.error('Error loading page texts:', e));
  }, []);

  const get = (k: string, fallback: string = '') => texts[k] || defaults[k] || fallback;

  return (
    <main className="min-h-screen bg-white">
      <InsertZone pageKey="mentions-legales" slot="page-top" afterOrder={0} />
      <DynamicBlockSlot pageKey="mentions-legales" slot="page-top" />

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 data-edit-block="mentions-legales.page-title" className="text-5xl font-bold mb-8">
            {get('page-title', 'Mentions légales')}
          </h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section data-section="editeur">
              <h2 data-edit-block="mentions-legales.editeur-title" className="text-3xl font-bold mb-4">
                {get('editeur-title', 'Éditeur du site')}
              </h2>
              <div data-edit-block="mentions-legales.editeur-body" className="text-text-light leading-relaxed"
                dangerouslySetInnerHTML={{ __html: get('editeur-body') }} />
            </section>

            <InsertZone pageKey="mentions-legales" slot="after-editeur" afterOrder={100} />
            <DynamicBlockSlot pageKey="mentions-legales" slot="after-editeur" />

            <section data-section="hebergement">
              <h2 data-edit-block="mentions-legales.hebergement-title" className="text-3xl font-bold mb-4">
                {get('hebergement-title', 'Hébergement')}
              </h2>
              <div data-edit-block="mentions-legales.hebergement-body" className="text-text-light leading-relaxed"
                dangerouslySetInnerHTML={{ __html: get('hebergement-body') }} />
            </section>

            <section data-section="propriete">
              <h2 data-edit-block="mentions-legales.propriete-title" className="text-3xl font-bold mb-4">
                {get('propriete-title', 'Propriété intellectuelle')}
              </h2>
              <div data-edit-block="mentions-legales.propriete-body" className="text-text-light leading-relaxed"
                dangerouslySetInnerHTML={{ __html: get('propriete-body') }} />
            </section>

            <section data-section="liens">
              <h2 data-edit-block="mentions-legales.liens-title" className="text-3xl font-bold mb-4">
                {get('liens-title', 'Liens hypertextes')}
              </h2>
              <div data-edit-block="mentions-legales.liens-body" className="text-text-light leading-relaxed"
                dangerouslySetInnerHTML={{ __html: get('liens-body') }} />
            </section>

            <InsertZone pageKey="mentions-legales" slot="middle" afterOrder={300} />
            <DynamicBlockSlot pageKey="mentions-legales" slot="middle" />

            <section data-section="responsabilite">
              <h2 data-edit-block="mentions-legales.responsabilite-title" className="text-3xl font-bold mb-4">
                {get('responsabilite-title', 'Responsabilité')}
              </h2>
              <div data-edit-block="mentions-legales.responsabilite-body" className="text-text-light leading-relaxed"
                dangerouslySetInnerHTML={{ __html: get('responsabilite-body') }} />
            </section>

            <section data-section="donnees">
              <h2 data-edit-block="mentions-legales.donnees-title" className="text-3xl font-bold mb-4">
                {get('donnees-title', 'Données personnelles')}
              </h2>
              <div data-edit-block="mentions-legales.donnees-body" className="text-text-light leading-relaxed"
                dangerouslySetInnerHTML={{ __html: get('donnees-body') }} />
            </section>

            <section data-section="contact">
              <h2 data-edit-block="mentions-legales.contact-title" className="text-3xl font-bold mb-4">
                {get('contact-title', 'Contact')}
              </h2>
              <div data-edit-block="mentions-legales.contact-body" className="text-text-light leading-relaxed"
                dangerouslySetInnerHTML={{ __html: get('contact-body') }} />
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p data-edit-block="mentions-legales.last-update" className="text-sm text-text-muted text-center">
              {get('last-update', 'Dernière mise à jour : Mars 2026')}
            </p>
          </div>
        </div>
      </div>

      <InsertZone pageKey="mentions-legales" slot="page-bottom" afterOrder={900} />
      <DynamicBlockSlot pageKey="mentions-legales" slot="page-bottom" />
    </main>
  );
}
