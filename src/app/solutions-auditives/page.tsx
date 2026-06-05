'use client';

import ImageFeatureCard from "@/components/ImageFeatureCard";
import AllPageImageEffects from "@/components/AllPageImageEffects";
import DynamicBlockSlot from "@/components/DynamicBlockSlot";
import InsertZone from "@/components/admin/InsertZone";
import { useState, useEffect } from "react";
import { CardData } from "@/lib/card-helpers";

interface PageTexts { [key: string]: string; }

interface DeviceLink { name: string; url: string; imageUrl?: string; }

interface SolutionData {
  id: string; title: string; icon: string; shortDesc: string; fullDesc: string; image: string;
  backgroundColor?: string; pros: string[]; cons: string[];
  deviceLinks?: DeviceLink[]; showDeviceLinks?: boolean;
  accessoryLinks?: DeviceLink[]; showAccessoryLinks?: boolean;
}

interface SolutionDetail {
  id: number; solutionKey: string; fullDesc: string; detailImage: string | null;
  detailEmoji: string; backgroundColor: string | null; pros: string[]; cons: string[];
  deviceLinks: DeviceLink[]; showDeviceLinks: boolean;
  accessoryLinks: DeviceLink[]; showAccessoryLinks: boolean;
}

function SolutionCard({ solution, cardData, onToggle, isActive }: {
  solution: SolutionData; cardData?: CardData; onToggle: () => void; isActive: boolean;
}) {
  return (
    <button onClick={onToggle}
      className={`bg-white rounded-2xl shadow-md overflow-hidden text-left hover:shadow-xl transition-all duration-300 ${isActive ? 'ring-2 ring-primary shadow-xl' : ''}`}>
      {cardData?.imageSrc ? (
        <div className="h-48 bg-gray-100 overflow-hidden">
          <img src={cardData.imageSrc} alt={cardData.imageAlt || solution.title}
            className="w-full h-full object-contain" style={{ objectPosition: cardData.imagePosition }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary-light/10">
          <div className="text-7xl animate-float">{solution.icon}</div>
        </div>
      )}
      <div className="p-8">
        <h3 className="text-2xl font-bold mb-4">{cardData?.title || solution.title}</h3>
        <p className="text-text-light mb-4">{cardData?.description || solution.shortDesc}</p>
        <div className="flex items-center gap-2 text-primary font-semibold">
          <span className="transition-transform duration-300" style={{ transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
          <span>{isActive ? 'Voir moins' : 'En savoir plus'}</span>
        </div>
      </div>
    </button>
  );
}

function SolutionDetailPanel({ solution }: { solution: SolutionData | null }) {
  const isOpen = solution !== null;
  const isImageUrl = solution?.image.startsWith('/') || solution?.image.startsWith('http');
  return (
    <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-8' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
      <div className="overflow-hidden">
        {solution && (
          <div className="rounded-2xl shadow-lg p-8 md:p-12" style={{ backgroundColor: solution.backgroundColor || '#ffffff' }}>
            <div className="mb-8 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary-light/10 aspect-video flex items-center justify-center max-w-2xl mx-auto">
              {isImageUrl ? <img src={solution.image} alt={solution.title} className="w-full h-full object-cover" /> : <span className="text-9xl">{solution.image}</span>}
            </div>
            <div className="mb-8 max-w-4xl mx-auto">
              <h4 className="text-2xl font-bold mb-4 text-primary">📝 Description complète</h4>
              <p className="text-text-light leading-relaxed text-lg">{solution.fullDesc}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-8">
              <div className="bg-green-50 rounded-xl p-8">
                <h4 className="text-xl font-bold mb-6 text-green-700 flex items-center gap-3"><span className="text-3xl">✅</span>Avantages</h4>
                <ul className="space-y-3">
                  {solution.pros.map((pro, idx) => (
                    <li key={idx} className="text-text-light flex items-baseline gap-3 text-base"><span className="text-green-600 text-xl flex-shrink-0">•</span><span>{pro}</span></li>
                  ))}
                </ul>
              </div>
              <div className="bg-orange-50 rounded-xl p-8">
                <h4 className="text-xl font-bold mb-6 text-orange-700 flex items-center gap-3"><span className="text-3xl">⚠️</span>Points d'attention</h4>
                <ul className="space-y-3">
                  {solution.cons.map((con, idx) => (
                    <li key={idx} className="text-text-light flex items-baseline gap-3 text-base"><span className="text-orange-600 text-xl flex-shrink-0">•</span><span>{con}</span></li>
                  ))}
                </ul>
              </div>
            </div>
            {solution.showDeviceLinks && solution.deviceLinks && solution.deviceLinks.length > 0 && (
              <div className="max-w-6xl mx-auto mb-8">
                <div className="bg-blue-50 rounded-xl p-8">
                  <h4 className="text-xl font-bold mb-6 text-blue-700 flex items-center gap-3"><span className="text-3xl">🔗</span>Liens vers les appareils de ce type</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {solution.deviceLinks.map((link, idx) => (
                      <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer"
                        className="flex flex-col items-center text-center bg-white rounded-lg p-4 hover:shadow-lg transition-all hover:-translate-y-1 group">
                        {link.imageUrl ? (
                          <div className="w-full aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100">
                            <img src={link.imageUrl} alt={link.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                        ) : (
                          <div className="w-full aspect-square mb-3 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center"><span className="text-4xl">🎧</span></div>
                        )}
                        <span className="text-text font-medium text-sm leading-tight">{link.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {solution.showAccessoryLinks && solution.accessoryLinks && solution.accessoryLinks.length > 0 && (
              <div className="max-w-6xl mx-auto mb-8">
                <div className="bg-purple-50 rounded-xl p-8">
                  <h4 className="text-xl font-bold mb-6 text-purple-700 flex items-center gap-3"><span className="text-3xl">🎧</span>Accessoires disponibles</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {solution.accessoryLinks.map((link, idx) => (
                      <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer"
                        className="flex flex-col items-center text-center bg-white rounded-lg p-4 hover:shadow-lg transition-all hover:-translate-y-1 group">
                        {link.imageUrl ? (
                          <div className="w-full aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100">
                            <img src={link.imageUrl} alt={link.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                        ) : (
                          <div className="w-full aspect-square mb-3 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center"><span className="text-4xl">🔌</span></div>
                        )}
                        <span className="text-text font-medium text-sm leading-tight">{link.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SolutionsAuditives() {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [brandCards, setBrandCards] = useState<CardData[]>([]);
  const [typeCards, setTypeCards] = useState<CardData[]>([]);
  const [solutionDetails, setSolutionDetails] = useState<SolutionDetail[]>([]);
  const [texts, setTexts] = useState<PageTexts>({});

  useEffect(() => {
    fetch('/api/solutions').then(r => r.ok ? r.json() : []).then(setSolutionDetails).catch(() => {});
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const cardsRes = await fetch('/api/card-images?pageKey=solutions-auditives');
        if (cardsRes.ok) {
          const allCards = await cardsRes.json();
          const brands = allCards.filter((c: any) => ['solution-oticon', 'solution-bernafon'].includes(c.cardKey));
          const types = allCards.filter((c: any) => ['solution-contour', 'solution-intra', 'solution-intent'].includes(c.cardKey));
          setBrandCards(brands.length > 0 ? brands : getDefaultBrands());
          setTypeCards(types.length > 0 ? types : getDefaultTypes());
        } else { setBrandCards(getDefaultBrands()); setTypeCards(getDefaultTypes()); }
        const textsRes = await fetch('/api/page-texts?pageKey=solutions-auditives');
        if (textsRes.ok) setTexts(await textsRes.json());
      } catch (error) { setBrandCards(getDefaultBrands()); setTypeCards(getDefaultTypes()); }
    }
    loadData();
  }, []);

  function getDefaultBrands(): CardData[] {
    return [
      { cardKey: 'solution-oticon', imageSrc: '/images/solution-oticon.jpg', title: 'Oticon', description: 'Technologie BrainHearing™, connexion Bluetooth, design discret, batterie rechargeable.', imageAlt: 'Marque Oticon', href: '#', imagePosition: 'center center', fallbackEmoji: '🔵' },
      { cardKey: 'solution-bernafon', imageSrc: '/images/solution-bernafon.jpg', title: 'Bernafon', description: "Excellent rapport qualité/prix, facilité d'utilisation, confort toute la journée.", imageAlt: 'Marque Bernafon', href: '#', imagePosition: 'center center', fallbackEmoji: '🟢' },
    ];
  }
  function getDefaultTypes(): CardData[] {
    return [
      { cardKey: 'solution-contour', imageSrc: '/images/solution-contour.jpg', title: "Le contour d'oreille", description: "Modèle polyvalent et simple d'utilisation", imageAlt: "Contour d'oreille", href: '#', imagePosition: 'center center', fallbackEmoji: '🎧' },
      { cardKey: 'solution-intra', imageSrc: '/images/solution-intra.jpg', title: "L'intra-auriculaire", description: 'Discrétion maximale', imageAlt: 'Intra-auriculaire', href: '#', imagePosition: 'center center', fallbackEmoji: '👁️' },
      { cardKey: 'solution-intent', imageSrc: '/images/solution-intent.jpg', title: 'Oticon Intent', description: 'Adaptation automatique', imageAlt: 'Oticon Intent', href: '#', imagePosition: 'center center', fallbackEmoji: '⭐' },
    ];
  }

  const defaultSolutions: SolutionData[] = [
    { id: 'contour', title: "Le contour d'oreille", icon: "🎧", image: "🎧",
      shortDesc: "Modèle polyvalent et simple d'utilisation, le contour d'oreille se porte derrière le pavillon. Un tube fin relie l'appareil à un embout dans le conduit auditif. Il convient à la grande majorité des pertes auditives.",
      fullDesc: "Grâce à son boîtier positionné derrière l'oreille, le contour d'oreille est facile à manipuler et à entretenir au quotidien. Il peut intégrer une batterie rechargeable et une connexion Bluetooth pour s'associer à votre téléphone, votre télévision ou d'autres accessoires.",
      pros: ["Convient à presque tous les degrés de perte auditive","Facile à manipuler et à entretenir","Batterie rechargeable disponible","Connectivité Bluetooth (TV, téléphone…)","Large choix de teintes discrètes"],
      cons: ["Visible derrière l'oreille","Peut parfois gêner le port de lunettes"] },
    { id: 'intra', title: "L'intra-auriculaire", icon: "👁️", image: "👁️",
      shortDesc: "Fabriqué sur mesure à partir d'une empreinte de votre conduit auditif, l'intra-auriculaire se glisse entièrement dans l'oreille. Sa discrétion en fait le choix préféré des personnes qui souhaitent un appareil quasi invisible.",
      fullDesc: "Positionné directement dans le conduit auditif, l'intra-auriculaire capte les sons de façon naturelle grâce à sa proximité avec le tympan.",
      pros: ["Discrétion maximale","Moulage personnalisé pour un confort optimal","Son naturel grâce à la position dans l'oreille","Pas de gêne avec les lunettes ou le casque"],
      cons: ["Non adapté aux pertes sévères à profondes","Manipulation plus délicate","Entretien fréquent (cérumen)"] },
    { id: 'intent', title: "Oticon Intent", icon: "⭐", image: "⭐",
      shortDesc: "L'Oticon Intent est une aide auditive haut de gamme équipée de capteurs de mouvement. Elle analyse vos gestes et vos déplacements pour adapter l'amplification à chaque situation, sans aucune intervention de votre part.",
      fullDesc: "Doté d'une puce de traitement performante et de quatre capteurs intégrés, l'Oticon Intent détecte en temps réel ce que vous faites et s'ajuste automatiquement.",
      pros: ["Adaptation automatique à chaque situation","Capteurs de mouvement intégrés","Son clair et naturel dans le bruit","Connectivité Bluetooth complète","Batterie rechargeable longue durée","Résistant à l'eau et à la poussière (IP68)"],
      cons: ["Tarif haut de gamme","Nécessite un temps d'adaptation"] },
  ];

  const solutions: SolutionData[] = defaultSolutions.map(sol => {
    const detail = solutionDetails.find(d => d.solutionKey === sol.id);
    if (detail) return { ...sol, fullDesc: detail.fullDesc, image: detail.detailImage || detail.detailEmoji,
      backgroundColor: detail.backgroundColor || undefined, pros: detail.pros, cons: detail.cons,
      deviceLinks: detail.deviceLinks || [], showDeviceLinks: detail.showDeviceLinks !== undefined ? detail.showDeviceLinks : true,
      accessoryLinks: detail.accessoryLinks || [], showAccessoryLinks: detail.showAccessoryLinks !== undefined ? detail.showAccessoryLinks : true };
    return { ...sol, deviceLinks: [], showDeviceLinks: true, accessoryLinks: [], showAccessoryLinks: true };
  });

  return (
    <main className="min-h-screen">
      <InsertZone pageKey="solutions-auditives" slot="page-top" afterOrder={0} />
      <DynamicBlockSlot pageKey="solutions-auditives" slot="page-top" />

      <section data-section="hero" className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span data-edit-block="solutions-auditives.hero-kicker" className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">{texts['hero-kicker'] || 'Nos solutions'}</span>
            <h1 data-edit-block="solutions-auditives.hero-title" className="text-5xl md:text-6xl font-bold mb-6">{texts['hero-title'] || 'Solutions auditives'}</h1>
            <p data-edit-block="solutions-auditives.hero-description" className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">{texts['hero-description'] || 'Chez Audire, nous proposons des solutions Oticon et Bernafon, deux marques reconnues pour leur qualité et leur innovation. Nos appareils sont discrets, performants et adaptés à votre quotidien.'}</p>
          </div>
        </div>
      </section>

      <InsertZone pageKey="solutions-auditives" slot="after-hero" afterOrder={100} />
      <DynamicBlockSlot pageKey="solutions-auditives" slot="after-hero" />

      <AllPageImageEffects pageKey="solutions-auditives" />

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span data-edit-block="solutions-auditives.section-1-kicker" className="inline-block bg-secondary text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">{texts['section-1-kicker'] || 'Nos partenaires'}</span>
            <h2 data-edit-block="solutions-auditives.section-1-title" className="text-4xl font-bold mb-4">{texts['section-1-title'] || 'Oticon & Bernafon'}</h2>
            <p data-edit-block="solutions-auditives.section-1-description" className="text-xl text-text-light max-w-3xl mx-auto">{texts['section-1-description'] || 'Deux marques de référence, reconnues dans le monde entier pour leur innovation et leur qualité.'}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {brandCards.map((card) => (
              <ImageFeatureCard key={card.cardKey} imageSrc={card.imageSrc} title={card.title} description={card.description}
                imageAlt={card.imageAlt} href={card.href} imagePosition={card.imagePosition} fallbackEmoji={card.fallbackEmoji} />
            ))}
          </div>
        </div>
      </section>

      <InsertZone pageKey="solutions-auditives" slot="after-brands" afterOrder={300} />
      <DynamicBlockSlot pageKey="solutions-auditives" slot="after-brands" />

      <section className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 data-edit-block="solutions-auditives.section-2-title" className="text-4xl font-bold mb-4">{texts['section-2-title'] || "Types d'appareils"}</h2>
            <p data-edit-block="solutions-auditives.section-2-description" className="text-xl text-text-light max-w-3xl mx-auto">{texts['section-2-description'] || 'Cliquez sur une carte pour découvrir tous les détails de chaque solution auditive.'}</p>
          </div>
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-4">
              {solutions.map((solution) => {
                const cardData = typeCards.find(c => c.cardKey === `solution-${solution.id}`);
                return <SolutionCard key={solution.id} solution={solution} cardData={cardData}
                  onToggle={() => setActiveTab(activeTab === solution.id ? null : solution.id)} isActive={activeTab === solution.id} />;
              })}
            </div>
            <SolutionDetailPanel solution={solutions.find(s => s.id === activeTab) || null} />
          </div>
        </div>
      </section>

      <InsertZone pageKey="solutions-auditives" slot="before-cta" afterOrder={500} />
      <DynamicBlockSlot pageKey="solutions-auditives" slot="before-cta" />

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 data-edit-block="solutions-auditives.cta-title" className="text-4xl font-bold mb-4">{texts['cta-title'] || 'Trouvez votre solution'}</h2>
          <p data-edit-block="solutions-auditives.cta-description" className="text-xl text-text-light mb-8 max-w-2xl mx-auto">{texts['cta-description'] || 'Chaque personne est unique. Nous prenons le temps de comprendre vos besoins pour vous proposer la solution la plus adaptée.'}</p>
          <a href="/prendre-rendez-vous" className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-dark transition-all shadow-lg">📅 Prendre rendez-vous</a>
        </div>
      </section>

      <InsertZone pageKey="solutions-auditives" slot="page-bottom" afterOrder={900} />
      <DynamicBlockSlot pageKey="solutions-auditives" slot="page-bottom" />
    </main>
  );
}
