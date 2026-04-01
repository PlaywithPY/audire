import Link from "next/link";

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

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Kicker avec animation */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-fade-in">
            <svg className="w-4 h-4 animate-pulse-slow" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
            </svg>
            <span className="text-sm font-medium">{texts['hero-kicker'] || 'Centre auditif indépendant • Province de Liège'}</span>
          </div>

          {/* Titre principal avec animation */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up delay-100 leading-tight">
            {texts['hero-title'] || 'Mieux entendre, simplement.'}
          </h1>

          {/* Description avec animation */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed animate-fade-in-up delay-200 max-w-3xl mx-auto">
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
              <span>Prendre rendez-vous</span>
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
              <span>Nous contacter</span>
            </Link>
          </div>

          {/* Message de réassurance avec animation */}
          <div className="animate-fade-in delay-500 bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-white/20">
            <div className="text-center text-white/90">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-5 h-5 text-yellow-300 animate-pulse-slow flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-base font-semibold">Vous hésitez ?</span>
              </div>
              <p className="text-sm leading-relaxed">
                Venez juste faire le point. Parfois la meilleure réponse est "pas maintenant" — et on vous le dira.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vague décorative en bas avec dégradé vers transparent */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'white', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <path d="M0 50L60 45C120 40 240 30 360 35C480 40 600 60 720 65C840 70 960 60 1080 50C1200 40 1320 30 1380 25L1440 20V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V50Z" fill="url(#waveGradient)"/>
        </svg>
      </div>
    </section>
  );
}
