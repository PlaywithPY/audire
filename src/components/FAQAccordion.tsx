'use client';

// src/components/FAQAccordion.tsx
// Version éditable : ajoute data-edit-block="faq-item:{id}:question|answer".
// Backward compatible — si l'item n'a pas d'id, c'est un FAQItem ancien (pas éditable).

import { useState } from 'react';

type FAQItem = {
  id?: number;
  question: string;
  answer: string;
};

type FAQAccordionProps = {
  faqs: FAQItem[];
};

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto">
      {faqs.map((faq, index) => (
        <div key={faq.id ?? index} className="mb-4">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full bg-bg hover:bg-bg-alt p-6 rounded-xl text-left transition-all flex justify-between items-center gap-4"
          >
            <span
              className="font-semibold text-lg"
              {...(faq.id ? { 'data-edit-block': `faq-item:${faq.id}:question` } : {})}
            >
              {faq.question}
            </span>
            <svg
              className={`w-6 h-6 text-primary transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIndex === index && (
            <div className="bg-secondary p-6 rounded-b-xl -mt-2 border-t-2 border-primary">
              <p
                className="text-text-light leading-relaxed"
                {...(faq.id ? { 'data-edit-block': `faq-item:${faq.id}:answer` } : {})}
              >
                {faq.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
