import Link from "next/link";

interface HeroClassicProps {
  texts: { [key: string]: string };
}

export default function HeroClassic({ texts }: HeroClassicProps) {
  return (
    <section data-section="hero" className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <span className="text-sm font-medium">{texts['hero-kicker'] || 'Centre auditif indépendant • Province de Liège'}</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {texts['hero-title'] || 'Mieux entendre, simplement.'}
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            {texts['description-1'] || 'Chez Audire, on commence par comprendre votre quotidien et vos difficultés. Puis on vous propose une suite claire et sans pression. Test auditif gratuit, explications pédagogiques, réglages et suivi dans la durée.'}
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {[
              { key: 'chip-1', default: 'Test gratuit et sans engagement' },
              { key: 'chip-2', default: 'Explications claires, sans jargon' },
              { key: 'chip-3', default: 'Oticon & Bernafon' },
              { key: 'chip-4', default: 'Suivi personnalisé' }
            ].map((chip) => (
              <span key={chip.key} className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                {texts[chip.key] || chip.default}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/prendre-rendez-vous"
              className="bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg"
            >
              📅 Prendre rendez-vous
            </Link>
            <Link
              href="/contact"
              className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all"
            >
              📞 Nous contacter
            </Link>
          </div>

          <p className="mt-6 text-sm text-white/70">
            Vous hésitez ? Venez juste faire le point. Parfois la meilleure réponse est "pas maintenant" — et on vous le dira.
          </p>
        </div>
      </div>
    </section>
  );
}
