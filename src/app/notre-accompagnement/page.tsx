'use client';

import CardIcon from '@/components/CardIcon';
import AllPageImageEffects from '@/components/AllPageImageEffects';
import DynamicBlockSlot from '@/components/DynamicBlockSlot';
import InsertZone from '@/components/admin/InsertZone';
import { useState, useEffect } from 'react';

interface PageTexts {
  [key: string]: string;
}

const STEPS = [
  { n: 1, key: 'contact',   icon: '👋', defaultTitle: 'Premier contact',         defaultDesc: "Vous nous appelez ou vous venez nous voir. On discute de votre situation, sans engagement. Parfois la meilleure réponse est \"pas maintenant\" — et on vous le dira." },
  { n: 2, key: 'test',      icon: '🎧', defaultTitle: 'Test auditif gratuit',    defaultDesc: 'Un test complet de 30 minutes pour comprendre votre audition. On vous explique les résultats avec des mots simples, pas du jargon médical.' },
  { n: 3, key: 'conseil',   icon: '💬', defaultTitle: 'Conseil personnalisé',    defaultDesc: 'On vous propose une ou plusieurs solutions adaptées à votre situation et à votre budget. Pas de vente forcée, juste des conseils honnêtes.' },
  { n: 4, key: 'essai',     icon: '🔍', defaultTitle: 'Essai sans engagement',   defaultDesc: "Vous testez les appareils dans votre quotidien. Au travail, en famille, dans le bruit... C'est comme ça qu'on sait si ça marche vraiment." },
  { n: 5, key: 'reglages',  icon: '🔧', defaultTitle: 'Réglages progressifs',    defaultDesc: "L'adaptation prend du temps. On se voit régulièrement pour affiner les réglages jusqu'à ce que ce soit parfait pour vous." },
  { n: 6, key: 'suivi',     icon: '🤝', defaultTitle: 'Suivi dans la durée',     defaultDesc: "Même après l'achat, on reste là. Entretien, nettoyage, petits réglages... On vous accompagne aussi longtemps que nécessaire." },
];

const VALUES = [
  { n: 1, key: 'independance',  icon: '🎯', defaultTitle: 'Indépendance',  defaultDesc: 'Nous sommes un centre indépendant, sans objectifs de vente imposés. Notre seul but : vous aider à mieux entendre.' },
  { n: 2, key: 'transparence',  icon: '💎', defaultTitle: 'Transparence',  defaultDesc: 'Prix clairs, remboursements expliqués, pas de frais cachés. Vous savez exactement ce que vous payez.' },
  { n: 3, key: 'disponibilite', icon: '⚡', defaultTitle: 'Disponibilité', defaultDesc: "Un problème ? Une question ? On est là. Pas besoin d'attendre 3 semaines pour un rendez-vous." },
  { n: 4, key: 'proximite',     icon: '💙', defaultTitle: 'Proximité',     defaultDesc: 'On prend le temps de vous écouter, de comprendre vos besoins et de vous accompagner vraiment.' },
];

