'use client';

import AllPageImageEffects from '@/components/AllPageImageEffects';
import DynamicBlockSlot from '@/components/DynamicBlockSlot';
import InsertZone from '@/components/admin/InsertZone';
import { useState, useEffect } from 'react';

interface PageTexts {
  [key: string]: string;
}

export default function Remboursements() {
  const [texts, setTexts] = useState<PageTexts>({});

  useEffect(() => {
    async function loadTexts() {
      try {
        const res = await fetch('/api/page-texts?pageKey=remboursements');
        if (res.ok) setTexts(await res.json());
      } catch (error) {
        console.error('Error loading page texts:', error);
      }
    }
    loadTexts();
  }, []);

  return (
    <>
      <main className="min-h-screen">
        <InsertZone pageKey="remboursements" slot="page-top" afterOrder={0} />
        <DynamicBlockSlot pageKey="remboursements" slot="page-top" />

        {/* Hero Section */}
        <section data-section="hero" className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <span
                data-edit-block="remboursements.hero-kicker"
                className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6"
              >
                {texts['hero-kicker'] || 'Financement'}
              </span>
              <h1 data-edit-block="remboursements.hero-title" className="text-5xl md:text-6xl font-bold mb-6">
                {texts['hero-title'] || 'Remboursements'}
              </h1>
              <p
                data-edit-block="remboursements.hero-description"
                className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed"
              >
                {texts['hero-description'] ||
                  'Chez Audire, nous vous accompagnons dans toutes les démarches administratives. Vous comprenez exactement ce que vous allez payer, sans surprise.'}
              </p>
            </div>
          </div>
        </section>

        <InsertZone pageKey="remboursements" slot="after-hero" afterOrder={100} />
        <DynamicBlockSlot pageKey="remboursements" slot="after-hero" />

        {/* Comment ça marche */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span
                data-edit-block="remboursements.section-1-kicker"
                className="inline-block bg-secondary text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4"
              >
                {texts['section-1-kicker'] || 'Simplicité'}
              </span>
              <h2 data-edit-block="remboursements.section-1-title" className="text-4xl font-bold mb-4">
                {texts['section-1-title'] || 'Comment ça marche ?'}
              </h2>
              <p
                data-edit-block="remboursements.section-1-description"
                className="text-xl text-text-light max-w-3xl mx-auto"
              >
                {texts['section-1-description'] ||
                  'Le système de remboursement belge est parfois complexe. Nous vous expliquons tout, étape par étape.'}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  step: '1',
                  defaultTitle: 'Prescription médicale',
                  defaultDesc: 'Votre médecin ORL vous prescrit un appareil auditif. Nous vous aidons à obtenir cette prescription si besoin.',
                },
                {
                  step: '2',
                  defaultTitle: 'Intervention INAMI',
                  defaultDesc: "L'INAMI rembourse une partie du coût de votre appareil auditif selon votre âge et votre perte auditive.",
                },
                {
                  step: '3',
                  defaultTitle: 'Intervention mutuelle',
                  defaultDesc: 'Votre mutuelle peut intervenir en complément pour réduire votre reste à charge.',
                },
              ].map((item) => (
                <div key={item.step} className="bg-bg p-8 rounded-2xl hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3
                    data-edit-block={`remboursements.step-${item.step}-title`}
                    className="text-2xl font-bold mb-4"
                  >
                    {texts[`step-${item.step}-title`] || item.defaultTitle}
                  </h3>
                  <p data-edit-block={`remboursements.step-${item.step}-desc`} className="text-text-light">
                    {texts[`step-${item.step}-desc`] || item.defaultDesc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <InsertZone pageKey="remboursements" slot="after-comment" afterOrder={200} />
        <DynamicBlockSlot pageKey="remboursements" slot="after-comment" />

        {/* Montants INAMI */}
        <section data-section="inami" className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 data-edit-block="remboursements.section-2-title" className="text-4xl font-bold mb-4">
                {texts['section-2-title'] || 'Interventions INAMI'}
              </h2>
              <p
                data-edit-block="remboursements.section-2-description"
                className="text-xl text-text-light max-w-3xl mx-auto"
              >
                {texts['section-2-description'] ||
                  "L'INAMI intervient différemment selon votre âge et votre situation."}
              </p>
            </div>

            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-primary text-white">
                  <tr>
                    <th data-edit-block="remboursements.table-head-1" className="px-6 py-4 text-left">
                      {texts['table-head-1'] || 'Catégorie'}
                    </th>
                    <th data-edit-block="remboursements.table-head-2" className="px-6 py-4 text-left">
                      {texts['table-head-2'] || 'Intervention INAMI'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { n: 1, defaultCat: 'Moins de 18 ans', defaultSub: 'Enfants et adolescents', defaultAmount: "Jusqu'à 1.400 € par oreille" },
                    { n: 2, defaultCat: '18 - 65 ans', defaultSub: 'Adultes actifs', defaultAmount: "Jusqu'à 800 € par oreille" },
                    { n: 3, defaultCat: 'Plus de 65 ans', defaultSub: 'Seniors', defaultAmount: "Jusqu'à 1.400 € par oreille" },
                  ].map((row) => (
                    <tr key={row.n} className="hover:bg-bg transition-colors">
                      <td className="px-6 py-4">
                        <strong data-edit-block={`remboursements.row-${row.n}-cat`}>
                          {texts[`row-${row.n}-cat`] || row.defaultCat}
                        </strong>
                        <p
                          data-edit-block={`remboursements.row-${row.n}-sub`}
                          className="text-sm text-text-muted"
                        >
                          {texts[`row-${row.n}-sub`] || row.defaultSub}
                        </p>
                      </td>
                      <td
                        data-edit-block={`remboursements.row-${row.n}-amount`}
                        className="px-6 py-4 font-semibold text-primary"
                      >
                        {texts[`row-${row.n}-amount`] || row.defaultAmount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p data-edit-block="remboursements.table-disclaimer" className="text-center mt-8 text-text-muted">
              {texts['table-disclaimer'] ||
                'Ces montants sont indicatifs et peuvent varier selon votre situation. Nous vous donnons un devis personnalisé lors de votre rendez-vous.'}
            </p>
          </div>
        </section>

        <InsertZone pageKey="remboursements" slot="after-inami" afterOrder={300} />
        <DynamicBlockSlot pageKey="remboursements" slot="after-inami" />

        {/* Transparence */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-secondary border-l-4 border-primary p-8 rounded-xl">
                <h3 data-edit-block="remboursements.engagement-title" className="text-2xl font-bold mb-4">
                  {texts['engagement-title'] || '💙 Notre engagement : transparence totale'}
                </h3>
                <p data-edit-block="remboursements.engagement-intro" className="text-text-light mb-4">
                  {texts['engagement-intro'] ||
                    "Chez Audire, vous savez exactement ce que vous allez payer avant de vous engager. Nous vous fournissons un devis détaillé avec :"}
                </p>
                <ul className="space-y-2 text-text-light">
                  {[1, 2, 3, 4].map((n) => {
                    const defaults: Record<number, string> = {
                      1: "✅ Le prix de l'appareil",
                      2: "✅ L'intervention INAMI",
                      3: "✅ L'intervention de votre mutuelle",
                      4: '✅ Votre reste à charge final',
                    };
                    return (
                      <li key={n} data-edit-block={`remboursements.engagement-item-${n}`}>
                        {texts[`engagement-item-${n}`] || defaults[n]}
                      </li>
                    );
                  })}
                </ul>
                <p
                  data-edit-block="remboursements.engagement-conclusion"
                  className="text-text-light mt-4"
                >
                  {texts['engagement-conclusion'] || "Aucune surprise, aucun frais caché. C'est notre promesse."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <InsertZone pageKey="remboursements" slot="before-cta" afterOrder={400} />
        <DynamicBlockSlot pageKey="remboursements" slot="before-cta" />

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
          <div className="container mx-auto px-4 text-center">
            <h2 data-edit-block="remboursements.cta-title" className="text-4xl font-bold mb-4">
              {texts['cta-title'] || 'Une question sur les remboursements ?'}
            </h2>
            <p
              data-edit-block="remboursements.cta-description"
              className="text-xl text-text-light mb-8 max-w-2xl mx-auto"
            >
              {texts['cta-description'] ||
                'Nous sommes là pour vous aider. Prenez rendez-vous et nous vous expliquerons tout en détail.'}
            </p>
            <a
              href="/contact"
              data-edit-block="remboursements.cta-button"
              className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-dark transition-all shadow-lg"
            >
              {texts['cta-button'] || '📞 Nous contacter'}
            </a>
          </div>
        </section>

        <InsertZone pageKey="remboursements" slot="page-bottom" afterOrder={9000} />
        <DynamicBlockSlot pageKey="remboursements" slot="page-bottom" />

        {/* Image Effects */}
        <AllPageImageEffects pageKey="remboursements" />
      </main>
    </>
  );
}
