'use client';

import AllPageImageEffects from '@/components/AllPageImageEffects';
import DynamicBlockSlot from '@/components/DynamicBlockSlot';
import InsertZone from '@/components/admin/InsertZone';
import { useState, useEffect } from 'react';

interface PageTexts {
  [key: string]: string;
}

export default function NotreHistoire() {
  const [texts, setTexts] = useState<PageTexts>({});

  useEffect(() => {
    async function loadTexts() {
      try {
        const res = await fetch('/api/page-texts?pageKey=notre-histoire');
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
        <InsertZone pageKey="notre-histoire" slot="page-top" afterOrder={0} />
        <DynamicBlockSlot pageKey="notre-histoire" slot="page-top" />

        {/* Hero Section */}
        <section data-section="hero" className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <span
                data-edit-block="notre-histoire.hero-kicker"
                className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6"
              >
                {texts['hero-kicker'] || 'Qui sommes-nous ?'}
              </span>
              <h1 data-edit-block="notre-histoire.hero-title" className="text-5xl md:text-6xl font-bold mb-6">
                {texts['hero-title'] || 'Notre Histoire'}
              </h1>
              <p
                data-edit-block="notre-histoire.hero-description"
                className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed"
              >
                {texts['hero-description'] ||
                  "L'histoire d'Audire, c'est avant tout une histoire de passion pour l'audition et d'engagement envers nos clients."}
              </p>
            </div>
          </div>
        </section>

        <InsertZone pageKey="notre-histoire" slot="after-hero" afterOrder={100} />
        <DynamicBlockSlot pageKey="notre-histoire" slot="after-hero" />

        {/* Image Effects */}
        <AllPageImageEffects pageKey="notre-histoire" />

        {/* Les débuts */}
        <section data-section="origines" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <span
                  data-edit-block="notre-histoire.section-1-kicker"
                  className="inline-block bg-secondary text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4"
                >
                  {texts['section-1-kicker'] || 'Nos origines'}
                </span>
                <h2 data-edit-block="notre-histoire.section-1-title" className="text-4xl font-bold mb-6">
                  {texts['section-1-title'] || "Les débuts d'Audire"}
                </h2>
              </div>

              <div className="prose prose-lg max-w-none">
                <div className="bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-2xl p-8 mb-8">
                  <div className="text-6xl mb-4 text-center">🎯</div>
                  <p
                    data-edit-block="notre-histoire.origines-text"
                    className="text-lg text-text-light leading-relaxed"
                  >
                    {texts['origines-text'] ||
                      "Audire est né d'une conviction simple : l'audition est essentielle au bien-être et à la qualité de vie, et chacun mérite un accompagnement personnalisé, transparent et de qualité. Fondé en province de Liège, notre centre auditif indépendant s'est construit autour de valeurs fortes : l'écoute, la proximité et l'honnêteté."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <InsertZone pageKey="notre-histoire" slot="after-origines" afterOrder={200} />
        <DynamicBlockSlot pageKey="notre-histoire" slot="after-origines" />

        {/* Notre vision */}
        <section data-section="vision" className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 data-edit-block="notre-histoire.section-2-title" className="text-4xl font-bold mb-6">
                  {texts['section-2-title'] || 'Notre vision'}
                </h2>
              </div>

              <div className="space-y-6">
                {[1, 2, 3].map((n) => {
                  const defaults: Record<number, { icon: string; title: string; text: string }> = {
                    1: {
                      icon: '💙',
                      title: "L'indépendance au cœur de notre approche",
                      text: "En tant que centre auditif indépendant, nous ne sommes liés à aucune chaîne ni réseau commercial. Cette liberté nous permet de toujours privilégier votre intérêt plutôt que des objectifs de vente. Nous travaillons avec des marques reconnues comme Oticon et Bernafon parce que nous croyons en leur qualité, pas parce qu'on nous l'impose.",
                    },
                    2: {
                      icon: '🤝',
                      title: 'La mutuelle : un partenaire essentiel',
                      text: "Nous savons que le coût des appareils auditifs peut représenter un investissement important. C'est pourquoi nous travaillons en étroite collaboration avec les mutuelles pour vous aider à bénéficier du meilleur remboursement possible. Nous prenons le temps de vous expliquer clairement les différentes aides disponibles, les démarches à suivre et le montant final que vous aurez à débourser.",
                    },
                    3: {
                      icon: '📋',
                      title: 'Transparence sur les prix et les remboursements',
                      text: "Pas de surprises, pas de frais cachés. Dès le premier rendez-vous, nous vous communiquons les prix réels de nos appareils auditifs et nous calculons ensemble le montant de votre remboursement mutuelle. Vous savez exactement ce que vous allez payer avant de prendre votre décision.",
                    },
                  };
                  const d = defaults[n];
                  return (
                    <div key={n} className="bg-white rounded-2xl p-8 shadow-lg">
                      <div className="flex items-start gap-6">
                        <div className="text-5xl flex-shrink-0">{d.icon}</div>
                        <div>
                          <h3
                            data-edit-block={`notre-histoire.vision-${n}-title`}
                            className="text-2xl font-bold mb-3"
                          >
                            {texts[`vision-${n}-title`] || d.title}
                          </h3>
                          <p
                            data-edit-block={`notre-histoire.vision-${n}-text`}
                            className="text-text-light leading-relaxed text-lg"
                          >
                            {texts[`vision-${n}-text`] || d.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <InsertZone pageKey="notre-histoire" slot="after-vision" afterOrder={300} />
        <DynamicBlockSlot pageKey="notre-histoire" slot="after-vision" />

        {/* Nos valeurs */}
        <section data-section="valeurs" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 data-edit-block="notre-histoire.section-3-title" className="text-4xl font-bold mb-6">
                  {texts['section-3-title'] || 'Ce qui nous guide au quotidien'}
                </h2>
                <p
                  data-edit-block="notre-histoire.section-3-description"
                  className="text-xl text-text-light max-w-3xl mx-auto"
                >
                  {texts['section-3-description'] ||
                    "Des valeurs qui ne sont pas que des mots, mais qui guident chacune de nos actions."}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { n: 1, icon: '👂', title: "L'écoute avant tout", desc: 'Nous prenons le temps de comprendre votre quotidien, vos difficultés et vos attentes.' },
                  { n: 2, icon: '🎯', title: 'Des conseils honnêtes', desc: 'Si la meilleure réponse est "pas maintenant", nous vous le dirons.' },
                  { n: 3, icon: '🔧', title: 'Un suivi dans la durée', desc: "L'accompagnement ne s'arrête pas après l'achat, nous restons à vos côtés." },
                  { n: 4, icon: '💎', title: 'La qualité sans compromis', desc: 'Nous sélectionnons les meilleures solutions auditives pour nos clients.' },
                ].map((item) => (
                  <div key={item.n} className="bg-gradient-to-br from-primary/5 to-primary-light/5 rounded-xl p-6 hover:shadow-lg transition-all">
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <h3
                      data-edit-block={`notre-histoire.value-${item.n}-title`}
                      className="text-xl font-bold mb-2"
                    >
                      {texts[`value-${item.n}-title`] || item.title}
                    </h3>
                    <p data-edit-block={`notre-histoire.value-${item.n}-desc`} className="text-text-light">
                      {texts[`value-${item.n}-desc`] || item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <InsertZone pageKey="notre-histoire" slot="after-valeurs" afterOrder={400} />
        <DynamicBlockSlot pageKey="notre-histoire" slot="after-valeurs" />

        {/* Aujourd'hui */}
        <section data-section="aujourd-hui" className="py-20 bg-gradient-to-br from-primary/10 to-primary-light/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 data-edit-block="notre-histoire.section-4-title" className="text-4xl font-bold mb-6">
                {texts['section-4-title'] || "Audire aujourd'hui"}
              </h2>
              <p
                data-edit-block="notre-histoire.aujourd-hui-text"
                className="text-xl text-text-light leading-relaxed mb-8"
              >
                {texts['aujourd-hui-text'] ||
                  "Aujourd'hui, Audire continue de grandir grâce à la confiance que vous nous accordez. Chaque jour, nous accueillons des personnes de tous âges qui cherchent à mieux entendre et à retrouver le plaisir des conversations, de la musique et des moments en famille. Notre engagement reste le même : vous offrir un accompagnement humain, professionnel et transparent, du premier test auditif jusqu'au suivi à long terme de vos appareils."}
              </p>
              <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-full">
                <span className="text-3xl">🌟</span>
                <span data-edit-block="notre-histoire.slogan" className="font-semibold text-lg">
                  {texts['slogan'] || 'Mieux entendre, simplement.'}
                </span>
              </div>
            </div>
          </div>
        </section>

        <InsertZone pageKey="notre-histoire" slot="before-cta" afterOrder={500} />
        <DynamicBlockSlot pageKey="notre-histoire" slot="before-cta" />

        {/* CTA */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 data-edit-block="notre-histoire.cta-title" className="text-4xl font-bold mb-4">
              {texts['cta-title'] || "Envie d'en savoir plus ?"}
            </h2>
            <p
              data-edit-block="notre-histoire.cta-description"
              className="text-xl text-text-light mb-8 max-w-2xl mx-auto"
            >
              {texts['cta-description'] ||
                'Venez nous rencontrer pour découvrir notre approche et faire un test auditif gratuit.'}
            </p>
            <a
              href="/prendre-rendez-vous"
              data-edit-block="notre-histoire.cta-button"
              className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-dark transition-all shadow-lg"
            >
              {texts['cta-button'] || '📅 Prendre rendez-vous'}
            </a>
          </div>
        </section>

        <InsertZone pageKey="notre-histoire" slot="page-bottom" afterOrder={9000} />
        <DynamicBlockSlot pageKey="notre-histoire" slot="page-bottom" />
      </main>
    </>
  );
}