export default function NotreAccompagnement() {
  const [texts, setTexts] = useState<PageTexts>({});

  useEffect(() => {
    fetch('/api/page-texts?pageKey=notre-accompagnement')
      .then((r) => (r.ok ? r.json() : {}))
      .then(setTexts)
      .catch((e) => console.error('Error loading page texts:', e));
  }, []);

  return (
    <main className="min-h-screen">
      <InsertZone pageKey="notre-accompagnement" slot="page-top" afterOrder={0} />
      <DynamicBlockSlot pageKey="notre-accompagnement" slot="page-top" />

      {/* Hero */}
      <section data-section="hero" className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span data-edit-block="notre-accompagnement.hero-kicker"
              className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              {texts['hero-kicker'] || 'Notre méthode'}
            </span>
            <h1 data-edit-block="notre-accompagnement.hero-title" className="text-5xl md:text-6xl font-bold mb-6">
              {texts['hero-title'] || 'Notre accompagnement'}
            </h1>
            <p data-edit-block="notre-accompagnement.hero-description"
              className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              {texts['hero-description'] ||
                "Chez Audire, vous n'êtes pas un numéro. Nous prenons le temps de comprendre votre quotidien, vos difficultés et vos attentes pour vous proposer un accompagnement vraiment personnalisé."}
            </p>
          </div>
        </div>
      </section>

      <InsertZone pageKey="notre-accompagnement" slot="after-hero" afterOrder={100} />
      <DynamicBlockSlot pageKey="notre-accompagnement" slot="after-hero" />

      <AllPageImageEffects pageKey="notre-accompagnement" />

      {/* Notre approche */}
      <section data-section="processus" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span data-edit-block="notre-accompagnement.section-1-kicker"
              className="inline-block bg-secondary text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              {texts['section-1-kicker'] || 'Étape par étape'}
            </span>
            <h2 data-edit-block="notre-accompagnement.section-1-title" className="text-4xl font-bold mb-4">
              {texts['section-1-title'] || 'Comment ça se passe ?'}
            </h2>
            <p data-edit-block="notre-accompagnement.section-1-description"
              className="text-xl text-text-light max-w-3xl mx-auto">
              {texts['section-1-description'] || 'Un accompagnement en plusieurs étapes, à votre rythme et sans pression.'}
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-8">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-6 items-start bg-bg p-8 rounded-2xl hover:shadow-lg transition-all">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold">{s.n}</div>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-3">
                    <CardIcon cardKey={`approach-step-${s.key}`} defaultEmoji={s.icon} size={48} />
                    <h3 data-edit-block={`notre-accompagnement.step-${s.n}-title`} className="text-2xl font-bold">
                      {texts[`step-${s.n}-title`] || s.defaultTitle}
                    </h3>
                  </div>
                  <p data-edit-block={`notre-accompagnement.step-${s.n}-desc`} className="text-text-light text-lg leading-relaxed">
                    {texts[`step-${s.n}-desc`] || s.defaultDesc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <InsertZone pageKey="notre-accompagnement" slot="after-processus" afterOrder={200} />
      <DynamicBlockSlot pageKey="notre-accompagnement" slot="after-processus" />

      {/* Ce qui nous différencie */}
      <section data-section="valeurs" className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 data-edit-block="notre-accompagnement.section-2-title" className="text-4xl font-bold mb-4">
              {texts['section-2-title'] || 'Ce qui nous différencie'}
            </h2>
            <p data-edit-block="notre-accompagnement.section-2-description" className="text-xl text-text-light max-w-3xl mx-auto">
              {texts['section-2-description'] || 'Pourquoi nos clients nous recommandent à leurs proches ?'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {VALUES.map((v) => (
              <div key={v.n} className="bg-white p-8 rounded-2xl hover:shadow-lg transition-all">
                <div className="mb-4">
                  <CardIcon cardKey={`approach-${v.key}`} defaultEmoji={v.icon} size={48} />
                </div>
                <h3 data-edit-block={`notre-accompagnement.value-${v.n}-title`} className="text-2xl font-bold mb-3">
                  {texts[`value-${v.n}-title`] || v.defaultTitle}
                </h3>
                <p data-edit-block={`notre-accompagnement.value-${v.n}-desc`} className="text-text-light leading-relaxed">
                  {texts[`value-${v.n}-desc`] || v.defaultDesc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <InsertZone pageKey="notre-accompagnement" slot="after-valeurs" afterOrder={300} />
      <DynamicBlockSlot pageKey="notre-accompagnement" slot="after-valeurs" />

      {/* Témoignage */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-secondary border-l-4 border-primary p-8 rounded-xl">
              <div className="text-5xl mb-4">💬</div>
              <blockquote data-edit-block="notre-accompagnement.testimonial-quote"
                className="text-xl text-text-light italic mb-4 leading-relaxed">
                {texts['testimonial-quote'] ||
                  "\"Ce que j'ai apprécié chez Audire, c'est qu'on a pris le temps de m'écouter. Pas de pression, pas de vente forcée. Juste des conseils honnêtes et un suivi régulier pour adapter mes appareils. Aujourd'hui je recommande Audire à tous mes amis.\""}
              </blockquote>
              <p data-edit-block="notre-accompagnement.testimonial-author" className="font-semibold">
                {texts['testimonial-author'] || '— Marie, 68 ans, Liège'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <InsertZone pageKey="notre-accompagnement" slot="before-cta" afterOrder={400} />
      <DynamicBlockSlot pageKey="notre-accompagnement" slot="before-cta" />

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
        <div className="container mx-auto px-4 text-center">
          <h2 data-edit-block="notre-accompagnement.cta-title" className="text-4xl font-bold mb-4">
            {texts['cta-title'] || 'Prêt à commencer ?'}
          </h2>
          <p data-edit-block="notre-accompagnement.cta-description" className="text-xl text-text-light mb-8 max-w-2xl mx-auto">
            {texts['cta-description'] || 'Prenez rendez-vous pour un test auditif gratuit et sans engagement.'}
          </p>
          <a href="/prendre-rendez-vous"
            data-edit-block="notre-accompagnement.cta-button"
            className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-dark transition-all shadow-lg">
            {texts['cta-button'] || '📅 Réserver maintenant'}
          </a>
        </div>
      </section>

      <InsertZone pageKey="notre-accompagnement" slot="page-bottom" afterOrder={9000} />
      <DynamicBlockSlot pageKey="notre-accompagnement" slot="page-bottom" />
    </main>
  );
}
