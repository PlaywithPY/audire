import Link from "next/link";
import BlockLayoutWrapper from "@/components/BlockLayoutWrapper";

interface HeroModernProps {
  texts: { [key: string]: string };
}

export default function HeroModern({ texts }: HeroModernProps) {
  return (
    <section data-section="hero" className="relative bg-gradient-to-br from-primary via-primary to-primary-dark text-white py-20 md:py-28 overflow-hidden">
      {/* Bulles décoratives animées */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="bubble w-64 h-64 top-10 -left-20 animate-float opacity-20"></div>
        <div className="bubble w-96 h-96 top-40 -right-32 animate-float delay-200 opacity-15"></div>
        <div className="bubble w-48 h-48 bottom-20 left-1/4 animate-float delay-300 opacity-20"></div>
        <div className="bubble w-80 h-80 bottom-10 right-1/4 animate-float delay-100 opacity-10"></div>
      </div>
      {/* ↑ Le « A » parasite qui était là a été retiré (rendait un « A » visible sur la page). */}

      {/* Vague décorative en bas */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg
          className="w-full h-24 md:h-32"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,80 Q300,20 600,80 T1200,80"
            stroke="white"
            strokeWidth="3"
            fill="none"
            opacity="0.1"
            className="animate-pulse-slow"
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Kicker avec animation */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-fade-in">
            <svg className="w-4 h-4 animate-pulse-slow" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
            </svg>
            <span data-edit-block="home.hero-kicker" className="text-sm font-medium">
              {texts['hero-kicker'] || 'Centre auditif indépendant • Province de Liège'}
            </span>
          </div>

          {/* Titre principal avec animation */}
          <h1 data-edit-block="home.hero-title" className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up delay-100 leading-tight">
            {texts['hero-title'] || 'Mieux entendre, simplement.'}
          </h1>

          {/* Description avec animation */}
          <p data-edit-block="home.description-1" className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed animate-fade-in-up delay-200 max-w-3xl mx-auto">
            {texts['description-1'] || 'Chez Audire, on commence par comprendre votre quotidien et vos difficultés. Puis on vous propose une suite claire et sans pression. Test auditif gratuit, explications pédagogiques, réglages et suivi dans la durée.'}
          </p>

          {/* Chips avec animations en cascade */}
          <div className="flex flex-wrap gap-3 justify-center mb-10">
            {[
              { key: 'chip-1', default: 'Test gratuit et sans engagement', icon: '✓' },
              { key: 'chip-2', default: 'Explications claires, sans jargon', icon: '💬' },
              { key: 'chip-3', default: 'Oticon & Bernafon', icon: '🎧' },
              { key: 'chip-4', default: 'Suivi personnalisé', icon: '👤' }
            ].map((chip, index) => (
              <span
                key={chip.key}
                data-edit-block={`home.${chip.key}`}
                className={`bg-white/15 backdrop-blur-md px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/25 transition-all hover-lift animate-fade-in delay-${(index + 3) * 100}`}
                style={{ animationDelay: `${(index + 3) * 0.1}s` }}
              >
                <span className="mr-2">{chip.icon}</span>
                {texts[chip.key] || chip.default}
              </span>
            ))}
          </div>

          {/* Boutons CTA avec animations et icônes SVG */}
          <div className="flex flex-wrap gap-4 justify-center mb-8 animate-fade-in-up delay-500">
            <Link
              href="/prendre-rendez-vous"
              className="group bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-white/95 transition-all shadow-2xl hover-lift inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span data-edit-block="home.hero-cta-primary">
                {texts['hero-cta-primary'] || 'Prendre rendez-vous'}
              </span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="group bg-white/15 backdrop-blur-md text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/25 transition-all border-2 border-white/30 hover-glow inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span data-edit-block="home.hero-cta-secondary">
                {texts['hero-cta-secondary'] || 'Nous contacter'}
              </span>
            </Link>
          </div>

          {/* ─── Message de réassurance — wrappé pour édition de la mise en page ─── */}
          <BlockLayoutWrapper
            blockKey="home.hero-reassure-block"
            defaultMaxWidth="3xl"
            defaultPadding="normal"
            className="animate-fade-in delay-500 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
          >
            <div data-edit-block="home.hero-reassure-block" className="text-center text-white/90">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-5 h-5 text-yellow-300 animate-pulse-slow flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span data-edit-block="home.hero-reassure-title" className="text-base font-semibold">
                  {texts['hero-reassure-title'] || 'Vous hésitez ?'}
                </span>
              </div>
              <p data-edit-block="home.hero-reassure-text" className="text-sm leading-relaxed">
                {texts['hero-reassure-text'] || 'Venez juste faire le point. Parfois la meilleure réponse est "pas maintenant" — et on vous le dira.'}
              </p>
            </div>
          </BlockLayoutWrapper>
        </div>
      </div>
    </section>
  );
}
