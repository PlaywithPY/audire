'use client';

import AllPageImageEffects from "@/components/AllPageImageEffects";
import DynamicBlockRenderer from "@/components/DynamicBlockRenderer";
import { useState, useEffect } from "react";

interface PageTexts {
  [key: string]: string;
}

export default function Remboursements() {
  const [texts, setTexts] = useState<PageTexts>({});

  useEffect(() => {
    async function loadTexts() {
      try {
        const res = await fetch('/api/page-texts?pageKey=remboursements');
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
      <main className="min-h-screen">
        {/* Hero Section */}
        <section data-section="hero" className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                {texts['hero-kicker'] || 'Financement'}
              </span>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                {texts['hero-title'] || 'Remboursements'}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                {texts['hero-description'] || 'Chez Audire, nous vous accompagnons dans toutes les démarches administratives. Vous comprenez exactement ce que vous allez payer, sans surprise.'}
              </p>
            </div>
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block bg-secondary text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
                {texts['section-1-kicker'] || 'Simplicité'}
              </span>
              <h2 className="text-4xl font-bold mb-4">{texts['section-1-title'] || 'Comment ça marche ?'}</h2>
              <p className="text-xl text-text-light max-w-3xl mx-auto">
                {texts['section-1-description'] || 'Le système de remboursement belge est parfois complexe. Nous vous expliquons tout, étape par étape.'}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  step: '1',
                  title: texts['step-1-title'] || 'Prescription médicale',
                  desc: texts['step-1-desc'] || 'Votre médecin ORL vous prescrit un appareil auditif. Nous vous aidons à obtenir cette prescription si besoin.',
                },
                {
                  step: '2',
                  title: texts['step-2-title'] || 'Intervention INAMI',
                  desc: texts['step-2-desc'] || 'L\'INAMI rembourse une partie du coût de votre appareil auditif selon votre âge et votre perte auditive.',
                },
                {
                  step: '3',
                  title: texts['step-3-title'] || 'Intervention mutuelle',
                  desc: texts['step-3-desc'] || 'Votre mutuelle peut intervenir en complément pour réduire votre reste à charge.',
                },
              ].map((item) => (
                <div key={item.step} className="bg-bg p-8 rounded-2xl hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-text-light">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Montants INAMI */}
        <section data-section="inami" className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">{texts['section-2-title'] || 'Interventions INAMI'}</h2>
              <p className="text-xl text-text-light max-w-3xl mx-auto">
                {texts['section-2-description'] || 'L\'INAMI intervient différemment selon votre âge et votre situation.'}
              </p>
            </div>

            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Catégorie</th>
                    <th className="px-6 py-4 text-left">Intervention INAMI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-bg transition-colors">
                    <td className="px-6 py-4">
                      <strong>Moins de 18 ans</strong>
                      <p className="text-sm text-text-muted">Enfants et adolescents</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-primary">
                      Jusqu'à 1.400 € par oreille
                    </td>
                  </tr>
                  <tr className="hover:bg-bg transition-colors">
                    <td className="px-6 py-4">
                      <strong>18 - 65 ans</strong>
                      <p className="text-sm text-text-muted">Adultes actifs</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-primary">
                      Jusqu'à 800 € par oreille
                    </td>
                  </tr>
                  <tr className="hover:bg-bg transition-colors">
                    <td className="px-6 py-4">
                      <strong>Plus de 65 ans</strong>
                      <p className="text-sm text-text-muted">Seniors</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-primary">
                      Jusqu'à 1.400 € par oreille
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-center mt-8 text-text-muted">
              Ces montants sont indicatifs et peuvent varier selon votre situation. Nous vous donnons un devis personnalisé lors de votre rendez-vous.
            </p>
          </div>
        </section>

        {/* Transparence */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-secondary border-l-4 border-primary p-8 rounded-xl">
                <h3 className="text-2xl font-bold mb-4">{texts['engagement-title'] || '💙 Notre engagement : transparence totale'}</h3>
                <p className="text-text-light mb-4">
                  {texts['engagement-intro'] || 'Chez Audire, vous savez exactement ce que vous allez payer avant de vous engager. Nous vous fournissons un devis détaillé avec :'}
                </p>
                <ul className="space-y-2 text-text-light">
                  <li>{texts['engagement-item-1'] || '✅ Le prix de l\'appareil'}</li>
                  <li>{texts['engagement-item-2'] || '✅ L\'intervention INAMI'}</li>
                  <li>{texts['engagement-item-3'] || '✅ L\'intervention de votre mutuelle'}</li>
                  <li>{texts['engagement-item-4'] || '✅ Votre reste à charge final'}</li>
                </ul>
                <p className="text-text-light mt-4">
                  {texts['engagement-conclusion'] || 'Aucune surprise, aucun frais caché. C\'est notre promesse.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">{texts['cta-title'] || 'Une question sur les remboursements ?'}</h2>
            <p className="text-xl text-text-light mb-8 max-w-2xl mx-auto">
              {texts['cta-description'] || 'Nous sommes là pour vous aider. Prenez rendez-vous et nous vous expliquerons tout en détail.'}
            </p>
            <a
              href="/contact"
              className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-dark transition-all shadow-lg"
            >
              📞 Nous contacter
            </a>
          </div>
        </section>

        <DynamicBlockRenderer pageKey="remboursements" />
        {/* Image Effects */}
        <AllPageImageEffects pageKey="remboursements" />
      </main>
    </>
  );
}
