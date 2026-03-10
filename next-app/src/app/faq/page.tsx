import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FAQAccordion from "@/components/FAQAccordion";

const faqs = [
  {
    question: "Combien coûte un test auditif ?",
    answer: "Le test auditif est totalement gratuit et sans engagement. Il dure environ 30 minutes et nous permet de comprendre votre situation auditive."
  },
  {
    question: "Les appareils auditifs sont-ils remboursés ?",
    answer: "Oui ! L'INAMI et votre mutuelle interviennent dans le coût de vos appareils auditifs. Le montant du remboursement dépend de votre âge et de votre perte auditive. Nous vous expliquons tout en détail lors de votre rendez-vous."
  },
  {
    question: "Combien de temps dure l'adaptation à un appareil auditif ?",
    answer: "L'adaptation varie selon les personnes, mais en général il faut compter quelques semaines. Nous vous accompagnons tout au long de ce processus avec des rendez-vous de suivi réguliers pour ajuster vos appareils."
  },
  {
    question: "Les appareils auditifs sont-ils discrets ?",
    answer: "Oui ! Les appareils auditifs modernes sont très discrets. Certains modèles sont presque invisibles car ils se placent directement dans le conduit auditif."
  },
  {
    question: "Faut-il porter les appareils toute la journée ?",
    answer: "Idéalement oui, pour que votre cerveau s'habitue aux sons. Cependant, nous adaptons les recommandations à votre rythme et à votre confort."
  },
  {
    question: "Quelle est la durée de vie d'un appareil auditif ?",
    answer: "Un appareil auditif bien entretenu dure en moyenne 5 à 7 ans. Nous assurons le suivi et l'entretien de vos appareils pendant toute leur durée de vie."
  },
  {
    question: "Puis-je essayer avant d'acheter ?",
    answer: "Absolument ! Nous vous proposons une période d'essai pour que vous puissiez tester vos appareils dans votre quotidien avant de vous engager."
  },
  {
    question: "Que faire si j'ai un problème avec mon appareil ?",
    answer: "Contactez-nous ! Nous assurons le service après-vente, les réparations et l'entretien de vos appareils. La plupart des petits problèmes peuvent être résolus rapidement."
  },
  {
    question: "Travaillez-vous avec toutes les mutuelles ?",
    answer: "Oui, nous travaillons avec toutes les mutuelles belges. Nous nous occupons de toutes les démarches administratives pour vous faciliter la vie."
  },
  {
    question: "Faut-il une prescription médicale ?",
    answer: "Oui, une prescription d'un médecin ORL est nécessaire pour obtenir le remboursement de l'INAMI. Si vous n'en avez pas, nous pouvons vous orienter vers un spécialiste."
  },
];

export default function FAQ() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                Vos questions
              </span>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Questions fréquentes
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                Vous vous posez des questions sur les appareils auditifs, les remboursements ou notre accompagnement ?
                Vous trouverez ici les réponses aux questions les plus fréquentes.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <FAQAccordion faqs={faqs} />
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Vous ne trouvez pas votre réponse ?</h2>
            <p className="text-xl text-text-light mb-8 max-w-2xl mx-auto">
              Contactez-nous ! Nous sommes là pour répondre à toutes vos questions.
            </p>
            <a
              href="/contact"
              className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-dark transition-all shadow-lg"
            >
              📞 Nous contacter
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
